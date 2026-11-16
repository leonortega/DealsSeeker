using DealsSeeker.Shared.Contracts.Account;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Comments;
using DealsSeeker.Shared.Contracts.Feedback;
using DealsSeeker.Shared.Contracts.Offers;

namespace DealsSeeker.Api.Validation;

/// <summary>
/// Validates request payloads against the declared limits of the request contracts.
/// </summary>
/// <remarks>
/// Validation runs before any database work, so a rejected request performs no reads and no writes.
/// </remarks>
public static class RequestValidators
{
    public static Dictionary<string, string[]> Validate(SearchOffersRequest request)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        if (request.Query is { Length: > RequestLimits.MaxQueryLength })
        {
            errors["query"] = [$"Query must be at most {RequestLimits.MaxQueryLength} characters."];
        }

        if (request.RadiusMeters is < 0 or > RequestLimits.MaxRadiusMeters)
        {
            errors["radiusMeters"] = [$"Radius must be between 0 and {RequestLimits.MaxRadiusMeters} metres."];
        }

        if (request.Page < 1)
        {
            errors["page"] = ["Page must be 1 or greater."];
        }

        if (request.PageSize is < 1 or > RequestLimits.MaxSearchPageSize)
        {
            errors["pageSize"] = [$"Page size must be between 1 and {RequestLimits.MaxSearchPageSize}."];
        }

        AddCoordinateErrors(errors, request.UserLocation, "userLocation");
        return errors;
    }

    public static Dictionary<string, string[]> Validate(AddOfferRequest request)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        if (request.Description is { Length: > RequestLimits.MaxDescriptionLength })
        {
            errors["description"] = [$"Description must be at most {RequestLimits.MaxDescriptionLength} characters."];
        }

        var tags = request.Tags ?? [];
        if (tags.Count > RequestLimits.MaxTags)
        {
            errors["tags"] = [$"At most {RequestLimits.MaxTags} tags are allowed."];
        }

        if (tags.Any(tag => tag is { Length: > RequestLimits.MaxTagLength }))
        {
            errors["tags"] = [$"Each tag must be at most {RequestLimits.MaxTagLength} characters."];
        }

        var images = request.Images ?? [];
        if (images.Count > RequestLimits.MaxImages)
        {
            errors["images"] = [$"At most {RequestLimits.MaxImages} images are allowed."];
        }

        if (images.Any(image => image.DataUrl is { Length: > RequestLimits.MaxImageDataUrlLength }))
        {
            errors["images"] = [$"Each image must be at most {RequestLimits.MaxImageDataUrlLength} characters."];
        }

        if (request.Location is not null)
        {
            AddCoordinateErrors(errors, request.Location.Position, "location.position");
        }

        return errors;
    }

    public static Dictionary<string, string[]> Validate(CreateCommentRequest request)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        if (string.IsNullOrWhiteSpace(request.Body))
        {
            errors["body"] = ["Comment body is required."];
        }
        else if (request.Body.Length > RequestLimits.MaxCommentBodyLength)
        {
            errors["body"] = [$"Comment body must be at most {RequestLimits.MaxCommentBodyLength} characters."];
        }

        return errors;
    }

    public static Dictionary<string, string[]> Validate(LoginRequest request)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            errors["email"] = ["Email is required."];
        }
        else if (request.Email.Length > RequestLimits.MaxEmailLength)
        {
            errors["email"] = [$"Email must be at most {RequestLimits.MaxEmailLength} characters."];
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            errors["password"] = ["Password is required."];
        }
        else if (request.Password.Length > RequestLimits.MaxPasswordLength)
        {
            errors["password"] = [$"Password must be at most {RequestLimits.MaxPasswordLength} characters."];
        }

        return errors;
    }

    public static Dictionary<string, string[]> Validate(RegisterUserRequest request)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        if (string.IsNullOrWhiteSpace(request.DisplayName))
        {
            errors["displayName"] = ["Display name is required."];
        }
        else if (request.DisplayName.Length > RequestLimits.MaxDisplayNameLength)
        {
            errors["displayName"] = [$"Display name must be at most {RequestLimits.MaxDisplayNameLength} characters."];
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            errors["email"] = ["Email is required."];
        }
        else if (request.Email.Length > RequestLimits.MaxEmailLength)
        {
            errors["email"] = [$"Email must be at most {RequestLimits.MaxEmailLength} characters."];
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            errors["password"] = ["Password is required."];
        }
        else if (request.Password.Length < RequestLimits.MinPasswordLength)
        {
            errors["password"] = [$"Password must be at least {RequestLimits.MinPasswordLength} characters."];
        }
        else if (request.Password.Length > RequestLimits.MaxPasswordLength)
        {
            errors["password"] = [$"Password must be at most {RequestLimits.MaxPasswordLength} characters."];
        }

        return errors;
    }

    public static Dictionary<string, string[]> Validate(SuggestionRequest request)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        if (string.IsNullOrWhiteSpace(request.Message))
        {
            errors["message"] = ["Message is required."];
        }
        else if (request.Message.Length > RequestLimits.MaxMessageLength)
        {
            errors["message"] = [$"Message must be at most {RequestLimits.MaxMessageLength} characters."];
        }

        if (request.Contact is { Length: > RequestLimits.MaxContactLength })
        {
            errors["contact"] = [$"Contact must be at most {RequestLimits.MaxContactLength} characters."];
        }

        return errors;
    }

    public static Dictionary<string, string[]> Validate(ReportRequest request)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        if (string.IsNullOrWhiteSpace(request.Message))
        {
            errors["message"] = ["Message is required."];
        }
        else if (request.Message.Length > RequestLimits.MaxMessageLength)
        {
            errors["message"] = [$"Message must be at most {RequestLimits.MaxMessageLength} characters."];
        }

        if (request.OfferId is { Length: > 80 })
        {
            errors["offerId"] = ["Offer identifier must be at most 80 characters."];
        }

        return errors;
    }

    public static Dictionary<string, string[]> Validate(ReportOfferRequest request)
    {
        var errors = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        if (request.Reason is { Length: > RequestLimits.MaxReasonLength })
        {
            errors["reason"] = [$"Reason must be at most {RequestLimits.MaxReasonLength} characters."];
        }

        return errors;
    }

    private static void AddCoordinateErrors(
        Dictionary<string, string[]> errors,
        DealsSeeker.Shared.Models.GeoPoint point,
        string fieldPrefix)
    {
        if (double.IsNaN(point.Lat) || double.IsInfinity(point.Lat) || point.Lat is < -90 or > 90)
        {
            errors[$"{fieldPrefix}.lat"] = ["Latitude must be between -90 and 90."];
        }

        if (double.IsNaN(point.Lng) || double.IsInfinity(point.Lng) || point.Lng is < -180 or > 180)
        {
            errors[$"{fieldPrefix}.lng"] = ["Longitude must be between -180 and 180."];
        }
    }
}
