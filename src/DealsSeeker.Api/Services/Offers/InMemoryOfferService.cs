using System.Collections.Concurrent;
using System.Globalization;
using System.Text.RegularExpressions;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Offers;
using DealsSeeker.Shared.Models;

namespace DealsSeeker.Api.Services.Offers;

public sealed class InMemoryOfferService : IOfferService
{
    private readonly ConcurrentDictionary<string, OfferRecord> _offers = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, OfferAvailabilityVoteType>> _availabilityVotes = new(StringComparer.OrdinalIgnoreCase);
    private readonly object _sync = new();

    public InMemoryOfferService()
    {
        Seed();
    }

    public Task<SearchOffersResponse> SearchAsync(SearchOffersRequest request, string userId, CancellationToken cancellationToken)
    {
        var queryWords = SplitQuery(request.Query);
        var offers = _offers.Values.Where(o => o.IsActive);

        offers = offers.Where(o => IsInRadius(o.Location, request.UserLocation, request.RadiusMeters));

        if (queryWords.Count > 0)
        {
            offers = offers.Where(o => QueryMatchesTags(queryWords, o.Tags));
        }

        var offerDtos = offers
            .Select(o => new OfferItemDto(
                o.OfferId,
                o.BusinessId,
                o.BusinessName,
                o.Description,
                o.Tags,
                o.ImageUrl,
                o.IsActive,
                o.Location,
                DistanceMeters(request.UserLocation, o.Location),
                o.PositiveAvailabilityCount,
                o.NegativeAvailabilityCount,
                HasUserVoted(o.OfferId, userId)))
            .OrderBy(o => o.DistanceMeters)
            .ToArray();

        var businesses = offerDtos
            .GroupBy(o => o.BusinessId, StringComparer.OrdinalIgnoreCase)
            .Select(group =>
            {
                var first = group.First();
                return new BusinessMarkerDto(
                    first.BusinessId,
                    first.BusinessName,
                    first.Location,
                    first.DistanceMeters);
            })
            .OrderBy(b => b.DistanceMeters)
            .ToArray();

        return Task.FromResult(new SearchOffersResponse(offerDtos, businesses));
    }

    public Task<CommandResult> VoteAvailabilityAsync(string offerId, string userId, OfferAvailabilityVoteRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Task.FromResult(new CommandResult(false, "Authenticated user is required."));
        }

        lock (_sync)
        {
            if (!_offers.TryGetValue(offerId, out var existing))
            {
                return Task.FromResult(new CommandResult(false, "Offer not found."));
            }

            var offerVotes = _availabilityVotes.GetOrAdd(
                offerId,
                static _ => new ConcurrentDictionary<string, OfferAvailabilityVoteType>(StringComparer.OrdinalIgnoreCase));

            if (!offerVotes.TryAdd(userId, request.Vote))
            {
                return Task.FromResult(new CommandResult(false, "Availability feedback already submitted for this offer."));
            }

            var updated = request.Vote switch
            {
                OfferAvailabilityVoteType.ThumbsUp => existing with { PositiveAvailabilityCount = existing.PositiveAvailabilityCount + 1 },
                OfferAvailabilityVoteType.ThumbsDown => existing with { NegativeAvailabilityCount = existing.NegativeAvailabilityCount + 1 },
                _ => existing
            };

            _offers[offerId] = updated;
        }

        return Task.FromResult(new CommandResult(true, "Availability feedback registered."));
    }

    public Task<CommandResult> ReportAsync(string offerId, ReportOfferRequest request, CancellationToken cancellationToken)
    {
        if (!_offers.TryGetValue(offerId, out var existing))
        {
            return Task.FromResult(new CommandResult(false, "Offer not found."));
        }

        _offers[offerId] = existing with { ReportCount = existing.ReportCount + 1 };
        return Task.FromResult(new CommandResult(true, "Report registered."));
    }

    public Task<OfferItemDto> AddAsync(AddOfferRequest request, CancellationToken cancellationToken)
    {
        var offerId = $"off-{Guid.NewGuid():N}"[..12];
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

        var record = new OfferRecord(
            offerId,
            $"biz-{offerId[4..8]}",
            request.Location?.Label ?? "User Submitted Business",
            request.Description,
            normalizedTags,
            imageUrl,
            true,
            location,
            0,
            0,
            0);

        _offers[offerId] = record;

        return Task.FromResult(new OfferItemDto(
            record.OfferId,
            record.BusinessId,
            record.BusinessName,
            record.Description,
            record.Tags,
            record.ImageUrl,
            record.IsActive,
            record.Location,
            0,
            record.PositiveAvailabilityCount,
            record.NegativeAvailabilityCount,
            false));
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

    private static bool IsInRadius(GeoPoint offerPoint, GeoPoint userPoint, int radiusMeters) =>
        DistanceMeters(userPoint, offerPoint) <= radiusMeters;

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

    private static string NormalizeTag(string value)
    {
        var normalized = (value ?? string.Empty)
            .Trim()
            .Trim('.', ',', ';', ':', '!', '?', '"', '\'', '(', ')', '[', ']', '{', '}')
            .ToLower(CultureInfo.InvariantCulture);

        return normalized;
    }

    private bool HasUserVoted(string offerId, string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return false;
        }

        return _availabilityVotes.TryGetValue(offerId, out var votesByUser) &&
               votesByUser.ContainsKey(userId);
    }

    private void Seed()
    {
        var seed = new[]
        {
            new OfferRecord(
                "off-100",
                "biz-100",
                "Main Street Cafe",
                "Buy one coffee and get one free",
                ["coffee", "breakfast"],
                "/images/offer-placeholder.svg",
                true,
                new GeoPoint(40.7131, -74.0055),
                0,
                0,
                0),
            new OfferRecord(
                "off-101",
                "biz-101",
                "Broadway Market",
                "Bakery discount before closing time",
                ["bakery", "discount", "bread"],
                "/images/offer-placeholder.svg",
                true,
                new GeoPoint(40.7165, -74.0035),
                0,
                0,
                0),
            new OfferRecord(
                "off-102",
                "biz-102",
                "Green Leaf Shop",
                "Fresh tea selection with seasonal promos",
                ["tea", "fresh", "seasonal"],
                "/images/offer-placeholder.svg",
                true,
                new GeoPoint(40.7105, -74.0080),
                0,
                0,
                0)
        };

        foreach (var offer in seed)
        {
            _offers[offer.OfferId] = offer;
        }
    }

    private sealed record OfferRecord(
        string OfferId,
        string BusinessId,
        string BusinessName,
        string Description,
        IReadOnlyList<string> Tags,
        string ImageUrl,
        bool IsActive,
        GeoPoint Location,
        int PositiveAvailabilityCount,
        int NegativeAvailabilityCount,
        int ReportCount);
}
