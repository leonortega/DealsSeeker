using System.Text.RegularExpressions;
using Xunit;

namespace DealsSeeker.ArchitectureTests;

/// <summary>
/// Source-level fitness functions for namespace cycles and naming/placement
/// conventions (the rules a dependency graph alone cannot express).
/// </summary>
public class StructureFitnessTests
{
    private static readonly string[] ApiLayers =
    [
        "Caching", "Endpoints", "Logging", "Maintenance", "Options",
        "Persistence", "Responses", "Security", "Services", "Validation"
    ];

    [Fact]
    public void ApiNamespaces_HaveNoCircularDependencies()
    {
        var graph = BuildApiNamespaceGraph();
        var visiting = new HashSet<string>();
        var visited = new HashSet<string>();
        var cycles = new List<string>();

        foreach (var node in graph.Keys)
        {
            Visit(node, graph, visiting, visited, cycles);
        }

        Assert.Empty(cycles);
    }

    [Fact]
    public void EndpointClasses_ResideInTheEndpointsFolderAndMatchTheirFileName()
    {
        var files = Directory.GetFiles(Path.Combine(Repository.ApiSource, "Endpoints"), "*.cs");
        Assert.NotEmpty(files);

        foreach (var file in files)
        {
            var classes = Regex.Matches(File.ReadAllText(file), @"public\s+static\s+class\s+(\w+)");
            Assert.NotEmpty(classes);
            foreach (Match type in classes)
            {
                Assert.EndsWith("Endpoints", type.Groups[1].Value);
                Assert.Equal(Path.GetFileNameWithoutExtension(file), type.Groups[1].Value);
            }
        }
    }

    [Fact]
    public void ServiceInterfacesAndImplementations_ResideUnderServices()
    {
        var serviceFiles = Repository.SourceFiles(Repository.ApiSource, ".cs")
            .Where(file => Regex.IsMatch(Path.GetFileName(file), @"^(I|Dapper|InMemory)\w+Service\.cs$"))
            .ToList();

        Assert.NotEmpty(serviceFiles);
        foreach (var file in serviceFiles)
        {
            var segments = file.Replace('\\', '/').Split('/');
            Assert.Contains("Services", segments);
        }
    }

    [Fact]
    public void MigrationFiles_UseSequentialThreeDigitNames()
    {
        var directory = Path.Combine(Repository.ApiSource, "Persistence", "Migrations");
        var names = Directory.GetFiles(directory, "*.sql")
            .Select(Path.GetFileName)
            .OrderBy(name => name, StringComparer.Ordinal)
            .ToList();

        Assert.NotEmpty(names);
        Assert.All(names, name => Assert.Matches(@"^\d{3}_[a-z0-9_]+\.sql$", name));
        Assert.Equal(Enumerable.Range(1, names.Count), names.Select(name => int.Parse(name![..3])));
    }

    [Fact]
    public void SharedContracts_UseContractTypeSuffixes()
    {
        var files = Repository.SourceFiles(Path.Combine(Repository.SharedSource, "Contracts"), ".cs").ToList();
        Assert.NotEmpty(files);

        foreach (var file in files)
        {
            var types = Regex.Matches(File.ReadAllText(file), @"public\s+(?:sealed\s+)?(?:record|class|enum)\s+(\w+)");
            Assert.NotEmpty(types);
            foreach (Match type in types)
            {
                Assert.Matches(@"(Request|Response|Dto|Result|Type)$", type.Groups[1].Value);
            }
        }
    }

    [Fact]
    public void TestClassesEndWithTests()
    {
        var testFiles = Repository.SourceFiles(Repository.TestsRoot, ".cs")
            .Where(file => Regex.IsMatch(File.ReadAllText(file), @"\[(Fact|Theory)\]"))
            .ToList();

        Assert.NotEmpty(testFiles);
        Assert.All(testFiles, file => Assert.EndsWith("Tests.cs", Path.GetFileName(file), StringComparison.Ordinal));
    }

    private static Dictionary<string, HashSet<string>> BuildApiNamespaceGraph()
    {
        var graph = ApiLayers.ToDictionary(layer => layer, _ => new HashSet<string>());
        graph["Program"] = [];

        foreach (var file in Repository.SourceFiles(Repository.ApiSource, ".cs"))
        {
            var text = File.ReadAllText(file);
            var declaration = Regex.Match(text, @"namespace\s+(DealsSeeker\.Api(?:\.[\w.]+)?)\s*;");
            if (!declaration.Success)
            {
                continue;
            }

            var from = TopLevelLayer(declaration.Groups[1].Value);
            if (!graph.ContainsKey(from))
            {
                continue;
            }

            foreach (Match usingDirective in Regex.Matches(text, @"using\s+(DealsSeeker\.Api(?:\.[\w.]+)?)\s*;"))
            {
                var to = TopLevelLayer(usingDirective.Groups[1].Value);
                if (graph.ContainsKey(to) && !ReferenceEquals(from, to) && from != to)
                {
                    graph[from].Add(to);
                }
            }
        }

        return graph;
    }

    private static string TopLevelLayer(string fullNamespace)
    {
        var remainder = fullNamespace.StartsWith("DealsSeeker.Api.", StringComparison.Ordinal)
            ? fullNamespace["DealsSeeker.Api.".Length..]
            : string.Empty;
        var layer = remainder.Split('.')[0];
        return ApiLayers.Contains(layer) ? layer : "Program";
    }

    private static void Visit(
        string node,
        Dictionary<string, HashSet<string>> graph,
        HashSet<string> visiting,
        HashSet<string> visited,
        List<string> cycles)
    {
        if (visiting.Contains(node))
        {
            return;
        }

        if (!visited.Add(node))
        {
            return;
        }

        visiting.Add(node);
        foreach (var dependency in graph[node])
        {
            if (visiting.Contains(dependency))
            {
                cycles.Add($"{node} -> {dependency}");
            }
            else
            {
                Visit(dependency, graph, visiting, visited, cycles);
            }
        }

        visiting.Remove(node);
    }
}
