using System.Reflection;
using System.Text.RegularExpressions;
using NetArchTest.Rules;
using Xunit;

namespace DealsSeeker.ArchitectureTests;

/// <summary>
/// Enforces the Hexagonal (Ports &amp; Adapters) profile the API actually follows:
/// ports are pure interfaces, adapters are the only classes that touch the
/// outside world, driving adapters (endpoints) know only ports, and Program.cs
/// is the single composition root.
/// </summary>
public class HexagonalArchitectureTests
{
    private static readonly Assembly Api = typeof(DealsSeeker.Api.Endpoints.AccountEndpoints).Assembly;

    private static readonly string[] Infrastructure =
    [
        "Dapper",
        "Microsoft.Data.Sqlite",
        "DealsSeeker.Api.Persistence"
    ];

    private static readonly string[] ConcreteAdapters =
    [
        "DealsSeeker.Api.Services.Auth.DapperAuthService",
        "DealsSeeker.Api.Services.Auth.InMemoryAuthService",
        "DealsSeeker.Api.Services.Offers.DapperOfferService",
        "DealsSeeker.Api.Services.Offers.InMemoryOfferService",
        "DealsSeeker.Api.Services.Comments.DapperCommentService",
        "DealsSeeker.Api.Services.Feedback.DapperFeedbackService",
        "DealsSeeker.Api.Services.Feedback.InMemoryFeedbackService",
        "DealsSeeker.Api.Services.Locations.PhotonLocationLookupService",
        "DealsSeeker.Api.Caching.MemoryCacheService",
        "DealsSeeker.Api.Security.CurrentUser",
        "DealsSeeker.Api.Security.MemorySessionCache",
        "DealsSeeker.Api.Logging.SqliteLogEventSink"
    ];

    // Test doubles are adapters too, but they are wired by tests, not by the app.
    private static readonly string[] WiredAdapters =
        ConcreteAdapters.Where(name => !name.Split('.').Last().StartsWith("InMemory", StringComparison.Ordinal)).ToArray();

    private static readonly string[] ApplicationPorts =
    [
        "IAuthService", "IOfferService", "ICommentService", "IFeedbackService",
        "ILocationLookupService", "ICacheService",
        "ICurrentUser", "ISessionCache", "IDbConnectionFactory", "IDatabaseMigrationRunner"
    ];

    [Fact]
    public void Ports_DoNotDependOnInfrastructure()
    {
        var result = Types.InAssembly(Api)
            .That().AreInterfaces().And().HaveNameStartingWith("I")
            .And().DoNotResideInNamespace("DealsSeeker.Api.Persistence")
            .ShouldNot().HaveDependencyOnAny(Infrastructure)
            .GetResult();

        Assert.True(result.IsSuccessful, "A port leaked infrastructure: " + string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Endpoints_DependOnlyOnPortsNotConcreteAdapters()
    {
        var result = Types.InAssembly(Api)
            .That().ResideInNamespace("DealsSeeker.Api.Endpoints")
            .ShouldNot().HaveDependencyOnAny(ConcreteAdapters)
            .GetResult();

        Assert.True(result.IsSuccessful, "An endpoint referenced a concrete adapter: " + string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void ServiceAdapters_ImplementTheirPort()
    {
        var adapters = Repository.SourceFiles(Path.Combine(Repository.ApiSource, "Services"), ".cs")
            .Where(file => Regex.IsMatch(Path.GetFileName(file), @"^(Dapper|InMemory)\w+Service\.cs$"))
            .ToList();

        Assert.NotEmpty(adapters);
        foreach (var file in adapters)
        {
            var text = File.ReadAllText(file);
            var declaration = Regex.Match(text, @"public\s+(?:sealed\s+)?class\s+\w+");
            Assert.True(declaration.Success, "No public service class in " + file);
            var bodyStart = text.IndexOf('{', declaration.Index);
            var signature = text[declaration.Index..bodyStart];
            Assert.Matches(@":\s*I[A-Z]\w+", signature);
        }
    }

    [Fact]
    public void CompositionRoot_IsTheOnlyPlaceWiringConcreteAdapters()
    {
        var program = Path.Combine(Repository.ApiSource, "Program.cs");
        var programText = File.ReadAllText(program);

        foreach (var adapter in WiredAdapters.Select(name => name.Split('.').Last()))
        {
            var referencingFiles = Repository.SourceFiles(Repository.ApiSource, ".cs")
                .Where(file => !string.Equals(file, program, StringComparison.OrdinalIgnoreCase))
                .Where(file => Regex.IsMatch(File.ReadAllText(file), $@"\b{Regex.Escape(adapter)}\b"))
                .Where(file => !Path.GetFileNameWithoutExtension(file).Equals(adapter, StringComparison.Ordinal))
                .ToList();

            Assert.Empty(referencingFiles);
            Assert.Contains(adapter, programText, StringComparison.Ordinal);
        }
    }

    [Fact]
    public void CompositionRoot_RegistersEveryApplicationPort()
    {
        var program = File.ReadAllText(Path.Combine(Repository.ApiSource, "Program.cs"));

        foreach (var port in ApplicationPorts)
        {
            Assert.Contains(port, program, StringComparison.Ordinal);
        }
    }
}
