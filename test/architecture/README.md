# Architecture tests (fitness functions)

Automated checks that prevent architecture erosion by asserting the intended
structure as executable rules. They are test-only and do not change behaviour,
so no spec or BDD change is required.

## Architecture profile: Hexagonal (Ports &amp; Adapters)

The API implements a pragmatic Hexagonal profile rather than strict Clean
Architecture: there is no separate domain/use-case assembly, but the
port/adapter boundary is real and enforceable.

```
Driving adapters          Ports (pure interfaces)        Driven adapters
Endpoints (Minimal API) → IOfferService / IAuthService → Dapper*Service
                          ILocationLookupService       → PhotonLocationLookupService
                          ICacheService, ICurrentUser  → MemoryCache/Session/CurrentUser
                                                       → SqliteConnectionFactory, log sink

Program.cs = the only composition root; Shared = framework-free contracts.
```

Strict Clean Architecture is **not** claimed: `Shared` holds DTOs rather than
behaviour-rich entities, and service interfaces live in the same assembly as
their implementations. Enforcing it would require a spec-first refactor; the
fitness functions below encode the style the code actually follows. The React
Native client uses the simpler layered profile (`screens → … → api`) described
in the client section.

## .NET API — `DealsSeeker.ArchitectureTests`

Uses [NetArchTest](https://github.com/benmorris/NetArchTest) on the compiled
assemblies plus source-level checks for conventions a dependency graph cannot
express.

```powershell
dotnet test test/architecture/DealsSeeker.ArchitectureTests/DealsSeeker.ArchitectureTests.csproj
```

| Test | Rule |
|---|---|
| `LayerIsolationTests` | Shared contracts stay free of ASP.NET/Dapper/SQLite; production code has no test references; endpoints never reach persistence, logging or the janitor; services/security/validation/responses do not depend on upper layers; persistence stays below services. |
| `StructureFitnessTests.ApiNamespaces_HaveNoCircularDependencies` | No cycles among the ten API namespace layers (graph built from `using` directives, checked with DFS). |
| `StructureFitnessTests.EndpointClasses_...` | Endpoint classes end with `Endpoints` and their file name matches the class. |
| `StructureFitnessTests.ServiceInterfacesAndImplementations_...` | `I*Service` / `Dapper*Service` / `InMemory*Service` files live under `Services/`. |
| `StructureFitnessTests.MigrationFiles_...` | Migrations are named `NNN_snake_case.sql` with a gapless sequence from 001. |
| `StructureFitnessTests.SharedContracts_...` | Contract types end with `Request`, `Response`, `Dto`, `Result` or `Type`. |
| `StructureFitnessTests.TestClassesEndWithTests` | Every file containing `[Fact]`/`[Theory]` ends with `Tests.cs`. |
| `HexagonalArchitectureTests.Ports_DoNotDependOnInfrastructure` | Application ports never reference Dapper, SQLite or `Persistence` (infrastructure ports in `Persistence` are excluded by design). |
| `HexagonalArchitectureTests.Endpoints_DependOnlyOnPortsNotConcreteAdapters` | Driving adapters know only ports, never `Dapper*`/`InMemory*`/provider/cache implementations. |
| `HexagonalArchitectureTests.ServiceAdapters_ImplementTheirPort` | Every `Dapper*`/`InMemory*Service` class implements an `I*Service` port. |
| `HexagonalArchitectureTests.CompositionRoot_IsTheOnlyPlaceWiringConcreteAdapters` | No production file besides `Program.cs` references a concrete adapter; `InMemory*` test doubles are excluded. |
| `HexagonalArchitectureTests.CompositionRoot_RegistersEveryApplicationPort` | `Program.cs` registers every application port. |

## React Native client — dependency-cruiser

Run from `src/DealsSeeker.ReactNative`:

```powershell
npm run test:arch
```

Allowed dependency direction (a layer may import anything to its left):

```
screens -> components -> hooks -> context -> utils -> api
```

The config in `client/dependency-cruiser.config.cjs` forbids back-imports,
imports from `api`/`utils` into UI layers, and circular dependencies.
`client/naming-conventions.cjs` additionally requires `use*` names for hooks,
PascalCase `.tsx` for components/screens, and no stray `.js` files in `src`.

Both checks were verified to fail when a temporary violating file was added,
then pass again after its removal.

## CI usage

Both commands exit non-zero on any violation and need no running services, so
they can run on every push alongside the unit and security suites.
