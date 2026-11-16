namespace DealsSeeker.Api.Services.Locations;

/// <summary>
/// Thrown when every configured map provider failed, so that the caller can distinguish a provider
/// outage from a lookup that legitimately found nothing.
/// </summary>
public sealed class LocationProviderUnavailableException(string message, Exception? innerException = null)
    : Exception(message, innerException);
