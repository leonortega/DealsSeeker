using System.Text;

namespace DealsSeeker.Api.Services.Comments;

/// <summary>
/// The opaque cursor that identifies a position in the comment ordering.
/// </summary>
public static class CommentCursor
{
    /// <summary>Encodes the cursor that continues after the given comment.</summary>
    public static string Encode(string createdAtUtc, string commentId)
    {
        var payload = $"{createdAtUtc}|{commentId}";
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(payload));
    }

    /// <summary>
    /// Validates a cursor supplied by the caller.
    /// </summary>
    /// <returns>True when the cursor is valid or absent; false when it cannot be understood.</returns>
    public static bool IsValid(string? cursor)
    {
        if (string.IsNullOrWhiteSpace(cursor))
        {
            return true;
        }

        try
        {
            var payload = Encoding.UTF8.GetString(Convert.FromBase64String(cursor));
            var separator = payload.IndexOf('|', StringComparison.Ordinal);
            return separator > 0 && separator < payload.Length - 1;
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
