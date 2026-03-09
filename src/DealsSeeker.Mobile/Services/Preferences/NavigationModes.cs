namespace DealsSeeker.Mobile.Services.Preferences;

public static class NavigationModes
{
    public const string Pedestrian = "pedestrian";
    public const string Car = "car";

    public static string Normalize(string? mode)
    {
        var normalized = (mode ?? string.Empty).Trim().ToLowerInvariant();
        return normalized switch
        {
            Car => Car,
            _ => Pedestrian
        };
    }
}
