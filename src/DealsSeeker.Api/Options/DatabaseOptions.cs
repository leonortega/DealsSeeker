namespace DealsSeeker.Api.Options;

public sealed class DatabaseOptions
{
    public const string SectionName = "Database";

    public string ConnectionString { get; init; } = "Data Source=Data/dealseeker.db";
}
