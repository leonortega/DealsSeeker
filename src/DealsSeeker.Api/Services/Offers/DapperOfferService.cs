using System.Globalization;
using System.Text.RegularExpressions;
using Dapper;
using DealsSeeker.Api.Caching;
using DealsSeeker.Api.Persistence;
using DealsSeeker.Api.Validation;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Offers;
using DealsSeeker.Shared.Models;
using DealsSeeker.Shared.Tags;
using Microsoft.Data.Sqlite;

namespace DealsSeeker.Api.Services.Offers;

public sealed class DapperOfferService(
    IDbConnectionFactory connectionFactory,
    ICacheService cache) : IOfferService
{
    private const string PlaceholderImageUrl = "/images/offer-placeholder.svg";
    private const double FuzzySimilarityThreshold = 0.72d;
    private const int MaxSearchTerms = 48;
    private const int MaxQueryTokens = 12;
    private const int SqlParameterChunkSize = 400;

    private static readonly System.Diagnostics.Metrics.Meter SearchMeter =
        new("DealsSeeker.Api.Search");

    public async Task<SearchOffersResponse> SearchAsync(
        SearchOffersRequest request,
        string userId,
        CancellationToken cancellationToken)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, RequestLimits.MaxSearchPageSize);

        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;

        var (minLat, maxLat, minLng, maxLng, wrapsLongitude) = BoundingBox(request.UserLocation, request.RadiusMeters);

        var offerRows = await QueryCandidatesAsync(connection, minLat, maxLat, minLng, maxLng, wrapsLongitude);
        if (offerRows.Count == 0)
        {
            return new SearchOffersResponse([], [], page, pageSize, false);
        }

        var documentsByOffer = await LoadSearchDocumentsAsync(connection, offerRows, cancellationToken);
        var promotionPriorities = await GetActivePromotionPrioritiesAsync(connection, cancellationToken);

        var queryTokens = SplitQuery(request.Query);
        var synonymExpansions = ExpandQueryWithSynonyms(queryTokens, request.Locale);
        var isPreSearch = queryTokens.Count == 0;

        var votedOfferIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var favoriteOfferIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        var candidates = new List<OfferCandidate>(offerRows.Count);
        foreach (var row in offerRows)
        {
            var document = documentsByOffer.GetValueOrDefault(row.OfferId) ?? OfferSearchDocument.Empty;
            var distanceMeters = DistanceMeters(request.UserLocation, new GeoPoint(row.Lat, row.Lng));
            if (distanceMeters > request.RadiusMeters)
            {
                continue;
            }

            var matches = EvaluateMatch(document.Terms, queryTokens, synonymExpansions, out var relevanceScore, out var strategies);
            if (!matches)
            {
                continue;
            }

            candidates.Add(new OfferCandidate(
                row,
                document.Tags,
                distanceMeters,
                isPreSearch,
                promotionPriorities.ContainsKey(row.OfferId),
                row.ReportCount > 0,
                relevanceScore,
                strategies));
        }

        if (request.FavoritesOnly && !string.IsNullOrWhiteSpace(userId))
        {
            await LoadUserOfferStateAsync(connection, userId, candidates.Select(x => x.Row.OfferId), votedOfferIds, favoriteOfferIds);
            candidates = candidates.Where(x => favoriteOfferIds.Contains(x.Row.OfferId)).ToList();
        }

        var ranked = candidates
            .OrderBy(x => x.IsReported ? 1 : 0)
            .ThenByDescending(x => x.IsPreSearch && x.IsPromoted)
            .ThenByDescending(x => x.IsPreSearch ? 0d : x.RelevanceScore)
            .ThenByDescending(x => x.IsPromoted && !x.IsPreSearch)
            .ThenBy(x => x.IsPreSearch && x.IsPromoted ? -GetPromotionPriority(promotionPriorities, x.Row.OfferId) : 0)
            .ThenBy(x => x.DistanceMeters)
            .ThenBy(x => x.Row.OfferId, StringComparer.OrdinalIgnoreCase)
            .ToList();

        // The map keeps showing every offer that matches the active query and radius, not only the page.
        var businesses = ranked
            .GroupBy(x => x.Row.BusinessId, StringComparer.OrdinalIgnoreCase)
            .Select(group =>
            {
                var nearest = group.OrderBy(x => x.DistanceMeters).First();
                return new BusinessMarkerDto(
                    nearest.Row.BusinessId,
                    nearest.Row.BusinessName,
                    new GeoPoint(nearest.Row.Lat, nearest.Row.Lng),
                    nearest.DistanceMeters);
            })
            .OrderBy(x => x.DistanceMeters)
            .ToArray();

        var pageItems = ranked
            .Skip((page - 1) * pageSize)
            .Take(pageSize + 1)
            .ToList();

        var hasMore = pageItems.Count > pageSize;
        if (hasMore)
        {
            pageItems.RemoveAt(pageItems.Count - 1);
        }

        if (pageItems.Count == 0)
        {
            return new SearchOffersResponse([], businesses, page, pageSize, false);
        }

        var pageOfferIds = pageItems.Select(x => x.Row.OfferId).ToArray();

        var imageUrlsByOffer = await LoadImageUrlsAsync(connection, pageOfferIds);
        await LoadUserOfferStateAsync(connection, userId, pageOfferIds, votedOfferIds, favoriteOfferIds);

        var orderedOffers = pageItems
            .Select(x =>
            {
                var imageUrls = imageUrlsByOffer.TryGetValue(x.Row.OfferId, out var rowImages)
                    ? EnsureDisplayImageUrls(rowImages)
                    : EnsureDisplayImageUrls([]);

                return new OfferItemDto(
                    x.Row.OfferId,
                    x.Row.BusinessId,
                    x.Row.BusinessName,
                    x.Row.Description,
                    x.Tags,
                    imageUrls[0],
                    imageUrls,
                    x.Row.IsActive != 0,
                    x.IsPromoted,
                    favoriteOfferIds.Contains(x.Row.OfferId),
                    x.IsReported,
                    x.RelevanceScore,
                    x.MatchStrategies,
                    new GeoPoint(x.Row.Lat, x.Row.Lng),
                    x.DistanceMeters,
                    (int)x.Row.PositiveAvailabilityCount,
                    (int)x.Row.NegativeAvailabilityCount,
                    votedOfferIds.Contains(x.Row.OfferId));
            })
            .ToArray();

        SearchMeter.CreateCounter<long>("dealseeker.search.candidates", "c", "Offers examined by a search.")
            .Add(candidates.Count);
        SearchMeter.CreateCounter<long>("dealseeker.search.results", "c", "Offers returned by a search.")
            .Add(orderedOffers.Length);

        return new SearchOffersResponse(orderedOffers, businesses, page, pageSize, hasMore);
    }

    public async Task<IReadOnlyList<OfferItemDto>> GetOwnedOffersAsync(string userId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return [];
        }

        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;
        var offerRows = (await connection.QueryAsync<OfferRow>(
            """
            SELECT
                offer_id AS OfferId,
                business_id AS BusinessId,
                business_name AS BusinessName,
                description AS Description,
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
        var tagRows = await QueryTagsAsync(connection, offerIds);
        var imageRows = await QueryImagesAsync(connection, offerIds);

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
                var imageUrls = imageUrlsByOffer.TryGetValue(row.OfferId, out var rowImages)
                    ? EnsureDisplayImageUrls(rowImages)
                    : EnsureDisplayImageUrls([]);
                return new OfferItemDto(
                    row.OfferId,
                    row.BusinessId,
                    row.BusinessName,
                    row.Description,
                    tagsByOffer.GetValueOrDefault(row.OfferId) ?? [],
                    imageUrls[0],
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

        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;
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

    public async Task<CommandResult> VoteAvailabilityAsync(
        string offerId,
        string userId,
        OfferAvailabilityVoteRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return new CommandResult(false, "Authenticated user is required.");
        }

        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;
        await using var transaction = connection.BeginTransaction(deferred: false);
        try
        {
            // The offer existence check is folded into the insert, so a vote costs one statement.
            var inserted = await connection.ExecuteAsync(
                """
                INSERT INTO offer_availability_votes (offer_id, user_id, vote_type, voted_at_utc)
                SELECT @OfferId, @UserId, @VoteType, @VotedAtUtc
                WHERE EXISTS (SELECT 1 FROM offers WHERE offer_id = @OfferId);
                """,
                new
                {
                    OfferId = offerId,
                    UserId = userId,
                    VoteType = (int)request.Vote,
                    VotedAtUtc = Timestamp.NowUtc()
                },
                transaction);

            if (inserted == 0)
            {
                await transaction.RollbackAsync(cancellationToken);
                return new CommandResult(false, "Offer not found.");
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
        catch (SqliteException ex) when (ex.SqliteErrorCode == 19)
        {
            await transaction.RollbackAsync(cancellationToken);
            return new CommandResult(false, "Availability feedback already submitted for this offer.");
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<CommandResult> ReportAsync(string offerId, ReportOfferRequest request, CancellationToken cancellationToken)
    {
        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;
        await using var transaction = connection.BeginTransaction(deferred: false);
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
                    CreatedAtUtc = Timestamp.NowUtc()
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

    public async Task<CommandResult> SetFavoriteAsync(
        string offerId,
        string userId,
        SetFavoriteRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return new CommandResult(false, "Authenticated user is required.");
        }

        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;

        if (request.IsFavorite)
        {
            var inserted = await connection.ExecuteAsync(
                """
                INSERT OR IGNORE INTO offer_favorites (user_id, offer_id, created_at_utc)
                SELECT @UserId, @OfferId, @CreatedAtUtc
                WHERE EXISTS (SELECT 1 FROM offers WHERE offer_id = @OfferId);
                """,
                new
                {
                    UserId = userId,
                    OfferId = offerId,
                    CreatedAtUtc = Timestamp.NowUtc()
                });

            if (inserted == 0)
            {
                // Either the offer does not exist, or it was already saved. Only the first is a failure.
                var exists = await connection.ExecuteScalarAsync<long>(
                    "SELECT COUNT(1) FROM offers WHERE offer_id = @OfferId;",
                    new { OfferId = offerId });

                if (exists == 0)
                {
                    return new CommandResult(false, "Offer not found.");
                }
            }

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
        var imageUrls = normalizedImages.Select(x => x.ImageUrl).ToArray();
        var displayImageUrls = EnsureDisplayImageUrls(imageUrls);

        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;
        await using var transaction = connection.BeginTransaction(deferred: false);
        try
        {
            await connection.ExecuteAsync(
                """
                INSERT INTO offers (
                    offer_id, business_id, business_name, description, is_active, lat, lng,
                    positive_availability_count, negative_availability_count, report_count, created_at_utc, created_by_user_id
                ) VALUES (
                    @OfferId, @BusinessId, @BusinessName, @Description, 1, @Lat, @Lng,
                    0, 0, 0, @CreatedAtUtc, @CreatedByUserId
                );
                """,
                new
                {
                    OfferId = offerId,
                    BusinessId = businessId,
                    BusinessName = businessName,
                    Description = description,
                    Lat = location.Lat,
                    Lng = location.Lng,
                    CreatedAtUtc = Timestamp.NowUtc(),
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

            if (normalizedImages.Count > 0)
            {
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
                        CreatedAtUtc = Timestamp.NowUtc()
                    }),
                    transaction);
            }

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        InvalidateSearchDocument(offerId);

        return new OfferItemDto(
            offerId,
            businessId,
            businessName,
            description,
            normalizedTags,
            displayImageUrls[0],
            displayImageUrls,
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

    public async Task<OfferItemDto?> UpdateAsync(
        string offerId,
        AddOfferRequest request,
        string userId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(offerId))
        {
            return null;
        }

        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;
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
        var imageUrls = normalizedOffer.Images.Select(image => image.ImageUrl).ToArray();
        var displayImageUrls = EnsureDisplayImageUrls(imageUrls);

        await using var transaction = connection.BeginTransaction(deferred: false);
        try
        {
            await connection.ExecuteAsync(
                """
                UPDATE offers
                SET business_name = @BusinessName,
                    description = @Description,
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

            if (normalizedOffer.Images.Count > 0)
            {
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
                        CreatedAtUtc = Timestamp.NowUtc()
                    }),
                    transaction);
            }

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        InvalidateSearchDocument(offerId);

        return new OfferItemDto(
            offerId,
            existing.BusinessId,
            normalizedOffer.BusinessName,
            normalizedOffer.Description,
            normalizedOffer.Tags,
            displayImageUrls[0],
            displayImageUrls,
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

        await using var lease = await connectionFactory.RentAsync(cancellationToken);
        var connection = lease.Connection;
        var rowsAffected = await connection.ExecuteAsync(
            """
            DELETE FROM offers
            WHERE offer_id = @OfferId AND created_by_user_id = @UserId;
            """,
            new { OfferId = offerId, UserId = userId });

        InvalidateSearchDocument(offerId);

        return rowsAffected > 0
            ? new CommandResult(true, "Offer removed.")
            : new CommandResult(false, "Offer not found.");
    }

    private async Task<List<OfferRow>> QueryCandidatesAsync(
        SqliteConnection connection,
        double minLat,
        double maxLat,
        double minLng,
        double maxLng,
        bool wrapsLongitude)
    {
        var longitudeFilter = wrapsLongitude
            ? "AND (lng <= @MaxLng OR lng >= @MinLng)"
            : "AND lng BETWEEN @MinLng AND @MaxLng";

        var sql = $"""
                   SELECT
                       offer_id AS OfferId,
                       business_id AS BusinessId,
                       business_name AS BusinessName,
                       description AS Description,
                       is_active AS IsActive,
                       lat AS Lat,
                       lng AS Lng,
                       positive_availability_count AS PositiveAvailabilityCount,
                       negative_availability_count AS NegativeAvailabilityCount,
                       report_count AS ReportCount
                   FROM offers
                   WHERE is_active = 1
                     AND lat BETWEEN @MinLat AND @MaxLat
                     {longitudeFilter};
                   """;

        var rows = await connection.QueryAsync<OfferRow>(
            sql,
            new { MinLat = minLat, MaxLat = maxLat, MinLng = minLng, MaxLng = maxLng });

        return rows.AsList();
    }

    private async Task<Dictionary<string, OfferSearchDocument>> LoadSearchDocumentsAsync(
        SqliteConnection connection,
        IReadOnlyList<OfferRow> offerRows,
        CancellationToken cancellationToken)
    {
        var rowsById = offerRows.ToDictionary(x => x.OfferId, StringComparer.OrdinalIgnoreCase);
        var documents = new Dictionary<string, OfferSearchDocument>(StringComparer.OrdinalIgnoreCase);
        var missingIds = new List<string>();

        foreach (var row in offerRows)
        {
            var cached = await cache.GetAsync<OfferSearchDocument>(CacheKeys.OfferSearchDocumentKey(row.OfferId), cancellationToken);
            if (cached is not null)
            {
                documents[row.OfferId] = cached;
            }
            else
            {
                missingIds.Add(row.OfferId);
            }
        }

        if (missingIds.Count == 0)
        {
            return documents;
        }

        var tagRows = await QueryTagsAsync(connection, missingIds);
        var tagsByOffer = tagRows
            .GroupBy(x => x.OfferId, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyList<string>)group.Select(x => x.Tag).ToArray(),
                StringComparer.OrdinalIgnoreCase);

        foreach (var offerId in missingIds)
        {
            var row = rowsById[offerId];
            var tags = tagsByOffer.GetValueOrDefault(offerId) ?? [];
            var document = new OfferSearchDocument(
                tags,
                BuildSearchTerms(row.Description, tags));
            cache.Set(CacheKeys.OfferSearchDocumentKey(offerId), document, CacheTtl.OfferSearchDocument);
            documents[offerId] = document;
        }

        return documents;
    }

    private async Task<Dictionary<string, int>> GetActivePromotionPrioritiesAsync(
        SqliteConnection connection,
        CancellationToken cancellationToken)
    {
        var cached = await cache.GetAsync<Dictionary<string, int>>(CacheKeys.PromotionsKey(), cancellationToken);
        if (cached is not null)
        {
            return cached;
        }

        var now = Timestamp.NowUtc();
        var rows = await connection.QueryAsync<PromotedOfferRow>(
            """
            SELECT offer_id AS OfferId, priority AS Priority
            FROM promoted_offers
            WHERE (starts_at_utc IS NULL OR starts_at_utc <= @Now)
              AND (ends_at_utc IS NULL OR ends_at_utc >= @Now);
            """,
            new { Now = now });

        var priorities = rows.ToDictionary(x => x.OfferId, x => (int)x.Priority, StringComparer.OrdinalIgnoreCase);
        cache.Set(CacheKeys.PromotionsKey(), priorities, CacheTtl.Promotions);
        return priorities;
    }

    private async Task LoadUserOfferStateAsync(
        SqliteConnection connection,
        string userId,
        IEnumerable<string> offerIds,
        HashSet<string> votedOfferIds,
        HashSet<string> favoriteOfferIds)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return;
        }

        var ids = offerIds.Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        if (ids.Length == 0)
        {
            return;
        }

        foreach (var chunk in ids.Chunk(SqlParameterChunkSize))
        {
            var votes = await connection.QueryAsync<string>(
                """
                SELECT offer_id
                FROM offer_availability_votes
                WHERE user_id = @UserId AND offer_id IN @OfferIds;
                """,
                new { UserId = userId, OfferIds = chunk });

            votedOfferIds.UnionWith(votes);

            var favorites = await connection.QueryAsync<string>(
                """
                SELECT offer_id
                FROM offer_favorites
                WHERE user_id = @UserId AND offer_id IN @OfferIds;
                """,
                new { UserId = userId, OfferIds = chunk });

            favoriteOfferIds.UnionWith(favorites);
        }
    }

    private async Task<Dictionary<string, IReadOnlyList<string>>> LoadImageUrlsAsync(
        SqliteConnection connection,
        IReadOnlyList<string> offerIds)
    {
        var imageRows = await QueryImagesAsync(connection, offerIds);

        return imageRows
            .GroupBy(x => x.OfferId, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyList<string>)group
                    .OrderBy(x => x.SortOrder)
                    .ThenBy(x => x.ImageUrl, StringComparer.OrdinalIgnoreCase)
                    .Select(x => x.ImageUrl)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToArray(),
                StringComparer.OrdinalIgnoreCase);
    }

    private static async Task<List<OfferTagRow>> QueryTagsAsync(SqliteConnection connection, IReadOnlyList<string> offerIds)
    {
        var rows = new List<OfferTagRow>();
        foreach (var chunk in offerIds.Chunk(SqlParameterChunkSize))
        {
            rows.AddRange(await connection.QueryAsync<OfferTagRow>(
                """
                SELECT offer_id AS OfferId, tag AS Tag
                FROM offer_tags
                WHERE offer_id IN @OfferIds;
                """,
                new { OfferIds = chunk }));
        }

        return rows;
    }

    private static async Task<List<OfferImageRow>> QueryImagesAsync(SqliteConnection connection, IReadOnlyList<string> offerIds)
    {
        var rows = new List<OfferImageRow>();
        foreach (var chunk in offerIds.Chunk(SqlParameterChunkSize))
        {
            rows.AddRange(await connection.QueryAsync<OfferImageRow>(
                """
                SELECT
                    offer_id AS OfferId,
                    image_url AS ImageUrl,
                    sort_order AS SortOrder
                FROM offer_images
                WHERE offer_id IN @OfferIds;
                """,
                new { OfferIds = chunk }));
        }

        return rows;
    }

    private void InvalidateSearchDocument(string offerId) =>
        cache.Remove(CacheKeys.OfferSearchDocumentKey(offerId));

    /// <summary>
    /// Computes the bounding box that contains the circle of the requested radius.
    /// </summary>
    /// <remarks>
    /// The box is a superset of the circle, so the exact distance check is still applied afterwards.
    /// Applying it in the query removes the offers that can never match before any text work is done.
    /// </remarks>
    private static (double MinLat, double MaxLat, double MinLng, double MaxLng, bool WrapsLongitude) BoundingBox(
        GeoPoint center,
        double radiusMeters)
    {
        const double metersPerDegreeLatitude = 111_320d;

        var radius = Math.Max(0d, radiusMeters);
        var deltaLat = radius / metersPerDegreeLatitude;

        var minLat = Math.Max(-90d, center.Lat - deltaLat);
        var maxLat = Math.Min(90d, center.Lat + deltaLat);

        var cosLatitude = Math.Cos(center.Lat * Math.PI / 180d);
        var deltaLng = Math.Abs(cosLatitude) < 1e-9
            ? 180d
            : Math.Min(180d, radius / (metersPerDegreeLatitude * Math.Abs(cosLatitude)));

        var minLng = center.Lng - deltaLng;
        var maxLng = center.Lng + deltaLng;

        var wraps = minLng < -180d || maxLng > 180d;
        if (wraps)
        {
            if (minLng < -180d)
            {
                minLng += 360d;
            }

            if (maxLng > 180d)
            {
                maxLng -= 360d;
            }
        }

        return (minLat, maxLat, minLng, maxLng, wraps);
    }

    private static IReadOnlyList<string> SplitQuery(string query) =>
        Regex.Split(query ?? string.Empty, "\\s+")
            .Select(word => NormalizeSearchTerm(word))
            .Where(word => !string.IsNullOrWhiteSpace(word))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(MaxQueryTokens)
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

        return terms.Take(MaxSearchTerms).ToArray();
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

            foreach (var term in terms)
            {
                if (term.Contains(token, StringComparison.OrdinalIgnoreCase))
                {
                    tokenScore = 1d;
                    tokenStrategy = "exact";
                    break;
                }
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

            // The exact and synonym strategies already reached the maximum score, so the expensive
            // fuzzy comparison is skipped entirely for those tokens.
            if (tokenScore < 1d)
            {
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

        // A length difference alone already puts the edit distance above the fuzzy threshold,
        // so the comparison can be skipped without allocating anything.
        var lengthDifference = Math.Abs(left.Length - right.Length);
        if (1d - ((double)lengthDifference / maxLength) < FuzzySimilarityThreshold)
        {
            return 0d;
        }

        var distance = LevenshteinDistance(left, right);
        return 1d - ((double)distance / maxLength);
    }

    /// <summary>
    /// Levenshtein distance using a rolling two-row buffer, so the allocation is linear in the
    /// length of the longer string instead of quadratic.
    /// </summary>
    private static int LevenshteinDistance(string source, string target)
    {
        var sourceLength = source.Length;
        var targetLength = target.Length;

        if (sourceLength == 0)
        {
            return targetLength;
        }

        if (targetLength == 0)
        {
            return sourceLength;
        }

        var previous = new int[targetLength + 1];
        var current = new int[targetLength + 1];

        for (var j = 0; j <= targetLength; j++)
        {
            previous[j] = j;
        }

        for (var i = 1; i <= sourceLength; i++)
        {
            current[0] = i;
            var sourceChar = source[i - 1];

            for (var j = 1; j <= targetLength; j++)
            {
                var cost = sourceChar == target[j - 1] ? 0 : 1;
                var deletion = previous[j] + 1;
                var insertion = current[j - 1] + 1;
                var substitution = previous[j - 1] + cost;

                var best = deletion < insertion ? deletion : insertion;
                current[j] = best < substitution ? best : substitution;
            }

            (previous, current) = (current, previous);
        }

        return previous[targetLength];
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

        return [];
    }

    private static IReadOnlyList<string> EnsureDisplayImageUrls(IReadOnlyList<string> imageUrls) =>
        imageUrls.Count > 0 ? imageUrls : [PlaceholderImageUrl];

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

        if (imageUrl.StartsWith("data:image/png", StringComparison.OrdinalIgnoreCase))
        {
            return "image/png";
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

    /// <summary>
    /// The searchable text of an offer, cached so that it is not rebuilt on every request.
    /// </summary>
    private sealed record OfferSearchDocument(IReadOnlyList<string> Tags, IReadOnlyList<string> Terms)
    {
        public static OfferSearchDocument Empty { get; } = new([], []);
    }

    private sealed record OfferRow(
        string OfferId,
        string BusinessId,
        string BusinessName,
        string Description,
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

    private sealed record PromotedOfferRow(string OfferId, long Priority);

    private sealed record OfferCandidate(
        OfferRow Row,
        IReadOnlyList<string> Tags,
        double DistanceMeters,
        bool IsPreSearch,
        bool IsPromoted,
        bool IsReported,
        double RelevanceScore,
        IReadOnlyList<string> MatchStrategies);

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
