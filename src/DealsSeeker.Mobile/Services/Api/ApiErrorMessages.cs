namespace DealsSeeker.Mobile.Services.Api;

/// <summary>
/// Turns API failures into localized messages so every view surfaces recoverable error states.
/// </summary>
public static class ApiErrorMessages
{
    public static string Describe(Exception exception, Func<string, string> translate, string fallbackKey)
    {
        if (exception is not ApiRequestException apiFailure)
        {
            return translate(fallbackKey);
        }

        if (apiFailure.IsRateLimited)
        {
            var seconds = Math.Max(1, (int)Math.Ceiling(apiFailure.RetryAfter?.TotalSeconds ?? 30));
            return string.Format(translate("errors.rateLimited"), seconds);
        }

        if (apiFailure.IsServiceUnavailable)
        {
            return translate("errors.serviceUnavailable");
        }

        if (apiFailure.IsValidationFailure)
        {
            return string.IsNullOrWhiteSpace(apiFailure.Message)
                ? translate("errors.validationFailed")
                : apiFailure.Message;
        }

        return string.IsNullOrWhiteSpace(apiFailure.Message)
            ? translate(fallbackKey)
            : apiFailure.Message;
    }
}
