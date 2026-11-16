using DealsSeeker.Api.Responses;
using DealsSeeker.Shared.Contracts.Account;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Comments;
using DealsSeeker.Shared.Contracts.Feedback;
using DealsSeeker.Shared.Contracts.Offers;

namespace DealsSeeker.Api.Validation;

/// <summary>
/// Rejects a request whose payload violates the declared limits, before any work is performed.
/// </summary>
public sealed class ValidationFilter<TRequest> : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var request = context.Arguments.OfType<TRequest>().FirstOrDefault();
        if (request is not null)
        {
            var errors = Validate(request);
            if (errors.Count > 0)
            {
                return ApiResults.ValidationProblem(errors);
            }
        }

        return await next(context);
    }

    private static Dictionary<string, string[]> Validate(TRequest request) => request switch
    {
        SearchOffersRequest search => RequestValidators.Validate(search),
        AddOfferRequest offer => RequestValidators.Validate(offer),
        CreateCommentRequest comment => RequestValidators.Validate(comment),
        LoginRequest login => RequestValidators.Validate(login),
        RegisterUserRequest register => RequestValidators.Validate(register),
        SuggestionRequest suggestion => RequestValidators.Validate(suggestion),
        ReportRequest report => RequestValidators.Validate(report),
        ReportOfferRequest reportOffer => RequestValidators.Validate(reportOffer),
        _ => []
    };
}

/// <summary>Applies <see cref="ValidationFilter{TRequest}"/> to an endpoint.</summary>
public static class ValidationEndpointExtensions
{
    public static RouteHandlerBuilder WithValidation<TRequest>(this RouteHandlerBuilder builder)
        where TRequest : class =>
        builder.AddEndpointFilter(new ValidationFilter<TRequest>());
}
