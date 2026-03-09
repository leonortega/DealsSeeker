using System.Globalization;
using System.Text;

namespace DealsSeeker.Shared.Tags;

public static class TagLexicon
{
    private static readonly IReadOnlyDictionary<string, IReadOnlyDictionary<string, IReadOnlyList<string>>> RelatedTermsByLanguage
        = new Dictionary<string, IReadOnlyDictionary<string, IReadOnlyList<string>>>(StringComparer.OrdinalIgnoreCase)
        {
            ["en"] = new Dictionary<string, IReadOnlyList<string>>(StringComparer.OrdinalIgnoreCase)
            {
                ["coffee"] = ["cafe", "espresso", "latte"],
                ["tea"] = ["chai", "infusion"],
                ["bakery"] = ["bread", "pastry"],
                ["discount"] = ["deal", "promo", "sale", "offer"],
                ["offer"] = ["deal", "promo", "sale", "discount"],
                ["fresh"] = ["organic", "new"]
            },
            ["es"] = new Dictionary<string, IReadOnlyList<string>>(StringComparer.OrdinalIgnoreCase)
            {
                ["cafe"] = ["coffee", "espresso"],
                ["te"] = ["tea", "infusion"],
                ["panaderia"] = ["bakery", "bread", "pan"],
                ["descuento"] = ["discount", "deal", "promo", "oferta"],
                ["oferta"] = ["offer", "deal", "promo", "descuento"],
                ["fresco"] = ["fresh", "organic", "nuevo"]
            }
        };

    public static string ResolveLanguageCode(string? locale)
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

    public static string NormalizeTag(string value)
    {
        var trimmed = (value ?? string.Empty)
            .Trim()
            .Trim('.', ',', ';', ':', '!', '?', '"', '\'', '(', ')', '[', ']', '{', '}')
            .ToLowerInvariant();

        return RemoveDiacritics(trimmed);
    }

    public static string NormalizeSearchTerm(string value) =>
        string.Concat(NormalizeTag(value).Where(ch => !char.IsWhiteSpace(ch)));

    public static IReadOnlyDictionary<string, IReadOnlyList<string>> ExpandQueryWithRelatedTerms(
        IReadOnlyList<string> queryTokens,
        string? locale)
    {
        var language = ResolveLanguageCode(locale);
        var dictionary = GetDictionary(language);
        var expanded = new Dictionary<string, IReadOnlyList<string>>(StringComparer.OrdinalIgnoreCase);

        foreach (var token in queryTokens)
        {
            var normalizedToken = NormalizeSearchTerm(token);
            if (normalizedToken.Length == 0)
            {
                expanded[token] = [];
                continue;
            }

            expanded[token] = FindRelatedTerms(normalizedToken, language, dictionary, NormalizeSearchTerm)
                .Where(term => !string.Equals(term, normalizedToken, StringComparison.OrdinalIgnoreCase))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();
        }

        return expanded;
    }

    public static IReadOnlyList<string> GetSuggestedTags(
        IEnumerable<string> selectedTags,
        string? locale,
        int maxSuggestions = 12)
    {
        var language = ResolveLanguageCode(locale);
        var dictionary = GetDictionary(language);
        var selected = selectedTags
            .Select(NormalizeTag)
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (selected.Length == 0)
        {
            return [];
        }

        var excluded = selected.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var suggestions = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var selectedTag in selected)
        {
            foreach (var variant in ExpandTagVariants(selectedTag, language))
            {
                suggestions.Add(variant);
            }

            foreach (var related in FindRelatedTerms(selectedTag, language, dictionary, NormalizeTag))
            {
                suggestions.Add(related);
            }
        }

        return suggestions
            .Where(suggestion => !excluded.Contains(suggestion))
            .OrderBy(suggestion => suggestion, StringComparer.OrdinalIgnoreCase)
            .Take(Math.Max(0, maxSuggestions))
            .ToArray();
    }

    private static IReadOnlyDictionary<string, IReadOnlyList<string>> GetDictionary(string language) =>
        RelatedTermsByLanguage.TryGetValue(language, out var dictionary)
            ? dictionary
            : RelatedTermsByLanguage["en"];

    private static IEnumerable<string> FindRelatedTerms(
        string normalizedTerm,
        string language,
        IReadOnlyDictionary<string, IReadOnlyList<string>> dictionary,
        Func<string, string> normalize)
    {
        var selectedForms = ExpandComparisonForms(normalizedTerm, language);

        foreach (var entry in dictionary)
        {
            var entryTerms = EnumerateEntryTerms(entry, normalize).ToArray();
            if (entryTerms.Length == 0)
            {
                continue;
            }

            var entryForms = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var entryTerm in entryTerms)
            {
                foreach (var form in ExpandComparisonForms(entryTerm, language))
                {
                    entryForms.Add(form);
                }
            }

            if (!selectedForms.Overlaps(entryForms))
            {
                continue;
            }

            foreach (var entryTerm in entryTerms)
            {
                yield return entryTerm;
            }
        }
    }

    private static IEnumerable<string> EnumerateEntryTerms(
        KeyValuePair<string, IReadOnlyList<string>> entry,
        Func<string, string> normalize)
    {
        var normalizedKey = normalize(entry.Key);
        if (!string.IsNullOrWhiteSpace(normalizedKey))
        {
            yield return normalizedKey;
        }

        foreach (var synonym in entry.Value.Select(normalize).Where(value => !string.IsNullOrWhiteSpace(value)))
        {
            yield return synonym;
        }
    }

    private static HashSet<string> ExpandComparisonForms(string value, string language)
    {
        var forms = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var variant in ExpandTagVariants(value, language))
        {
            forms.Add(variant);
        }

        return forms;
    }

    private static IEnumerable<string> ExpandTagVariants(string value, string language)
    {
        var normalized = NormalizeTag(value);
        if (string.IsNullOrWhiteSpace(normalized))
        {
            yield break;
        }

        var variants = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            normalized,
            ToSingular(normalized, language),
            ToPlural(normalized, language)
        };

        foreach (var variant in variants.Where(variant => !string.IsNullOrWhiteSpace(variant)))
        {
            yield return variant;
        }
    }

    private static string ToSingular(string value, string language)
    {
        if (string.IsNullOrWhiteSpace(value) || value.EndsWith('%'))
        {
            return value;
        }

        if (string.Equals(language, "es", StringComparison.OrdinalIgnoreCase))
        {
            if (value.EndsWith("ces", StringComparison.OrdinalIgnoreCase) && value.Length > 3)
            {
                return value[..^3] + "z";
            }

            if (value.EndsWith('s') && value.Length > 3)
            {
                if (value.EndsWith("es", StringComparison.OrdinalIgnoreCase) &&
                    !IsVowel(value[value.Length - 3]) &&
                    !value.EndsWith("aes", StringComparison.OrdinalIgnoreCase) &&
                    !value.EndsWith("ees", StringComparison.OrdinalIgnoreCase) &&
                    !value.EndsWith("oes", StringComparison.OrdinalIgnoreCase))
                {
                    return value[..^2];
                }

                return value[..^1];
            }

            return value;
        }

        if (value.EndsWith("ies", StringComparison.OrdinalIgnoreCase) && value.Length > 3)
        {
            return value[..^3] + "y";
        }

        if ((value.EndsWith("ches", StringComparison.OrdinalIgnoreCase) ||
            value.EndsWith("shes", StringComparison.OrdinalIgnoreCase) ||
            value.EndsWith("sses", StringComparison.OrdinalIgnoreCase) ||
            value.EndsWith("xes", StringComparison.OrdinalIgnoreCase) ||
            value.EndsWith("zes", StringComparison.OrdinalIgnoreCase)) &&
            value.Length > 2)
        {
            return value[..^2];
        }

        if (value.EndsWith('s') && !value.EndsWith("ss", StringComparison.OrdinalIgnoreCase) && value.Length > 1)
        {
            return value[..^1];
        }

        return value;
    }

    private static string ToPlural(string value, string language)
    {
        if (string.IsNullOrWhiteSpace(value) || value.EndsWith('%'))
        {
            return value;
        }

        if (!string.Equals(ToSingular(value, language), value, StringComparison.OrdinalIgnoreCase))
        {
            return value;
        }

        if (string.Equals(language, "es", StringComparison.OrdinalIgnoreCase))
        {
            if (value.EndsWith('z'))
            {
                return value[..^1] + "ces";
            }

            return IsVowel(value[^1]) ? string.Concat(value, "s") : string.Concat(value, "es");
        }

        if (value.EndsWith('y') && value.Length > 1 && !IsVowel(value[^2]))
        {
            return value[..^1] + "ies";
        }

        if (value.EndsWith('s') ||
            value.EndsWith('x') ||
            value.EndsWith('z') ||
            value.EndsWith("ch", StringComparison.OrdinalIgnoreCase) ||
            value.EndsWith("sh", StringComparison.OrdinalIgnoreCase))
        {
            return string.Concat(value, "es");
        }

        return string.Concat(value, "s");
    }

    private static bool IsVowel(char value)
    {
        var lowered = char.ToLowerInvariant(value);
        return lowered is 'a' or 'e' or 'i' or 'o' or 'u';
    }

    private static string RemoveDiacritics(string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        var decomposed = value.Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(decomposed.Length);

        foreach (var character in decomposed)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(character);
            if (category != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(character);
            }
        }

        return builder
            .ToString()
            .Normalize(NormalizationForm.FormC);
    }
}
