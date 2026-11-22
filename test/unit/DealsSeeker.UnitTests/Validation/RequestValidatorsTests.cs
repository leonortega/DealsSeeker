using DealsSeeker.Api.Validation;
using DealsSeeker.Shared.Contracts.Account;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Comments;
using DealsSeeker.Shared.Contracts.Feedback;
using DealsSeeker.Shared.Contracts.Offers;
using DealsSeeker.Shared.Models;
using Xunit;

namespace DealsSeeker.UnitTests.Validation;

public class RequestValidatorsTests
{
    private static GeoPoint ValidPoint => new(40.7128, -74.006);

    private static SearchOffersRequest ValidSearch(string query = "coffee") => new(query, ValidPoint);

    [Fact]
    public void ValidateSearch_ValidRequest_HasNoErrors()
    {
        Assert.Empty(RequestValidators.Validate(ValidSearch()));
    }

    [Theory]
    [InlineData(201, true)]
    [InlineData(200, false)]
    public void ValidateSearch_QueryLength(int length, bool invalid)
    {
        var errors = RequestValidators.Validate(ValidSearch(new string('a', length)));

        Assert.Equal(invalid, errors.ContainsKey("query"));
    }

    [Theory]
    [InlineData(-1, true)]
    [InlineData(50_001, true)]
    [InlineData(0, false)]
    [InlineData(50_000, false)]
    public void ValidateSearch_Radius(int radius, bool invalid)
    {
        var request = ValidSearch() with { RadiusMeters = radius };

        Assert.Equal(invalid, RequestValidators.Validate(request).ContainsKey("radiusMeters"));
    }

    [Theory]
    [InlineData(0, true)]
    [InlineData(1, false)]
    public void ValidateSearch_Page(int page, bool invalid)
    {
        Assert.Equal(invalid, RequestValidators.Validate(ValidSearch() with { Page = page }).ContainsKey("page"));
    }

    [Theory]
    [InlineData(0, true)]
    [InlineData(51, true)]
    [InlineData(1, false)]
    [InlineData(50, false)]
    public void ValidateSearch_PageSize(int pageSize, bool invalid)
    {
        var errors = RequestValidators.Validate(ValidSearch() with { PageSize = pageSize });

        Assert.Equal(invalid, errors.ContainsKey("pageSize"));
    }

    [Theory]
    [InlineData(double.NaN, 0d, "userLocation.lat")]
    [InlineData(double.PositiveInfinity, 0d, "userLocation.lat")]
    [InlineData(91d, 0d, "userLocation.lat")]
    [InlineData(-91d, 0d, "userLocation.lat")]
    [InlineData(0d, double.NegativeInfinity, "userLocation.lng")]
    [InlineData(0d, 181d, "userLocation.lng")]
    [InlineData(0d, -181d, "userLocation.lng")]
    public void ValidateSearch_InvalidCoordinates(double lat, double lng, string field)
    {
        var errors = RequestValidators.Validate(new SearchOffersRequest("coffee", new GeoPoint(lat, lng)));

        Assert.True(errors.ContainsKey(field));
    }

    private static AddOfferRequest ValidAddOffer() => new(
        "Fresh coffee",
        ["coffee"],
        [new OfferImageDto("gallery", "image/jpeg", 1, null, null, 0, null, "data:image/jpeg;base64,abc")],
        new OfferLocationDto("manual-confirmed", "Cafe", ValidPoint));

    [Fact]
    public void ValidateAddOffer_ValidRequest_HasNoErrors()
    {
        Assert.Empty(RequestValidators.Validate(ValidAddOffer()));
    }

    [Fact]
    public void ValidateAddOffer_DescriptionLength()
    {
        var tooLong = ValidAddOffer() with { Description = new string('x', RequestLimits.MaxDescriptionLength + 1) };

        Assert.True(RequestValidators.Validate(tooLong).ContainsKey("description"));
    }

    [Fact]
    public void ValidateAddOffer_TagCountAndLength()
    {
        var tooMany = ValidAddOffer() with { Tags = Enumerable.Range(0, 11).Select(_ => "tag").ToArray() };
        var tooLong = ValidAddOffer() with { Tags = [new string('t', RequestLimits.MaxTagLength + 1)] };

        Assert.True(RequestValidators.Validate(tooMany).ContainsKey("tags"));
        Assert.True(RequestValidators.Validate(tooLong).ContainsKey("tags"));
    }

    [Fact]
    public void ValidateAddOffer_ImageCountAndLength_AndAllowsNullCollections()
    {
        var tooMany = ValidAddOffer() with
        {
            Images = Enumerable.Range(0, 6)
                .Select(i => new OfferImageDto("gallery", "image/jpeg", 1, null, null, i, null, "data:x"))
                .ToArray()
        };
        var tooLong = ValidAddOffer() with
        {
            Images = [new OfferImageDto("gallery", "image/jpeg", 1, null, null, 0, null, new string('x', RequestLimits.MaxImageDataUrlLength + 1))]
        };
        var noCollections = ValidAddOffer() with { Tags = null!, Images = null!, Location = null };

        Assert.True(RequestValidators.Validate(tooMany).ContainsKey("images"));
        Assert.True(RequestValidators.Validate(tooLong).ContainsKey("images"));
        Assert.Empty(RequestValidators.Validate(noCollections));
    }

    [Fact]
    public void ValidateAddOffer_InvalidLocationCoordinates()
    {
        var request = ValidAddOffer() with
        {
            Location = new OfferLocationDto("manual-confirmed", "Cafe", new GeoPoint(200, 0))
        };

        Assert.True(RequestValidators.Validate(request).ContainsKey("location.position.lat"));
    }

    [Theory]
    [InlineData("", true)]
    [InlineData("   ", true)]
    [InlineData("ok", false)]
    public void ValidateComment_Body(string body, bool invalid)
    {
        var errors = RequestValidators.Validate(new CreateCommentRequest(body));

        Assert.Equal(invalid, errors.ContainsKey("body"));
    }

    [Fact]
    public void ValidateComment_BodyTooLong()
    {
        var errors = RequestValidators.Validate(new CreateCommentRequest(new string('x', RequestLimits.MaxCommentBodyLength + 1)));

        Assert.True(errors.ContainsKey("body"));
    }

    [Theory]
    [InlineData("", "pass", true, false)]
    [InlineData("a@b.co", "", false, true)]
    [InlineData("a@b.co", "pass", false, false)]
    public void ValidateLogin_RequiredFields(string email, string password, bool emailError, bool passwordError)
    {
        var errors = RequestValidators.Validate(new LoginRequest(email, password));

        Assert.Equal(emailError, errors.ContainsKey("email"));
        Assert.Equal(passwordError, errors.ContainsKey("password"));
    }

    [Fact]
    public void ValidateRegister_PasswordRules()
    {
        var tooShort = RequestValidators.Validate(new RegisterUserRequest("Ada", "a@b.co", "short"));
        var tooLong = RequestValidators.Validate(
            new RegisterUserRequest("Ada", "a@b.co", new string('x', RequestLimits.MaxPasswordLength + 1)));
        var valid = RequestValidators.Validate(new RegisterUserRequest("Ada", "a@b.co", "password1"));

        Assert.True(tooShort.ContainsKey("password"));
        Assert.True(tooLong.ContainsKey("password"));
        Assert.Empty(valid);
    }

    [Fact]
    public void ValidateRegister_DisplayNameAndEmailRules()
    {
        var errors = RequestValidators.Validate(new RegisterUserRequest(" ", new string('a', 255) + "@b.co", "password1"));

        Assert.True(errors.ContainsKey("displayName"));
        Assert.True(errors.ContainsKey("email"));
    }

    [Fact]
    public void ValidateSuggestion_MessageRequiredAndLength()
    {
        Assert.True(RequestValidators.Validate(new SuggestionRequest(" ", null)).ContainsKey("message"));
        Assert.True(RequestValidators.Validate(
            new SuggestionRequest(new string('x', RequestLimits.MaxMessageLength + 1), null)).ContainsKey("message"));
        Assert.True(RequestValidators.Validate(
            new SuggestionRequest("ok", new string('c', RequestLimits.MaxContactLength + 1))).ContainsKey("contact"));
        Assert.Empty(RequestValidators.Validate(new SuggestionRequest("ok", null)));
    }

    [Fact]
    public void ValidateReport_MessageAndOfferId()
    {
        Assert.True(RequestValidators.Validate(new ReportRequest(" ", null)).ContainsKey("message"));
        Assert.True(RequestValidators.Validate(
            new ReportRequest("ok", new string('o', 81))).ContainsKey("offerId"));
        Assert.Empty(RequestValidators.Validate(new ReportRequest("ok", null)));
    }

    [Fact]
    public void ValidateReportOffer_ReasonLength()
    {
        Assert.True(RequestValidators.Validate(
            new ReportOfferRequest(new string('r', RequestLimits.MaxReasonLength + 1))).ContainsKey("reason"));
        Assert.Empty(RequestValidators.Validate(new ReportOfferRequest("spam")));
    }

    [Fact]
    public void ValidationErrors_For_IsCaseInsensitive()
    {
        var errors = ValidationErrors.For("Field", "bad");

        Assert.True(errors.ContainsKey("FIELD"));
        Assert.Equal(["bad"], errors["field"]);
    }
}
