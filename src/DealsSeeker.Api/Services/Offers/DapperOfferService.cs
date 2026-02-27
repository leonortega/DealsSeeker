using System.Globalization;
using System.Text.RegularExpressions;
using Dapper;
using DealsSeeker.Api.Persistence;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Offers;
using DealsSeeker.Shared.Models;
using Microsoft.Data.Sqlite;

namespace DealsSeeker.Api.Services.Offers;

public sealed class DapperOfferService(IDbConnectionFactory connectionFactory) : IOfferService
{
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
                negative_availability_count AS NegativeAvailabilityCount
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

        HashSet<string> votedOfferIds = [];
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
        }

        var tagsByOffer = tagRows
            .GroupBy(x => x.OfferId, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<string>)g.Select(x => x.Tag).ToArray(),
                StringComparer.OrdinalIgnoreCase);

        var queryWords = SplitQuery(request.Query);
        var filteredOffers = offerRows
            .Select(row =>
            {
                var tags = tagsByOffer.TryGetValue(row.OfferId, out var rowTags) ? rowTags : [];
                var location = new GeoPoint(row.Lat, row.Lng);
                return new
                {
                    Row = row,
                    Tags = tags,
                    Location = location,
                    DistanceMeters = DistanceMeters(request.UserLocation, location)
                };
            })
            .Where(x => x.DistanceMeters <= request.RadiusMeters)
            .Where(x => queryWords.Count == 0 || QueryMatchesTags(queryWords, x.Tags))
            .OrderBy(x => x.DistanceMeters)
            .ToArray();

        var offers = filteredOffers
            .Select(x => new OfferItemDto(
                x.Row.OfferId,
                x.Row.BusinessId,
                x.Row.BusinessName,
                x.Row.Description,
                x.Tags,
                x.Row.ImageUrl,
                x.Row.IsActive != 0,
                x.Location,
                x.DistanceMeters,
                (int)x.Row.PositiveAvailabilityCount,
                (int)x.Row.NegativeAvailabilityCount,
                votedOfferIds.Contains(x.Row.OfferId)))
            .ToArray();

        var businesses = offers
            .GroupBy(x => x.BusinessId, StringComparer.OrdinalIgnoreCase)
            .Select(group =>
            {
                var first = group.First();
                return new BusinessMarkerDto(
                    first.BusinessId,
                    first.BusinessName,
                    first.Location,
                    first.DistanceMeters);
            })
            .OrderBy(x => x.DistanceMeters)
            .ToArray();

        return new SearchOffersResponse(offers, businesses);
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

    public async Task<OfferItemDto> AddAsync(AddOfferRequest request, CancellationToken cancellationToken)
    {
        var offerId = $"off-{Guid.NewGuid():N}"[..12];
        var businessId = $"biz-{offerId[4..8]}";
        var businessName = request.Location?.Label?.Trim();
        if (string.IsNullOrWhiteSpace(businessName))
        {
            businessName = "User Submitted Business";
        }

        var description = request.Description?.Trim() ?? string.Empty;
        var location = request.Location?.Position ?? new GeoPoint(40.7128, -74.0060);
        var imageUrl = !string.IsNullOrWhiteSpace(request.ImageDataUrl)
            ? request.ImageDataUrl!
            : !string.IsNullOrWhiteSpace(request.Image?.DataUrl)
                ? request.Image!.DataUrl!
                : "/images/offer-placeholder.svg";

        var normalizedTags = request.Tags
            .Select(NormalizeTag)
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        await using var transaction = connection.BeginTransaction();
        try
        {
            await connection.ExecuteAsync(
                """
                INSERT INTO offers (
                    offer_id, business_id, business_name, description, image_url, is_active, lat, lng,
                    positive_availability_count, negative_availability_count, report_count, created_at_utc
                ) VALUES (
                    @OfferId, @BusinessId, @BusinessName, @Description, @ImageUrl, 1, @Lat, @Lng,
                    0, 0, 0, @CreatedAtUtc
                );
                """,
                new
                {
                    OfferId = offerId,
                    BusinessId = businessId,
                    BusinessName = businessName,
                    Description = description,
                    ImageUrl = imageUrl,
                    Lat = location.Lat,
                    Lng = location.Lng,
                    CreatedAtUtc = DateTimeOffset.UtcNow.ToString("O")
                },
                transaction);

            if (normalizedTags.Length > 0)
            {
                await connection.ExecuteAsync(
                    """
                    INSERT INTO offer_tags (offer_id, tag)
                    VALUES (@OfferId, @Tag);
                    """,
                    normalizedTags.Select(tag => new { OfferId = offerId, Tag = tag }),
                    transaction);
            }

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
            imageUrl,
            true,
            location,
            0,
            0,
            0,
            false);
    }

    private static List<string> SplitQuery(string query) =>
        Regex.Split(query ?? string.Empty, "\\s+")
            .Select(word => word.Trim().ToLowerInvariant())
            .Where(word => !string.IsNullOrWhiteSpace(word))
            .ToList();

    private static bool QueryMatchesTags(IReadOnlyCollection<string> words, IReadOnlyList<string> tags)
    {
        if (words.Count == 0)
        {
            return true;
        }

        return words.All(word => tags.Any(tag => tag.Contains(word, StringComparison.OrdinalIgnoreCase)));
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

    private static string NormalizeTag(string value) =>
        (value ?? string.Empty)
            .Trim()
            .Trim('.', ',', ';', ':', '!', '?', '"', '\'', '(', ')', '[', ']', '{', '}')
            .ToLower(CultureInfo.InvariantCulture);

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
        long NegativeAvailabilityCount);

    private sealed record OfferTagRow(string OfferId, string Tag);
}
