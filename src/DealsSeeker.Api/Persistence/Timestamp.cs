using System.Globalization;

namespace DealsSeeker.Api.Persistence;

/// <summary>
/// The canonical timestamp format used for every persisted timestamp.
/// </summary>
/// <remarks>
/// <para>
/// All timestamps are written as ISO-8601 in UTC with a fixed <c>+00:00</c> offset. Because the
/// representation has a constant width and a constant offset, lexicographic ordering of the stored
/// text is the same as chronological ordering, which keeps the timestamp columns usable by the
/// indexes without converting them to another type on every write.
/// </para>
/// <para>
/// Centralising the format removes the risk of two writes producing text of different shapes, which
/// would silently break a range comparison.
/// </para>
/// </remarks>
public static class Timestamp
{
    private const string Format = "yyyy-MM-ddTHH:mm:ss.fffffffzzz";

    /// <summary>The current time, formatted for storage.</summary>
    public static string NowUtc() => FormatUtc(DateTimeOffset.UtcNow);

    /// <summary>Formats a timestamp for storage, always in UTC.</summary>
    public static string FormatUtc(DateTimeOffset value) =>
        value.ToUniversalTime().ToString(Format, CultureInfo.InvariantCulture);

    /// <summary>Parses a stored timestamp.</summary>
    public static bool TryParse(string? value, out DateTimeOffset parsed)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            parsed = default;
            return false;
        }

        return DateTimeOffset.TryParse(
            value,
            CultureInfo.InvariantCulture,
            DateTimeStyles.RoundtripKind | DateTimeStyles.AssumeUniversal,
            out parsed);
    }
}
