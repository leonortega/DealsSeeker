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
    private const string PlaceholderImageUrl = "/images/offer-placeholder.svg";
    private const double FuzzySimilarityThreshold = 0.72d;

    private readonly ConcurrentDictionary<string, OfferRecord> _offers = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, OfferAvailabilityVoteType>> _availabilityVotes = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> _favoritesByUser = new(StringComparer.OrdinalIgnoreCase);
    private readonly object _sync = new();

    private static readonly IReadOnlyDictionary<string, IReadOnlyDictionary<string, IReadOnlyList<string>>> SynonymsByLanguage
        = new Dictionary<string, IReadOnlyDictionary<string, IReadOnlyList<string>>>(StringComparer.OrdinalIgnoreCase)
        {
            ["en"] = new Dictionary<string, IReadOnlyList<string>>(StringComparer.OrdinalIgnoreCase)
            {
                ["coffee"] = ["cafe", "espresso", "latte"],
                ["tea"] = ["chai", "infusion"],
                ["bakery"] = ["bread", "pastry"],
                ["discount"] = ["deal", "promo", "sale"],
                ["fresh"] = ["organic", "new"]
            },
            ["es"] = new Dictionary<string, IReadOnlyList<string>>(StringComparer.OrdinalIgnoreCase)
            {
                ["cafe"] = ["coffee", "espresso"],
                ["te"] = ["tea", "infusion"],
                ["panaderia"] = ["bakery", "bread"],
                ["descuento"] = ["discount", "deal", "promo"],
                ["fresco"] = ["fresh", "organic"]
            }
        };

    public InMemoryOfferService()
    {
        Seed();
    }

    public Task<SearchOffersResponse> SearchAsync(SearchOffersRequest request, string userId, CancellationToken cancellationToken)
    {
        var queryTokens = SplitQuery(request.Query);
        var synonymExpansions = ExpandQueryWithSynonyms(queryTokens, request.Locale);
        var isPreSearch = queryTokens.Count == 0;

        var candidates = _offers.Values
            .Where(o => o.IsActive)
            .Select(o =>
            {
                var distance = DistanceMeters(request.UserLocation, o.Location);
                var isFavorite = IsFavorite(userId, o.OfferId);
                var terms = BuildSearchTerms(o.Description, o.Tags);
                var matches = EvaluateMatch(terms, queryTokens, synonymExpansions, out var relevance, out var strategies);

                return new
                {
                    Offer = o,
                    Distance = distance,
                    IsFavorite = isFavorite,
                    Matches = matches,
                    Relevance = relevance,
                    Strategies = strategies
                };
            })
            .Where(x => x.Distance <= request.RadiusMeters)
            .Where(x => x.Matches)
            .Where(x => !request.FavoritesOnly || x.IsFavorite)
            .OrderBy(x => x.Offer.ReportCount > 0 ? 1 : 0)
            .ThenByDescending(x => isPreSearch && x.Offer.IsPromoted)
            .ThenByDescending(x => !isPreSearch ? x.Relevance : 0d)
            .ThenBy(x => x.Distance)
            .ToArray();

        var offerDtos = candidates
            .Select(x => new OfferItemDto(
                x.Offer.OfferId,
                x.Offer.BusinessId,
                x.Offer.BusinessName,
                x.Offer.Description,
                x.Offer.Tags,
                x.Offer.ImageUrls[0],
                x.Offer.ImageUrls,
                x.Offer.IsActive,
                x.Offer.IsPromoted,
                x.IsFavorite,
                x.Offer.ReportCount > 0,
                x.Relevance,
                x.Strategies,
                x.Offer.Location,
                x.Distance,
                x.Offer.PositiveAvailabilityCount,
                x.Offer.NegativeAvailabilityCount,
                HasUserVoted(x.Offer.OfferId, userId)))
            .ToArray();

        var businesses = offerDtos
            .GroupBy(o => o.BusinessId, StringComparer.OrdinalIgnoreCase)
            .Select(group =>
            {
                var first = group.OrderBy(o => o.DistanceMeters).First();
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

    public Task<CommandResult> SetFavoriteAsync(string offerId, string userId, SetFavoriteRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Task.FromResult(new CommandResult(false, "Authenticated user is required."));
        }

        if (!_offers.ContainsKey(offerId))
        {
            return Task.FromResult(new CommandResult(false, "Offer not found."));
        }

        var favorites = _favoritesByUser.GetOrAdd(
            userId,
            static _ => new ConcurrentDictionary<string, byte>(StringComparer.OrdinalIgnoreCase));

        if (request.IsFavorite)
        {
            favorites[offerId] = 1;
            return Task.FromResult(new CommandResult(true, "Offer saved to favorites."));
        }

        favorites.TryRemove(offerId, out _);
        return Task.FromResult(new CommandResult(true, "Offer removed from favorites."));
    }

    public Task<OfferItemDto> AddAsync(AddOfferRequest request, CancellationToken cancellationToken)
    {
        var offerId = $"off-{Guid.NewGuid():N}"[..12];
        var location = request.Location?.Position ?? new GeoPoint(40.7128, -74.0060);

        var normalizedTags = request.Tags
            .Select(NormalizeTag)
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var imageUrls = (request.Images ?? [])
            .Where(image => !string.IsNullOrWhiteSpace(image.DataUrl))
            .OrderBy(image => image.Order)
            .Select(image => image.DataUrl!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (imageUrls.Length == 0)
        {
            imageUrls = [PlaceholderImageUrl];
        }

        var record = new OfferRecord(
            offerId,
            $"biz-{offerId[4..8]}",
            request.Location?.Label ?? "User Submitted Business",
            request.Description,
            normalizedTags,
            imageUrls,
            true,
            false,
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
            record.ImageUrls[0],
            record.ImageUrls,
            record.IsActive,
            record.IsPromoted,
            false,
            false,
            0d,
            ["exact"],
            record.Location,
            0,
            record.PositiveAvailabilityCount,
            record.NegativeAvailabilityCount,
            false));
    }

    private static IReadOnlyList<string> SplitQuery(string query) =>
        Regex.Split(query ?? string.Empty, "\\s+")
            .Select(NormalizeSearchTerm)
            .Where(word => !string.IsNullOrWhiteSpace(word))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

    private static IReadOnlyDictionary<string, IReadOnlyList<string>> ExpandQueryWithSynonyms(
        IReadOnlyList<string> queryTokens,
        string? locale)
    {
        var languageCode = ResolveLanguageCode(locale);
        if (!SynonymsByLanguage.TryGetValue(languageCode, out var languageDictionary))
        {
            return new Dictionary<string, IReadOnlyList<string>>(StringComparer.OrdinalIgnoreCase);
        }

        var expanded = new Dictionary<string, IReadOnlyList<string>>(StringComparer.OrdinalIgnoreCase);
        foreach (var token in queryTokens)
        {
            if (languageDictionary.TryGetValue(token, out var synonyms) && synonyms.Count > 0)
            {
                expanded[token] = synonyms.Select(NormalizeSearchTerm).Where(x => x.Length > 0).ToArray();
            }
            else
            {
                expanded[token] = [];
            }
        }

        return expanded;
    }

    private static string ResolveLanguageCode(string? locale)
    {
        if (string.IsNullOrWhiteSpace(locale))
        {
            return "en";
        }

        var normalized = locale.Trim();
        var separatorIndex = normalized.IndexOf('-');
        if (separatorIndex <= 0)
        {
            separatorIndex = normalized.IndexOf('_');
        }

        return (separatorIndex > 0 ? normalized[..separatorIndex] : normalized).ToLowerInvariant();
    }

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
        strategies = matchedStrategies.OrderBy(x => x, StringComparer.OrdinalIgnoreCase).ToArray();
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

    private static string NormalizeSearchTerm(string value) =>
        string.Concat(NormalizeTag(value).Where(ch => !char.IsWhiteSpace(ch)));

    private bool HasUserVoted(string offerId, string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return false;
        }

        return _availabilityVotes.TryGetValue(offerId, out var votesByUser) &&
               votesByUser.ContainsKey(userId);
    }

    private bool IsFavorite(string userId, string offerId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return false;
        }

        return _favoritesByUser.TryGetValue(userId, out var favorites) &&
               favorites.ContainsKey(offerId);
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
                [PlaceholderImageUrl],
                true,
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
                [PlaceholderImageUrl],
                true,
                false,
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
                [PlaceholderImageUrl],
                true,
                false,
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
        IReadOnlyList<string> ImageUrls,
        bool IsActive,
        bool IsPromoted,
        GeoPoint Location,
        int PositiveAvailabilityCount,
        int NegativeAvailabilityCount,
        int ReportCount);
}
