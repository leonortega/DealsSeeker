using System.Globalization;
using System.Text.RegularExpressions;
using Dapper;
using DealsSeeker.Api.Persistence;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Offers;
using DealsSeeker.Shared.Models;
using DealsSeeker.Shared.Tags;
using Microsoft.Data.Sqlite;

namespace DealsSeeker.Api.Services.Offers;

public sealed class DapperOfferService(IDbConnectionFactory connectionFactory) : IOfferService
{
    private const string PlaceholderImageUrl = "/images/offer-placeholder.svg";
    private const double FuzzySimilarityThreshold = 0.72d;

    public async Task<SearchOffersResponse> SearchAsync(SearchOffersRequest request, string userId, CancellationToken cancellationToken)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var offerRows = (await connection.QueryAsync<OfferRow>(
            """
            SELECT
                offer_id AS OfferId,
                business_id AS BusinessId,
                business_name AS BusinessName,
                description AS Description,
                image_url AS ImageUrl,
                is_active AS IsActive,
                lat AS Lat,
                lng AS Lng,
                positive_availability_count AS PositiveAvailabilityCount,
                negative_availability_count AS NegativeAvailabilityCount,
                report_count AS ReportCount
            FROM offers
            WHERE is_active = 1;
            """)).ToList();

        if (offerRows.Count == 0)
        {
            return new SearchOffersResponse([], []);
        }

        var offerIds = offerRows.Select(x => x.OfferId).ToArray();

        var tagRows = (await connection.QueryAsync<OfferTagRow>(
            """
            SELECT offer_id AS OfferId, tag AS Tag
            FROM offer_tags
            WHERE offer_id IN @OfferIds;
            """,
            new { OfferIds = offerIds })).ToList();

        var imageRows = (await connection.QueryAsync<OfferImageRow>(
            """
            SELECT
                offer_id AS OfferId,
                image_url AS ImageUrl,
                sort_order AS SortOrder
            FROM offer_images
            WHERE offer_id IN @OfferIds;
            """,
            new { OfferIds = offerIds })).ToList();

        HashSet<string> votedOfferIds = [];
        HashSet<string> favoriteOfferIds = [];
        if (!string.IsNullOrWhiteSpace(userId))
        {
            votedOfferIds = (await connection.QueryAsync<string>(
                """
                SELECT offer_id
                FROM offer_availability_votes
                WHERE user_id = @UserId AND offer_id IN @OfferIds;
                """,
                new { UserId = userId, OfferIds = offerIds }))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            favoriteOfferIds = (await connection.QueryAsync<string>(
                """
                SELECT offer_id
                FROM offer_favorites
                WHERE user_id = @UserId AND offer_id IN @OfferIds;
                """,
                new { UserId = userId, OfferIds = offerIds }))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
        }

        var promotedPriorities = (await connection.QueryAsync<PromotedOfferRow>(
            """
            SELECT
                offer_id AS OfferId,
                priority AS Priority,
                starts_at_utc AS StartsAtUtc,
                ends_at_utc AS EndsAtUtc
            FROM promoted_offers
            WHERE offer_id IN @OfferIds;
            """,
            new { OfferIds = offerIds }))
            .Where(IsPromotionActive)
            .ToDictionary(x => x.OfferId, x => (int)x.Priority, StringComparer.OrdinalIgnoreCase);

        var tagsByOffer = tagRows
            .GroupBy(x => x.OfferId, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<string>)g.Select(x => x.Tag).Distinct(StringComparer.OrdinalIgnoreCase).ToArray(),
                StringComparer.OrdinalIgnoreCase);

        var imageUrlsByOffer = imageRows
            .GroupBy(x => x.OfferId, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<string>)g
                    .OrderBy(x => x.SortOrder)
                    .ThenBy(x => x.ImageUrl, StringComparer.OrdinalIgnoreCase)
                    .Select(x => x.ImageUrl)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToArray(),
                StringComparer.OrdinalIgnoreCase);

        var queryTokens = SplitQuery(request.Query);
        var synonymExpansions = ExpandQueryWithSynonyms(queryTokens, request.Locale);
        var isPreSearch = queryTokens.Count == 0;

        var candidates = offerRows
            .Select(row =>
            {
                var tags = tagsByOffer.TryGetValue(row.OfferId, out var rowTags) ? rowTags : [];
                var imageUrls = imageUrlsByOffer.TryGetValue(row.OfferId, out var rowImages) && rowImages.Count > 0
                    ? rowImages
                    : [string.IsNullOrWhiteSpace(row.ImageUrl) ? PlaceholderImageUrl : row.ImageUrl];
                var location = new GeoPoint(row.Lat, row.Lng);
                var distanceMeters = DistanceMeters(request.UserLocation, location);
                var isFavorite = favoriteOfferIds.Contains(row.OfferId);
                var isPromoted = promotedPriorities.ContainsKey(row.OfferId);
                var isReported = row.ReportCount > 0;

                var terms = BuildSearchTerms(row.Description, tags);
                var matches = EvaluateMatch(
                    terms,
                    queryTokens,
                    synonymExpansions,
                    out var relevanceScore,
                    out var strategies);

                return new OfferCandidate(
                    row,
                    tags,
                    imageUrls,
                    location,
                    distanceMeters,
                    isFavorite,
                    isPromoted,
                    isReported,
                    relevanceScore,
                    strategies,
                    matches);
            })
            .Where(x => x.DistanceMeters <= request.RadiusMeters)
            .Where(x => x.MatchesQuery)
            .Where(x => !request.FavoritesOnly || x.IsFavorite)
            .ToList();

        var orderedOffers = candidates
            .OrderBy(x => x.IsReported ? 1 : 0)
            .ThenByDescending(x => isPreSearch && x.IsPromoted)
            .ThenByDescending(x => !isPreSearch ? x.RelevanceScore : 0d)
            .ThenByDescending(x => x.IsPromoted && !isPreSearch)
            .ThenBy(x => isPreSearch && x.IsPromoted
                ? -GetPromotionPriority(promotedPriorities, x.Row.OfferId)
                : 0)
            .ThenBy(x => x.DistanceMeters)
            .Select(x => new OfferItemDto(
                x.Row.OfferId,
                x.Row.BusinessId,
                x.Row.BusinessName,
                x.Row.Description,
                x.Tags,
                x.ImageUrls[0],
                x.ImageUrls,
                x.Row.IsActive != 0,
                x.IsPromoted,
                x.IsFavorite,
                x.IsReported,
                x.RelevanceScore,
                x.MatchStrategies,
                x.Location,
                x.DistanceMeters,
                (int)x.Row.PositiveAvailabilityCount,
                (int)x.Row.NegativeAvailabilityCount,
                votedOfferIds.Contains(x.Row.OfferId)))
            .ToArray();

        var businesses = orderedOffers
            .GroupBy(x => x.BusinessId, StringComparer.OrdinalIgnoreCase)
            .Select(group =>
            {
                var first = group.OrderBy(x => x.DistanceMeters).First();
                return new BusinessMarkerDto(
                    first.BusinessId,
                    first.BusinessName,
                    first.Location,
                    first.DistanceMeters);
            })
            .OrderBy(x => x.DistanceMeters)
            .ToArray();

        return new SearchOffersResponse(orderedOffers, businesses);
    }

    public async Task<IReadOnlyList<OfferItemDto>> GetOwnedOffersAsync(string userId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return [];
        }

        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        var offerRows = (await connection.QueryAsync<OfferRow>(
            """
            SELECT
                offer_id AS OfferId,
                business_id AS BusinessId,
                business_name AS BusinessName,
                description AS Description,
                image_url AS ImageUrl,
                is_active AS IsActive,
                lat AS Lat,
                lng AS Lng,
                positive_availability_count AS PositiveAvailabilityCount,
                negative_availability_count AS NegativeAvailabilityCount,
                report_count AS ReportCount
            FROM offers
            WHERE created_by_user_id = @UserId
            ORDER BY created_at_utc DESC, offer_id DESC;
            """,
            new { UserId = userId })).ToList();

        if (offerRows.Count == 0)
        {
            return [];
        }

        var offerIds = offerRows.Select(row => row.OfferId).ToArray();
        var tagRows = (await connection.QueryAsync<OfferTagRow>(
            """
            SELECT offer_id AS OfferId, tag AS Tag
            FROM offer_tags
            WHERE offer_id IN @OfferIds;
            """,
            new { OfferIds = offerIds })).ToList();

        var imageRows = (await connection.QueryAsync<OfferImageRow>(
            """
            SELECT
                offer_id AS OfferId,
                image_url AS ImageUrl,
                sort_order AS SortOrder
            FROM offer_images
            WHERE offer_id IN @OfferIds;
            """,
            new { OfferIds = offerIds })).ToList();

        var tagsByOffer = tagRows
            .GroupBy(row => row.OfferId, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyList<string>)group.Select(row => row.Tag).Distinct(StringComparer.OrdinalIgnoreCase).ToArray(),
                StringComparer.OrdinalIgnoreCase);

        var imageUrlsByOffer = imageRows
            .GroupBy(row => row.OfferId, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyList<string>)group
                    .OrderBy(row => row.SortOrder)
                    .ThenBy(row => row.ImageUrl, StringComparer.OrdinalIgnoreCase)
                    .Select(row => row.ImageUrl)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToArray(),
                StringComparer.OrdinalIgnoreCase);

        return offerRows
            .Select(row =>
            {
                var imageUrls = imageUrlsByOffer.GetValueOrDefault(row.OfferId) ?? [row.ImageUrl];
                return new OfferItemDto(
                    row.OfferId,
                    row.BusinessId,
                    row.BusinessName,
                    row.Description,
                    tagsByOffer.GetValueOrDefault(row.OfferId) ?? [],
                    imageUrls.FirstOrDefault() ?? row.ImageUrl,
                    imageUrls,
                    row.IsActive != 0,
                    false,
                    false,
                    row.ReportCount > 0,
                    0d,
                    ["exact"],
                    new GeoPoint(row.Lat, row.Lng),
                    0d,
                    (int)row.PositiveAvailabilityCount,
                    (int)row.NegativeAvailabilityCount,
                    false);
            })
            .ToArray();
    }

    public async Task<AddOfferRequest?> GetOwnedOfferDraftAsync(string offerId, string userId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(offerId))
        {
            return null;
        }

        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        var offer = await connection.QuerySingleOrDefaultAsync<OwnedOfferDraftRow>(
            """
            SELECT
                offer_id AS OfferId,
                business_name AS BusinessName,
                description AS Description,
                lat AS Lat,
                lng AS Lng
            FROM offers
            WHERE offer_id = @OfferId AND created_by_user_id = @UserId
            LIMIT 1;
            """,
            new { OfferId = offerId, UserId = userId });

        if (offer is null)
        {
            return null;
        }

        var tags = (await connection.QueryAsync<string>(
            """
            SELECT tag
            FROM offer_tags
            WHERE offer_id = @OfferId
            ORDER BY tag;
            """,
            new { OfferId = offerId }))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var images = (await connection.QueryAsync<OwnedOfferImageRow>(
            """
            SELECT
                image_url AS ImageUrl,
                mime_type AS MimeType,
                width AS Width,
                height AS Height,
                sort_order AS SortOrder
            FROM offer_images
            WHERE offer_id = @OfferId
            ORDER BY sort_order ASC, image_url ASC;
            """,
            new { OfferId = offerId }))
            .Select(image => new OfferImageDto(
                Source: "gallery",
                MimeType: ResolveOwnedImageMimeType(image.ImageUrl, image.MimeType),
                SizeBytes: 1,
                Width: image.Width is null ? null : (int?)image.Width,
                Height: image.Height is null ? null : (int?)image.Height,
                Order: (int)image.SortOrder,
                FileName: null,
                DataUrl: image.ImageUrl))
            .ToArray();

        return new AddOfferRequest(
            offer.Description,
            tags,
            images,
            new OfferLocationDto("manual-confirmed", offer.BusinessName, new GeoPoint(offer.Lat, offer.Lng)));
    }

    public async Task<CommandResult> VoteAvailabilityAsync(string offerId, string userId, OfferAvailabilityVoteRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return new CommandResult(false, "Authenticated user is required.");
        }

        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        await using var transaction = connection.BeginTransaction();
        try
        {
            var offerExists = await connection.ExecuteScalarAsync<long>(
                "SELECT COUNT(1) FROM offers WHERE offer_id = @OfferId;",
                new { OfferId = offerId },
                transaction);
            if (offerExists == 0)
            {
                await transaction.RollbackAsync(cancellationToken);
                return new CommandResult(false, "Offer not found.");
            }

            try
            {
                await connection.ExecuteAsync(
                    """
                    INSERT INTO offer_availability_votes (offer_id, user_id, vote_type, voted_at_utc)
                    VALUES (@OfferId, @UserId, @VoteType, @VotedAtUtc);
                    """,
                    new
                    {
                        OfferId = offerId,
                        UserId = userId,
                        VoteType = (int)request.Vote,
                        VotedAtUtc = DateTimeOffset.UtcNow.ToString("O")
                    },
                    transaction);
            }
            catch (SqliteException ex) when (ex.SqliteErrorCode == 19)
            {
                await transaction.RollbackAsync(cancellationToken);
                return new CommandResult(false, "Availability feedback already submitted for this offer.");
            }

            await connection.ExecuteAsync(
                """
                UPDATE offers
                SET
                    positive_availability_count = positive_availability_count + CASE WHEN @VoteType = 1 THEN 1 ELSE 0 END,
                    negative_availability_count = negative_availability_count + CASE WHEN @VoteType = 2 THEN 1 ELSE 0 END
                WHERE offer_id = @OfferId;
                """,
                new { OfferId = offerId, VoteType = (int)request.Vote },
                transaction);

            await transaction.CommitAsync(cancellationToken);
            return new CommandResult(true, "Availability feedback registered.");
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<CommandResult> ReportAsync(string offerId, ReportOfferRequest request, CancellationToken cancellationToken)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        await using var transaction = connection.BeginTransaction();
        try
        {
            var affectedRows = await connection.ExecuteAsync(
                """
                UPDATE offers
                SET report_count = report_count + 1
                WHERE offer_id = @OfferId;
                """,
                new { OfferId = offerId },
                transaction);

            if (affectedRows == 0)
            {
                await transaction.RollbackAsync(cancellationToken);
                return new CommandResult(false, "Offer not found.");
            }

            await connection.ExecuteAsync(
                """
                INSERT INTO offer_reports (offer_id, reason, created_at_utc)
                VALUES (@OfferId, @Reason, @CreatedAtUtc);
                """,
                new
                {
                    OfferId = offerId,
                    Reason = request.Reason?.Trim() ?? string.Empty,
                    CreatedAtUtc = DateTimeOffset.UtcNow.ToString("O")
                },
                transaction);

            await transaction.CommitAsync(cancellationToken);
            return new CommandResult(true, "Report registered.");
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<CommandResult> SetFavoriteAsync(string offerId, string userId, SetFavoriteRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return new CommandResult(false, "Authenticated user is required.");
        }

        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var offerExists = await connection.ExecuteScalarAsync<long>(
            "SELECT COUNT(1) FROM offers WHERE offer_id = @OfferId;",
            new { OfferId = offerId });
        if (offerExists == 0)
        {
            return new CommandResult(false, "Offer not found.");
        }

        if (request.IsFavorite)
        {
            await connection.ExecuteAsync(
                """
                INSERT OR IGNORE INTO offer_favorites (user_id, offer_id, created_at_utc)
                VALUES (@UserId, @OfferId, @CreatedAtUtc);
                """,
                new
                {
                    UserId = userId,
                    OfferId = offerId,
                    CreatedAtUtc = DateTimeOffset.UtcNow.ToString("O")
                });

            return new CommandResult(true, "Offer saved to favorites.");
        }

        await connection.ExecuteAsync(
            """
            DELETE FROM offer_favorites
            WHERE user_id = @UserId AND offer_id = @OfferId;
            """,
            new { UserId = userId, OfferId = offerId });

        return new CommandResult(true, "Offer removed from favorites.");
    }

    public async Task<OfferItemDto> AddAsync(AddOfferRequest request, string userId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new InvalidOperationException("Authenticated user is required.");
        }

        var offerId = $"off-{Guid.NewGuid():N}"[..12];
        var businessId = $"biz-{offerId[4..8]}";
        var normalizedOffer = NormalizeOfferRequest(request);
        var businessName = normalizedOffer.BusinessName;
        var description = normalizedOffer.Description;
        var location = normalizedOffer.Location;
        var normalizedTags = normalizedOffer.Tags;
        var normalizedImages = normalizedOffer.Images;
        var primaryImageUrl = normalizedImages[0].ImageUrl;

        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        await using var transaction = connection.BeginTransaction();
        try
        {
            await connection.ExecuteAsync(
                """
                INSERT INTO offers (
                    offer_id, business_id, business_name, description, image_url, is_active, lat, lng,
                    positive_availability_count, negative_availability_count, report_count, created_at_utc, created_by_user_id
                ) VALUES (
                    @OfferId, @BusinessId, @BusinessName, @Description, @ImageUrl, 1, @Lat, @Lng,
                    0, 0, 0, @CreatedAtUtc, @CreatedByUserId
                );
                """,
                new
                {
                    OfferId = offerId,
                    BusinessId = businessId,
                    BusinessName = businessName,
                    Description = description,
                    ImageUrl = primaryImageUrl,
                    Lat = location.Lat,
                    Lng = location.Lng,
                    CreatedAtUtc = DateTimeOffset.UtcNow.ToString("O"),
                    CreatedByUserId = userId
                },
                transaction);

            if (normalizedTags.Count > 0)
            {
                await connection.ExecuteAsync(
                    """
                    INSERT INTO offer_tags (offer_id, tag)
                    VALUES (@OfferId, @Tag);
                    """,
                    normalizedTags.Select(tag => new { OfferId = offerId, Tag = tag }),
                    transaction);
            }

            await connection.ExecuteAsync(
                """
                INSERT INTO offer_images (offer_id, image_url, mime_type, width, height, sort_order, created_at_utc)
                VALUES (@OfferId, @ImageUrl, @MimeType, @Width, @Height, @SortOrder, @CreatedAtUtc);
                """,
                normalizedImages.Select(image => new
                {
                    OfferId = offerId,
                    image.ImageUrl,
                    image.MimeType,
                    image.Width,
                    image.Height,
                    SortOrder = image.SortOrder,
                    CreatedAtUtc = DateTimeOffset.UtcNow.ToString("O")
                }),
                transaction);

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        return new OfferItemDto(
            offerId,
            businessId,
            businessName,
            description,
            normalizedTags,
            primaryImageUrl,
            normalizedImages.Select(x => x.ImageUrl).ToArray(),
            true,
            false,
            false,
            false,
            0d,
            ["exact"],
            location,
            0,
            0,
            0,
            false);
    }

    public async Task<OfferItemDto?> UpdateAsync(string offerId, AddOfferRequest request, string userId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(offerId))
        {
            return null;
        }

        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        var existing = await connection.QuerySingleOrDefaultAsync<OwnedOfferIdentityRow>(
            """
            SELECT offer_id AS OfferId, business_id AS BusinessId, business_name AS BusinessName
            FROM offers
            WHERE offer_id = @OfferId AND created_by_user_id = @UserId
            LIMIT 1;
            """,
            new { OfferId = offerId, UserId = userId });

        if (existing is null)
        {
            return null;
        }

        var normalizedOffer = NormalizeOfferRequest(request, existing.BusinessName);
        var primaryImageUrl = normalizedOffer.Images[0].ImageUrl;

        await using var transaction = connection.BeginTransaction();
        try
        {
            await connection.ExecuteAsync(
                """
                UPDATE offers
                SET business_name = @BusinessName,
                    description = @Description,
                    image_url = @ImageUrl,
                    lat = @Lat,
                    lng = @Lng
                WHERE offer_id = @OfferId AND created_by_user_id = @UserId;
                """,
                new
                {
                    OfferId = offerId,
                    UserId = userId,
                    BusinessName = normalizedOffer.BusinessName,
                    Description = normalizedOffer.Description,
                    ImageUrl = primaryImageUrl,
                    Lat = normalizedOffer.Location.Lat,
                    Lng = normalizedOffer.Location.Lng
                },
                transaction);

            await connection.ExecuteAsync(
                "DELETE FROM offer_tags WHERE offer_id = @OfferId;",
                new { OfferId = offerId },
                transaction);

            if (normalizedOffer.Tags.Count > 0)
            {
                await connection.ExecuteAsync(
                    """
                    INSERT INTO offer_tags (offer_id, tag)
                    VALUES (@OfferId, @Tag);
                    """,
                    normalizedOffer.Tags.Select(tag => new { OfferId = offerId, Tag = tag }),
                    transaction);
            }

            await connection.ExecuteAsync(
                "DELETE FROM offer_images WHERE offer_id = @OfferId;",
                new { OfferId = offerId },
                transaction);

            await connection.ExecuteAsync(
                """
                INSERT INTO offer_images (offer_id, image_url, mime_type, width, height, sort_order, created_at_utc)
                VALUES (@OfferId, @ImageUrl, @MimeType, @Width, @Height, @SortOrder, @CreatedAtUtc);
                """,
                normalizedOffer.Images.Select(image => new
                {
                    OfferId = offerId,
                    image.ImageUrl,
                    image.MimeType,
                    image.Width,
                    image.Height,
                    SortOrder = image.SortOrder,
                    CreatedAtUtc = DateTimeOffset.UtcNow.ToString("O")
                }),
                transaction);

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        return new OfferItemDto(
            offerId,
            existing.BusinessId,
            normalizedOffer.BusinessName,
            normalizedOffer.Description,
            normalizedOffer.Tags,
            primaryImageUrl,
            normalizedOffer.Images.Select(image => image.ImageUrl).ToArray(),
            true,
            false,
            false,
            false,
            0d,
            ["exact"],
            normalizedOffer.Location,
            0d,
            0,
            0,
            false);
    }

    public async Task<CommandResult> DeleteAsync(string offerId, string userId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(offerId))
        {
            return new CommandResult(false, "Offer not found.");
        }

        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        var rowsAffected = await connection.ExecuteAsync(
            """
            DELETE FROM offers
            WHERE offer_id = @OfferId AND created_by_user_id = @UserId;
            """,
            new { OfferId = offerId, UserId = userId });

        return rowsAffected > 0
            ? new CommandResult(true, "Offer removed.")
            : new CommandResult(false, "Offer not found.");
    }

    private static IReadOnlyList<string> SplitQuery(string query) =>
        Regex.Split(query ?? string.Empty, "\\s+")
            .Select(word => NormalizeSearchTerm(word))
            .Where(word => !string.IsNullOrWhiteSpace(word))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

    private static IReadOnlyDictionary<string, IReadOnlyList<string>> ExpandQueryWithSynonyms(
        IReadOnlyList<string> queryTokens,
        string? locale) =>
        TagLexicon.ExpandQueryWithRelatedTerms(queryTokens, locale);

    private static IReadOnlyList<string> BuildSearchTerms(string description, IReadOnlyList<string> tags)
    {
        var terms = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var tag in tags)
        {
            var normalizedTag = NormalizeSearchTerm(tag);
            if (normalizedTag.Length > 0)
            {
                terms.Add(normalizedTag);
            }
        }

        foreach (Match match in Regex.Matches(description ?? string.Empty, "[\\p{L}\\p{Nd}%]+"))
        {
            var normalizedWord = NormalizeSearchTerm(match.Value);
            if (normalizedWord.Length > 0)
            {
                terms.Add(normalizedWord);
            }
        }

        return terms.ToArray();
    }

    private static bool EvaluateMatch(
        IReadOnlyList<string> terms,
        IReadOnlyList<string> queryTokens,
        IReadOnlyDictionary<string, IReadOnlyList<string>> synonymExpansions,
        out double relevanceScore,
        out IReadOnlyList<string> strategies)
    {
        if (queryTokens.Count == 0)
        {
            relevanceScore = 0d;
            strategies = ["exact"];
            return true;
        }

        var matchedStrategies = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var scoreSum = 0d;

        foreach (var token in queryTokens)
        {
            var tokenScore = 0d;
            string? tokenStrategy = null;

            if (terms.Any(term => term.Contains(token, StringComparison.OrdinalIgnoreCase)))
            {
                tokenScore = 1d;
                tokenStrategy = "exact";
            }

            if (synonymExpansions.TryGetValue(token, out var synonyms) && synonyms.Count > 0)
            {
                var hasSynonymMatch = synonyms.Any(synonym =>
                    terms.Any(term => term.Contains(synonym, StringComparison.OrdinalIgnoreCase)));
                if (hasSynonymMatch && tokenScore < 0.88d)
                {
                    tokenScore = 0.88d;
                    tokenStrategy = "synonym";
                }
            }

            var bestFuzzy = 0d;
            foreach (var term in terms)
            {
                var ratio = SimilarityRatio(token, term);
                if (ratio > bestFuzzy)
                {
                    bestFuzzy = ratio;
                }
            }

            if (bestFuzzy >= FuzzySimilarityThreshold)
            {
                var fuzzyScore = 0.6d + (bestFuzzy * 0.3d);
                if (fuzzyScore > tokenScore)
                {
                    tokenScore = fuzzyScore;
                    tokenStrategy = "fuzzy";
                }
            }

            if (tokenStrategy is null)
            {
                relevanceScore = 0d;
                strategies = [];
                return false;
            }

            matchedStrategies.Add(tokenStrategy);
            scoreSum += tokenScore;
        }

        relevanceScore = Math.Round(scoreSum / queryTokens.Count, 4, MidpointRounding.AwayFromZero);
        strategies = matchedStrategies
            .OrderBy(x => x, StringComparer.OrdinalIgnoreCase)
            .ToArray();
        return true;
    }

    private static double SimilarityRatio(string left, string right)
    {
        if (left.Length == 0 && right.Length == 0)
        {
            return 1d;
        }

        var maxLength = Math.Max(left.Length, right.Length);
        if (maxLength == 0)
        {
            return 1d;
        }

        var distance = LevenshteinDistance(left, right);
        return 1d - ((double)distance / maxLength);
    }

    private static int LevenshteinDistance(string source, string target)
    {
        var sourceLength = source.Length;
        var targetLength = target.Length;

        var matrix = new int[sourceLength + 1, targetLength + 1];
        for (var i = 0; i <= sourceLength; i++)
        {
            matrix[i, 0] = i;
        }

        for (var j = 0; j <= targetLength; j++)
        {
            matrix[0, j] = j;
        }

        for (var i = 1; i <= sourceLength; i++)
        {
            for (var j = 1; j <= targetLength; j++)
            {
                var cost = source[i - 1] == target[j - 1] ? 0 : 1;
                matrix[i, j] = Math.Min(
                    Math.Min(matrix[i - 1, j] + 1, matrix[i, j - 1] + 1),
                    matrix[i - 1, j - 1] + cost);
            }
        }

        return matrix[sourceLength, targetLength];
    }

    private static bool IsPromotionActive(PromotedOfferRow row)
    {
        var now = DateTimeOffset.UtcNow;
        if (!TryParseDateTimeOffset(row.StartsAtUtc, out var startsAt))
        {
            startsAt = DateTimeOffset.MinValue;
        }

        if (!TryParseDateTimeOffset(row.EndsAtUtc, out var endsAt))
        {
            endsAt = DateTimeOffset.MaxValue;
        }

        return now >= startsAt && now <= endsAt;
    }

    private static bool TryParseDateTimeOffset(string? value, out DateTimeOffset parsed)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            parsed = default;
            return false;
        }

        return DateTimeOffset.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out parsed);
    }

    private static int GetPromotionPriority(IReadOnlyDictionary<string, int> promotedPriorities, string offerId) =>
        promotedPriorities.TryGetValue(offerId, out var priority) ? priority : 0;

    private static NormalizedOfferRequest NormalizeOfferRequest(AddOfferRequest request, string? fallbackBusinessName = null)
    {
        var businessName = request.Location?.Label?.Trim();
        if (string.IsNullOrWhiteSpace(businessName))
        {
            businessName = string.IsNullOrWhiteSpace(fallbackBusinessName)
                ? "User Submitted Business"
                : fallbackBusinessName.Trim();
        }

        var description = request.Description?.Trim() ?? string.Empty;
        var location = request.Location?.Position ?? new GeoPoint(40.7128, -74.0060);
        var normalizedTags = request.Tags
            .Select(NormalizeTag)
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        var normalizedImages = NormalizeImages(request.Images ?? []);

        return new NormalizedOfferRequest(
            businessName,
            description,
            location,
            normalizedTags,
            normalizedImages);
    }

    private static IReadOnlyList<NormalizedImage> NormalizeImages(IReadOnlyList<OfferImageDto> images)
    {
        var normalized = images
            .Where(image => !string.IsNullOrWhiteSpace(image.DataUrl))
            .Select((image, index) => new NormalizedImage(
                ImageUrl: image.DataUrl!,
                MimeType: image.MimeType,
                Width: image.Width,
                Height: image.Height,
                SortOrder: image.Order >= 0 ? image.Order : index))
            .OrderBy(image => image.SortOrder)
            .ToArray();

        if (normalized.Length > 0)
        {
            return normalized;
        }

        return [new NormalizedImage(PlaceholderImageUrl, "image/svg+xml", null, null, 0)];
    }

    private static double DistanceMeters(GeoPoint from, GeoPoint to)
    {
        const double earthRadiusMeters = 6371000;
        var dLat = DegreesToRadians(to.Lat - from.Lat);
        var dLng = DegreesToRadians(to.Lng - from.Lng);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(DegreesToRadians(from.Lat)) * Math.Cos(DegreesToRadians(to.Lat)) *
                Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return earthRadiusMeters * c;
    }

    private static double DegreesToRadians(double degrees) => degrees * Math.PI / 180;

    private static string NormalizeTag(string value) => TagLexicon.NormalizeTag(value);

    private static string NormalizeSearchTerm(string value) => TagLexicon.NormalizeSearchTerm(value);

    private static string ResolveOwnedImageMimeType(string imageUrl, string? mimeType)
    {
        if (!string.IsNullOrWhiteSpace(mimeType))
        {
            return mimeType;
        }

        if (imageUrl.EndsWith(".svg", StringComparison.OrdinalIgnoreCase))
        {
            return "image/svg+xml";
        }

        if (imageUrl.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
        {
            return "image/png";
        }

        if (imageUrl.EndsWith(".gif", StringComparison.OrdinalIgnoreCase))
        {
            return "image/gif";
        }

        if (imageUrl.EndsWith(".webp", StringComparison.OrdinalIgnoreCase))
        {
            return "image/webp";
        }

        return "image/jpeg";
    }

    private sealed record OfferRow(
        string OfferId,
        string BusinessId,
        string BusinessName,
        string Description,
        string ImageUrl,
        long IsActive,
        double Lat,
        double Lng,
        long PositiveAvailabilityCount,
        long NegativeAvailabilityCount,
        long ReportCount);

    private sealed record OfferTagRow(string OfferId, string Tag);

    private sealed record OfferImageRow(string OfferId, string ImageUrl, long SortOrder);

    private sealed class OwnedOfferImageRow
    {
        public string ImageUrl { get; init; } = string.Empty;

        public string? MimeType { get; init; }

        public long? Width { get; init; }

        public long? Height { get; init; }

        public long SortOrder { get; init; }
    }

    private sealed record OwnedOfferDraftRow(string OfferId, string BusinessName, string Description, double Lat, double Lng);

    private sealed record OwnedOfferIdentityRow(string OfferId, string BusinessId, string BusinessName);

    private sealed record PromotedOfferRow(string OfferId, long Priority, string? StartsAtUtc, string? EndsAtUtc);

    private sealed record OfferCandidate(
        OfferRow Row,
        IReadOnlyList<string> Tags,
        IReadOnlyList<string> ImageUrls,
        GeoPoint Location,
        double DistanceMeters,
        bool IsFavorite,
        bool IsPromoted,
        bool IsReported,
        double RelevanceScore,
        IReadOnlyList<string> MatchStrategies,
        bool MatchesQuery);

    private sealed record NormalizedImage(
        string ImageUrl,
        string MimeType,
        int? Width,
        int? Height,
        int SortOrder);

    private sealed record NormalizedOfferRequest(
        string BusinessName,
        string Description,
        GeoPoint Location,
        IReadOnlyList<string> Tags,
        IReadOnlyList<NormalizedImage> Images);
}
