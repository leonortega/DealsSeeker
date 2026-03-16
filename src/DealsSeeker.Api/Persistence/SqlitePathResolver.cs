using Microsoft.Data.Sqlite;

namespace DealsSeeker.Api.Persistence;

internal static class SqlitePathResolver
{
    private const string ApiProjectFileName = "DealsSeeker.Api.csproj";

    public static string NormalizeConnectionString(string connectionString, string contentRootPath)
    {
        var builder = new SqliteConnectionStringBuilder(connectionString);
        if (string.IsNullOrWhiteSpace(builder.DataSource) ||
            builder.DataSource.Equals(":memory:", StringComparison.OrdinalIgnoreCase))
        {
            return builder.ConnectionString;
        }

        builder.DataSource = ResolveDataSource(builder.DataSource, contentRootPath);

        var directory = Path.GetDirectoryName(builder.DataSource);
        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        return builder.ConnectionString;
    }

    public static string ResolveDataSourceFromConnectionString(string connectionString, string contentRootPath)
    {
        var builder = new SqliteConnectionStringBuilder(connectionString);
        return ResolveDataSource(builder.DataSource, contentRootPath);
    }

    public static string ResolveDataSource(string? dataSource, string contentRootPath)
    {
        if (string.IsNullOrWhiteSpace(dataSource) ||
            dataSource.Equals(":memory:", StringComparison.OrdinalIgnoreCase))
        {
            return dataSource ?? string.Empty;
        }

        if (Path.IsPathRooted(dataSource))
        {
            return dataSource;
        }

        var apiRootPath = ResolveApiRootPath(contentRootPath);
        return Path.GetFullPath(Path.Combine(apiRootPath, dataSource));
    }

    private static string ResolveApiRootPath(string contentRootPath)
    {
        foreach (var candidate in EnumerateCandidateDirectories(contentRootPath))
        {
            if (File.Exists(Path.Combine(candidate, ApiProjectFileName)))
            {
                return candidate;
            }
        }

        return contentRootPath;
    }

    private static IEnumerable<string> EnumerateCandidateDirectories(string contentRootPath)
    {
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var seed in new[]
                 {
                     contentRootPath,
                     AppContext.BaseDirectory,
                     Directory.GetCurrentDirectory()
                 })
        {
            if (string.IsNullOrWhiteSpace(seed))
            {
                continue;
            }

            foreach (var current in EnumerateSelfAndParents(Path.GetFullPath(seed)))
            {
                if (seen.Add(current))
                {
                    yield return current;
                }

                var apiChild = Path.Combine(current, "src", "DealsSeeker.Api");
                if (seen.Add(apiChild))
                {
                    yield return apiChild;
                }
            }
        }
    }

    private static IEnumerable<string> EnumerateSelfAndParents(string startPath)
    {
        var current = new DirectoryInfo(startPath);
        while (current is not null)
        {
            yield return current.FullName;
            current = current.Parent;
        }
    }
}
