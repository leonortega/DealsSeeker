using System.Reflection;
using NetArchTest.Rules;
using Xunit;

namespace DealsSeeker.ArchitectureTests;

/// <summary>
/// Compiled-assembly fitness functions: layers may only depend downwards.
/// The contracts assembly is the innermost layer; endpoints are the outermost.
/// </summary>
public class LayerIsolationTests
{
    private static readonly Assembly Api = typeof(DealsSeeker.Api.Endpoints.AccountEndpoints).Assembly;
    private static readonly Assembly Shared = typeof(DealsSeeker.Shared.Contracts.Account.LoginRequest).Assembly;

    [Fact]
    public void SharedContracts_DoNotDependOnInfrastructureOrWebFramework()
    {
        var result = Types.InAssembly(Shared)
            .ShouldNot()
            .HaveDependencyOnAny("DealsSeeker.Api", "Microsoft.AspNetCore", "Dapper", "Microsoft.Data.Sqlite")
            .GetResult();

        Assert.True(result.IsSuccessful, "Shared must stay a dependency-free contract layer: " + string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Api_DoesNotDependOnTestAssembliesOrTestFrameworks()
    {
        var result = Types.InAssembly(Api)
            .ShouldNot()
            .HaveDependencyOnAny("xunit", "DealsSeeker.UnitTests", "DealsSeeker.IntegrationTests", "DealsSeeker.SecurityTests")
            .GetResult();

        Assert.True(result.IsSuccessful, "Production assembly references test code: " + string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Endpoints_DoNotReachIntoStorageOrBackgroundInfrastructure()
    {
        var result = Types.InAssembly(Api)
            .That().ResideInNamespace("DealsSeeker.Api.Endpoints")
            .ShouldNot()
            .HaveDependencyOnAny(
                "DealsSeeker.Api.Persistence",
                "DealsSeeker.Api.Logging",
                "DealsSeeker.Api.Maintenance",
                "Dapper",
                "Microsoft.Data.Sqlite")
            .GetResult();

        Assert.True(result.IsSuccessful, "Endpoints must call services, not storage: " + string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Services_DoNotDependOnEndpoints()
    {
        var result = Types.InAssembly(Api)
            .That().ResideInNamespace("DealsSeeker.Api.Services")
            .ShouldNot().HaveDependencyOn("DealsSeeker.Api.Endpoints")
            .GetResult();

        Assert.True(result.IsSuccessful, "A service must never call back into an endpoint: " + string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Security_DoesNotDependOnEndpoints()
    {
        var result = Types.InAssembly(Api)
            .That().ResideInNamespace("DealsSeeker.Api.Security")
            .ShouldNot().HaveDependencyOn("DealsSeeker.Api.Endpoints")
            .GetResult();

        Assert.True(result.IsSuccessful, "Authentication must be independent of endpoint classes: " + string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Persistence_DoesNotDependOnUpperLayers()
    {
        var result = Types.InAssembly(Api)
            .That().ResideInNamespace("DealsSeeker.Api.Persistence")
            .ShouldNot()
            .HaveDependencyOnAny(
                "DealsSeeker.Api.Endpoints",
                "DealsSeeker.Api.Services",
                "DealsSeeker.Api.Security",
                "DealsSeeker.Api.Responses")
            .GetResult();

        Assert.True(result.IsSuccessful, "Persistence must stay below services: " + string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Validation_DoesNotDependOnStorageOrServices()
    {
        var result = Types.InAssembly(Api)
            .That().ResideInNamespace("DealsSeeker.Api.Validation")
            .ShouldNot()
            .HaveDependencyOnAny("DealsSeeker.Api.Persistence", "DealsSeeker.Api.Services", "Dapper", "Microsoft.Data.Sqlite")
            .GetResult();

        Assert.True(result.IsSuccessful, "Validation must run before any work: " + string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Responses_DoNotDependOnStorageOrEndpoints()
    {
        var result = Types.InAssembly(Api)
            .That().ResideInNamespace("DealsSeeker.Api.Responses")
            .ShouldNot()
            .HaveDependencyOnAny("DealsSeeker.Api.Persistence", "DealsSeeker.Api.Endpoints", "Dapper", "Microsoft.Data.Sqlite")
            .GetResult();

        Assert.True(result.IsSuccessful, "Response helpers must not reach into storage: " + string.Join(", ", result.FailingTypeNames ?? []));
    }
}
