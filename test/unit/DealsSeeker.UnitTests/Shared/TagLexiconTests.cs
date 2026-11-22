using DealsSeeker.Shared.Tags;
using Xunit;

namespace DealsSeeker.UnitTests.Shared;

public class TagLexiconTests
{
    [Theory]
    [InlineData(null, "en")]
    [InlineData("", "en")]
    [InlineData("   ", "en")]
    [InlineData("en", "en")]
    [InlineData("en-US", "en")]
    [InlineData("es_ES", "es")]
    [InlineData("ES-ar", "es")]
    [InlineData("de", "de")]
    public void ResolveLanguageCode_ExtractsPrimarySubtag(string? locale, string expected)
    {
        Assert.Equal(expected, TagLexicon.ResolveLanguageCode(locale));
    }

    [Theory]
    [InlineData("  Café!!!  ", "cafe")]
    [InlineData("NIÑO", "nino")]
    [InlineData("  !!!hola..  ", "hola")]
    [InlineData("", "")]
    public void NormalizeTag_TrimsLowercasesAndRemovesDiacritics(string value, string expected)
    {
        Assert.Equal(expected, TagLexicon.NormalizeTag(value));
    }

    [Theory]
    [InlineData("ice cream", "icecream")]
    [InlineData("  a b c ", "abc")]
    [InlineData("", "")]
    public void NormalizeSearchTerm_RemovesWhitespace(string value, string expected)
    {
        Assert.Equal(expected, TagLexicon.NormalizeSearchTerm(value));
    }

    [Fact]
    public void ExpandQueryWithRelatedTerms_ReturnsSynonymsWithoutTheTokenItself()
    {
        var expansion = TagLexicon.ExpandQueryWithRelatedTerms(["coffee"], "en");

        Assert.True(expansion.ContainsKey("coffee"));
        Assert.Contains("cafe", expansion["coffee"]);
        Assert.Contains("espresso", expansion["coffee"]);
        Assert.DoesNotContain("coffee", expansion["coffee"]);
    }

    [Fact]
    public void ExpandQueryWithRelatedTerms_KeepsEmptyTokensAndExpandsSpanish()
    {
        var expansion = TagLexicon.ExpandQueryWithRelatedTerms(["   ", "descuento"], "es-MX");

        Assert.Empty(expansion["   "]);
        Assert.Contains("discount", expansion["descuento"]);
        Assert.Contains("oferta", expansion["descuento"]);
    }

    [Fact]
    public void ExpandQueryWithRelatedTerms_FallsBackToEnglishForUnknownLocale()
    {
        var expansion = TagLexicon.ExpandQueryWithRelatedTerms(["bakery"], "de-DE");

        Assert.Contains("bread", expansion["bakery"]);
    }

    [Fact]
    public void ExpandQueryWithRelatedTerms_MatchesPluralForms()
    {
        var expansion = TagLexicon.ExpandQueryWithRelatedTerms(["coffees"], "en");

        Assert.Contains("cafe", expansion["coffees"]);
    }

    [Fact]
    public void GetSuggestedTags_ReturnsEmpty_WhenNothingSelected()
    {
        Assert.Empty(TagLexicon.GetSuggestedTags([], "en"));
        Assert.Empty(TagLexicon.GetSuggestedTags(["   ", "!!!"], "en"));
    }

    [Fact]
    public void GetSuggestedTags_SuggestsRelatedTermsAndExcludesSelectedTags()
    {
        var suggestions = TagLexicon.GetSuggestedTags(["Coffee"], "en");

        Assert.Contains("cafe", suggestions);
        Assert.Contains("espresso", suggestions);
        Assert.DoesNotContain("coffee", suggestions);
        Assert.Equal(suggestions.OrderBy(s => s, StringComparer.OrdinalIgnoreCase), suggestions);
    }

    [Fact]
    public void GetSuggestedTags_RespectsMaxSuggestions()
    {
        Assert.Empty(TagLexicon.GetSuggestedTags(["coffee"], "en", 0));
        Assert.Single(TagLexicon.GetSuggestedTags(["coffee"], "en", 1));
    }

    [Fact]
    public void GetSuggestedTags_WorksForSpanishAndSingularPluralVariants()
    {
        var suggestions = TagLexicon.GetSuggestedTags(["cafes"], "es-ES");

        Assert.Contains("cafe", suggestions);
        Assert.Contains("coffee", suggestions);
    }
}
