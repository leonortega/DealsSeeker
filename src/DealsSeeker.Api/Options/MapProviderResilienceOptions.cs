namespace DealsSeeker.Api.Options;

/// <summary>
/// Resilience settings for the external map providers.
/// </summary>
public sealed class MapProviderResilienceOptions
{
    public const string SectionName = "MapProviderResilience";

    /// <summary>Maximum time a single provider request may take.</summary>
    public int TimeoutSeconds { get; init; } = 3;

    /// <summary>Number of retries for transient failures.</summary>
    public int RetryCount { get; init; } = 2;

    /// <summary>How long the circuit stays open after repeated failures.</summary>
    public int CircuitBreakerSeconds { get; init; } = 30;

    /// <summary>Maximum number of outbound provider requests per minute.</summary>
    public int RateLimitPermitsPerMinute { get; init; } = 120;
}
