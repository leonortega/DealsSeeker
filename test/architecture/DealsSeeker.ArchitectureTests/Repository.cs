namespace DealsSeeker.ArchitectureTests;

/// <summary>Locates the repository root from the compiled test output.</summary>
internal static class Repository
{
    public static string Root { get; } = FindRoot(AppContext.BaseDirectory);

    public static string ApiSource => Path.Combine(Root, "src", "DealsSeeker.Api");

    public static string SharedSource => Path.Combine(Root, "src", "DealsSeeker.Shared");

    public static string TestsRoot => Path.Combine(Root, "test");

    public static IEnumerable<string> SourceFiles(string root, params string[] extensions)
    {
        if (!Directory.Exists(root))
        {
            return [];
        }

        return Directory.EnumerateFiles(root, "*", SearchOption.AllDirectories)
            .Where(file => extensions.Any(ext => file.EndsWith(ext, StringComparison.OrdinalIgnoreCase)))
            .Where(file => !file.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}")
                           && !file.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}"));
    }

    private static string FindRoot(string start)
    {
        for (var directory = new DirectoryInfo(start); directory is not null; directory = directory.Parent)
        {
            if (directory.GetFiles("DealsSeeker.sln").Length > 0)
            {
                return directory.FullName;
            }
        }

        throw new DirectoryNotFoundException("Could not locate DealsSeeker.sln above " + start);
    }
}
