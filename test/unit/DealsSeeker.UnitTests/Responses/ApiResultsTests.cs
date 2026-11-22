using System.Text;
using DealsSeeker.Api.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace DealsSeeker.UnitTests.Responses;

public class ApiResultsTests
{
    private static async Task<(DefaultHttpContext Context, string Body)> Execute(IResult result)
    {
        var context = new DefaultHttpContext
        {
            RequestServices = new ServiceCollection().AddLogging().AddProblemDetails().BuildServiceProvider()
        };
        var stream = new MemoryStream();
        context.Response.Body = stream;
        await result.ExecuteAsync(context);
        return (context, Encoding.UTF8.GetString(stream.ToArray()));
    }

    [Fact]
    public async Task ValidationProblem_Returns400WithFieldErrors()
    {
        var (context, body) = await Execute(ApiResults.ValidationProblem(new Dictionary<string, string[]> { ["query"] = ["too long"] }));

        Assert.Equal(StatusCodes.Status400BadRequest, context.Response.StatusCode);
        Assert.Contains("errors", body);
        Assert.Contains("too long", body);
    }

    [Theory]
    [InlineData(0.1, "1")]
    [InlineData(1.2, "2")]
    [InlineData(9d, "9")]
    public async Task RateLimited_Returns429WithRetryAfterHeader(double retryAfter, string expectedHeader)
    {
        var (context, _) = await Execute(ApiResults.RateLimited(TimeSpan.FromSeconds(retryAfter)));

        Assert.Equal(StatusCodes.Status429TooManyRequests, context.Response.StatusCode);
        Assert.Equal(expectedHeader, context.Response.Headers.RetryAfter.ToString());
    }

    [Fact]
    public async Task ProviderUnavailable_Returns503WithDetail()
    {
        var (context, body) = await Execute(ApiResults.ProviderUnavailable("all providers down"));

        Assert.Equal(StatusCodes.Status503ServiceUnavailable, context.Response.StatusCode);
        Assert.Contains("all providers down", body);
    }
}
