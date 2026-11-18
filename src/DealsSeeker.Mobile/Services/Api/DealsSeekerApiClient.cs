using System.Net;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using System.Globalization;
using DealsSeeker.Mobile.Services.Auth;
using DealsSeeker.Mobile.Services.Ui;
using DealsSeeker.Shared.Contracts.Account;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Comments;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Feedback;
using DealsSeeker.Shared.Contracts.Offers;
using DealsSeeker.Shared.Models;
using Microsoft.Extensions.Logging;

namespace DealsSeeker.Mobile.Services.Api;

public sealed class DealsSeekerApiClient(HttpClient httpClient, IUserSessionService userSession, IViewBusyService busy, ILogger<DealsSeekerApiClient> logger) : IDealsSeekerApiClient
{
    public async Task<CommandResult> RegisterUserAsync(RegisterUserRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var httpRequest = CreateRequest(HttpMethod.Post, "/api/auth/register", request);
        var response = await SendAsync(httpRequest, "RegisterUser", cancellationToken);
        await LogIfRequestFailedAsync("RegisterUser", response, cancellationToken: cancellationToken);
        return await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: cancellationToken)
               ?? new CommandResult(response.IsSuccessStatusCode, response.ReasonPhrase ?? "Registration request processed.");
    }

    public async Task<AuthSessionDto?> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var httpRequest = CreateRequest(HttpMethod.Post, "/api/auth/login", request);
        var response = await SendAsync(httpRequest, "Login", cancellationToken);
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            await LogIfRequestFailedAsync("Login", response, cancellationToken: cancellationToken);
            return null;
        }

        await LogIfRequestFailedAsync("Login", response, cancellationToken: cancellationToken);
        await EnsureSuccessAsync(response, "Login", cancellationToken);
        return await response.Content.ReadFromJsonAsync<AuthSessionDto>(cancellationToken: cancellationToken);
    }

    public async Task<CommandResult> LogoutAsync(CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var request = CreateRequest(HttpMethod.Post, "/api/auth/logout", requiresAuth: true);
        var response = await SendAsync(request, "Logout", cancellationToken);
        await LogIfRequestFailedAsync("Logout", response, cancellationToken: cancellationToken);
        return await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: cancellationToken)
               ?? new CommandResult(response.IsSuccessStatusCode, response.ReasonPhrase ?? "Logout processed.");
    }

    public async Task<UserProfileDto?> GetMyProfileAsync(CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var request = CreateRequest(HttpMethod.Get, "/api/account/me", requiresAuth: true);
        var response = await SendAsync(request, "GetMyProfile", cancellationToken);
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            logger.LogWarning("Account profile request returned unauthorized. UserId={UserId}", userSession.CurrentSession?.UserId);
            await LogIfRequestFailedAsync("GetMyProfile", response, cancellationToken: cancellationToken);
            return null;
        }

        await LogIfRequestFailedAsync("GetMyProfile", response, cancellationToken: cancellationToken);
        await EnsureSuccessAsync(response, "GetMyProfile", cancellationToken);
        return await response.Content.ReadFromJsonAsync<UserProfileDto>(cancellationToken: cancellationToken);
    }

    public async Task<IReadOnlyList<OfferItemDto>?> GetMyOffersAsync(CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var request = CreateRequest(HttpMethod.Get, "/api/account/offers", requiresAuth: true);
        var response = await SendAsync(request, "GetMyOffers", cancellationToken);
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            logger.LogWarning("Account offers request returned unauthorized. UserId={UserId}", userSession.CurrentSession?.UserId);
            await LogIfRequestFailedAsync("GetMyOffers", response, cancellationToken: cancellationToken);
            return null;
        }

        await LogIfRequestFailedAsync("GetMyOffers", response, cancellationToken: cancellationToken);
        await EnsureSuccessAsync(response, "GetMyOffers", cancellationToken);
        var offers = await response.Content.ReadFromJsonAsync<IReadOnlyList<OfferItemDto>>(cancellationToken: cancellationToken) ?? [];
        if (offers.Count == 0)
        {
            logger.LogWarning("Account offers API returned zero records. UserId={UserId}", userSession.CurrentSession?.UserId);
        }

        return offers;
    }

    public async Task<AddOfferRequest?> GetMyOfferDraftAsync(string offerId, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var request = CreateRequest(HttpMethod.Get, $"/api/account/offers/{offerId}", requiresAuth: true);
        var response = await SendAsync(request, "GetMyOfferDraft", cancellationToken);
        if (response.StatusCode is HttpStatusCode.Unauthorized or HttpStatusCode.NotFound)
        {
            logger.LogWarning(
                "Account offer draft request returned {StatusCode}. OfferId={OfferId} UserId={UserId}",
                (int)response.StatusCode,
                offerId,
                userSession.CurrentSession?.UserId);
            await LogIfRequestFailedAsync("GetMyOfferDraft", response, offerId, cancellationToken);
            return null;
        }

        await LogIfRequestFailedAsync("GetMyOfferDraft", response, offerId, cancellationToken);
        await EnsureSuccessAsync(response, "GetMyOfferDraft", cancellationToken);
        return await response.Content.ReadFromJsonAsync<AddOfferRequest>(cancellationToken: cancellationToken);
    }

    public async Task<SearchOffersResponse> SearchOffersAsync(SearchOffersRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var httpRequest = CreateRequest(HttpMethod.Post, "/api/offers/search", request, requiresAuth: true);
        var response = await SendAsync(httpRequest, "SearchOffers", cancellationToken);
        await LogIfRequestFailedAsync("SearchOffers", response, cancellationToken: cancellationToken);
        await EnsureSuccessAsync(response, "SearchOffers", cancellationToken);
        return await response.Content.ReadFromJsonAsync<SearchOffersResponse>(cancellationToken: cancellationToken)
               ?? new SearchOffersResponse([], []);
    }

    public async Task<CommandResult> VoteOfferAvailabilityAsync(string offerId, OfferAvailabilityVoteRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var httpRequest = CreateRequest(HttpMethod.Post, $"/api/offers/{offerId}/availability", request, requiresAuth: true);
        var response = await SendAsync(httpRequest, "VoteOfferAvailability", cancellationToken);
        await LogIfRequestFailedAsync("VoteOfferAvailability", response, offerId, cancellationToken);
        return await ReadCommandResultAsync(response, cancellationToken, "Availability vote processed.");
    }

    public async Task<CommandResult> ReportOfferAsync(string offerId, ReportOfferRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var httpRequest = CreateRequest(HttpMethod.Post, $"/api/offers/{offerId}/report", request);
        var response = await SendAsync(httpRequest, "ReportOffer", cancellationToken);
        await LogIfRequestFailedAsync("ReportOffer", response, offerId, cancellationToken);
        return await ReadCommandResultAsync(response, cancellationToken, "Offer report processed.");
    }

    public async Task<CommandResult> SetOfferFavoriteAsync(string offerId, SetFavoriteRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var httpRequest = CreateRequest(HttpMethod.Post, $"/api/offers/{offerId}/favorite", request, requiresAuth: true);
        var response = await SendAsync(httpRequest, "SetOfferFavorite", cancellationToken);
        await LogIfRequestFailedAsync("SetOfferFavorite", response, offerId, cancellationToken);
        return await ReadCommandResultAsync(response, cancellationToken, "Favorite processed.");
    }

    public async Task<OfferItemDto?> CreateOfferAsync(AddOfferRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var httpRequest = CreateRequest(HttpMethod.Post, "/api/offers", request, requiresAuth: true);
        var response = await SendAsync(httpRequest, "CreateOffer", cancellationToken);
        await LogIfRequestFailedAsync("CreateOffer", response, cancellationToken: cancellationToken);
        await EnsureSuccessAsync(response, "CreateOffer", cancellationToken);
        return await response.Content.ReadFromJsonAsync<OfferItemDto>(cancellationToken: cancellationToken);
    }

    public async Task<OfferItemDto?> UpdateOfferAsync(string offerId, AddOfferRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var httpRequest = CreateRequest(HttpMethod.Put, $"/api/offers/{offerId}", request, requiresAuth: true);
        var response = await SendAsync(httpRequest, "UpdateOffer", cancellationToken);
        await LogIfRequestFailedAsync("UpdateOffer", response, offerId, cancellationToken);
        await EnsureSuccessAsync(response, "UpdateOffer", cancellationToken);
        return await response.Content.ReadFromJsonAsync<OfferItemDto>(cancellationToken: cancellationToken);
    }

    public async Task<CommandResult> DeleteOfferAsync(string offerId, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var request = CreateRequest(HttpMethod.Delete, $"/api/offers/{offerId}", requiresAuth: true);
        var response = await SendAsync(request, "DeleteOffer", cancellationToken);
        await LogIfRequestFailedAsync("DeleteOffer", response, offerId, cancellationToken);
        return await ReadCommandResultAsync(response, cancellationToken, "Offer deletion processed.");
    }

    public async Task<IReadOnlyList<LocationSearchResultDto>> SearchLocationsAsync(string query, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var request = CreateRequest(HttpMethod.Get, $"/api/locations/search?query={Uri.EscapeDataString(query)}");
        var response = await SendAsync(request, "SearchLocations", cancellationToken);
        await LogIfRequestFailedAsync("SearchLocations", response, cancellationToken: cancellationToken);
        await EnsureSuccessAsync(response, "SearchLocations", cancellationToken);
        return await response.Content.ReadFromJsonAsync<IReadOnlyList<LocationSearchResultDto>>(cancellationToken: cancellationToken) ?? [];
    }

    public async Task<LocationSearchResultDto?> ReverseLocationAsync(GeoPoint point, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var lat = point.Lat.ToString("G17", CultureInfo.InvariantCulture);
        var lng = point.Lng.ToString("G17", CultureInfo.InvariantCulture);
        var request = CreateRequest(HttpMethod.Get, $"/api/locations/reverse?lat={Uri.EscapeDataString(lat)}&lng={Uri.EscapeDataString(lng)}");
        var response = await SendAsync(request, "ReverseLocation", cancellationToken);
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            await LogIfRequestFailedAsync("ReverseLocation", response, cancellationToken: cancellationToken);
            return null;
        }

        await LogIfRequestFailedAsync("ReverseLocation", response, cancellationToken: cancellationToken);
        await EnsureSuccessAsync(response, "ReverseLocation", cancellationToken);
        return await response.Content.ReadFromJsonAsync<LocationSearchResultDto>(cancellationToken: cancellationToken);
    }

    public async Task<CommandResult> SubmitSuggestionAsync(SuggestionRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var httpRequest = CreateRequest(HttpMethod.Post, "/api/suggestions", request);
        var response = await SendAsync(httpRequest, "SubmitSuggestion", cancellationToken);
        await LogIfRequestFailedAsync("SubmitSuggestion", response, cancellationToken: cancellationToken);
        return await ReadCommandResultAsync(response, cancellationToken, "Suggestion processed.");
    }

    public async Task<CommandResult> SubmitReportAsync(ReportRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var httpRequest = CreateRequest(HttpMethod.Post, "/api/reports", request);
        var response = await SendAsync(httpRequest, "SubmitReport", cancellationToken);
        await LogIfRequestFailedAsync("SubmitReport", response, cancellationToken: cancellationToken);
        return await ReadCommandResultAsync(response, cancellationToken, "Report processed.");
    }

    public async Task<CommandResult> SetMyAvatarAsync(string avatarId, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var httpRequest = CreateRequest(HttpMethod.Put, "/api/account/me/avatar", new SetAvatarRequest(avatarId), requiresAuth: true);
        var response = await SendAsync(httpRequest, "SetMyAvatar", cancellationToken);
        await LogIfRequestFailedAsync("SetMyAvatar", response, cancellationToken: cancellationToken);
        await EnsureSuccessAsync(response, "SetMyAvatar", cancellationToken);
        return await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: cancellationToken)
               ?? new CommandResult(true, "Avatar updated.");
    }

    public async Task<OfferCommentsResponseDto> GetOfferCommentsAsync(string offerId, int limit, string? after, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var query = $"?limit={limit}";
        if (!string.IsNullOrWhiteSpace(after))
        {
            query += $"&after={Uri.EscapeDataString(after)}";
        }

        var httpRequest = CreateRequest(HttpMethod.Get, $"/api/offers/{Uri.EscapeDataString(offerId)}/comments{query}", requiresAuth: true);
        var response = await SendAsync(httpRequest, "GetOfferComments", cancellationToken);
        await LogIfRequestFailedAsync("GetOfferComments", response, offerId, cancellationToken);
        await EnsureSuccessAsync(response, "GetOfferComments", cancellationToken);
        return await response.Content.ReadFromJsonAsync<OfferCommentsResponseDto>(cancellationToken: cancellationToken)
               ?? new OfferCommentsResponseDto([]);
    }

    public async Task<OfferCommentDto?> CreateOfferCommentAsync(string offerId, string body, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var httpRequest = CreateRequest(
            HttpMethod.Post,
            $"/api/offers/{Uri.EscapeDataString(offerId)}/comments",
            new CreateCommentRequest(body),
            requiresAuth: true);
        var response = await SendAsync(httpRequest, "CreateOfferComment", cancellationToken);
        await LogIfRequestFailedAsync("CreateOfferComment", response, offerId, cancellationToken);
        await EnsureSuccessAsync(response, "CreateOfferComment", cancellationToken);
        return await response.Content.ReadFromJsonAsync<OfferCommentDto>(cancellationToken: cancellationToken);
    }

    private static async Task<CommandResult> ReadCommandResultAsync(
        HttpResponseMessage response,
        CancellationToken cancellationToken,
        string successMessage)
    {
        if (response.IsSuccessStatusCode)
        {
            return await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: cancellationToken)
                   ?? new CommandResult(true, successMessage);
        }

        var problem = await TryReadProblemAsync(response, cancellationToken);
        if (problem is not null)
        {
            var problemMessage = problem.Detail
                                 ?? problem.Title
                                 ?? response.ReasonPhrase
                                 ?? "The request could not be completed.";

            throw new ApiRequestException(
                response.StatusCode,
                problemMessage,
                ResolveRetryAfter(response),
                problem.Errors);
        }

        try
        {
            return await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: cancellationToken)
                   ?? new CommandResult(false, response.ReasonPhrase ?? "The request could not be completed.");
        }
        catch
        {
            return new CommandResult(false, response.ReasonPhrase ?? "The request could not be completed.");
        }
    }

    private async Task EnsureSuccessAsync(HttpResponseMessage response, string operationName, CancellationToken cancellationToken)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        var problem = await TryReadProblemAsync(response, cancellationToken);
        var message = problem?.Detail
                      ?? problem?.Title
                      ?? response.ReasonPhrase
                      ?? "The request could not be completed.";

        throw new ApiRequestException(
            response.StatusCode,
            message,
            ResolveRetryAfter(response),
            problem?.Errors);
    }

    private static async Task<ApiProblemDetails?> TryReadProblemAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        try
        {
            return await response.Content.ReadFromJsonAsync<ApiProblemDetails>(cancellationToken: cancellationToken);
        }
        catch
        {
            return null;
        }
    }

    private static TimeSpan? ResolveRetryAfter(HttpResponseMessage response)
    {
        var retryAfter = response.Headers.RetryAfter;
        if (retryAfter?.Delta is { } delta)
        {
            return delta;
        }

        if (retryAfter?.Date is { } date)
        {
            var wait = date - DateTimeOffset.UtcNow;
            return wait > TimeSpan.Zero ? wait : TimeSpan.Zero;
        }

        return null;
    }

    private sealed class ApiProblemDetails
    {
        public string? Type { get; init; }

        public string? Title { get; init; }

        public int? Status { get; init; }

        public string? Detail { get; init; }

        public Dictionary<string, string[]>? Errors { get; init; }
    }

    private HttpRequestMessage CreateRequest(HttpMethod method, string uri, object? payload = null, bool requiresAuth = false)
    {
        var request = new HttpRequestMessage(method, uri);
        if (payload is not null)
        {
            request.Content = JsonContent.Create(payload);
        }

        if (requiresAuth && userSession.CurrentSession is { AccessToken: { Length: > 0 } accessToken })
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        }

        return request;
    }

    private async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, string operationName, CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "Sending API request. Operation={Operation} Method={Method} Uri={Uri} BaseAddress={BaseAddress} UserId={UserId}",
            operationName,
            request.Method.Method,
            request.RequestUri?.ToString(),
            httpClient.BaseAddress?.ToString(),
            userSession.CurrentSession?.UserId);

        try
        {
            return await httpClient.SendAsync(request, cancellationToken);
        }
        catch (OperationCanceledException ex) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogError(
                ex,
                "API request timed out or was canceled unexpectedly. Operation={Operation} Method={Method} Uri={Uri} BaseAddress={BaseAddress} UserId={UserId}",
                operationName,
                request.Method.Method,
                request.RequestUri?.ToString(),
                httpClient.BaseAddress?.ToString(),
                userSession.CurrentSession?.UserId);
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "API request threw before a response was received. Operation={Operation} Method={Method} Uri={Uri} BaseAddress={BaseAddress} UserId={UserId} ExceptionType={ExceptionType} InnerMessage={InnerMessage}",
                operationName,
                request.Method.Method,
                request.RequestUri?.ToString(),
                httpClient.BaseAddress?.ToString(),
                userSession.CurrentSession?.UserId,
                ex.GetType().FullName,
                ex.InnerException?.Message);
            throw;
        }
    }

    private async Task LogIfRequestFailedAsync(
        string operationName,
        HttpResponseMessage response,
        string? offerId = null,
        CancellationToken cancellationToken = default)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        string? responseBody = null;
        try
        {
            responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "Failed to read error response body for API request. Operation={Operation} Method={Method} Uri={Uri}",
                operationName,
                response.RequestMessage?.Method.Method,
                response.RequestMessage?.RequestUri?.ToString());
        }

        logger.LogError(
            "API request returned a non-success status. Operation={Operation} Method={Method} Uri={Uri} BaseAddress={BaseAddress} StatusCode={StatusCode} Reason={ReasonPhrase} OfferId={OfferId} UserId={UserId} ResponseBody={ResponseBody}",
            operationName,
            response.RequestMessage?.Method.Method,
            response.RequestMessage?.RequestUri?.ToString(),
            httpClient.BaseAddress?.ToString(),
            (int)response.StatusCode,
            response.ReasonPhrase,
            offerId,
            userSession.CurrentSession?.UserId,
            TruncateForLog(responseBody));
    }

    private static string? TruncateForLog(string? value, int maxLength = 2000)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length <= maxLength)
        {
            return value;
        }

        return value[..maxLength] + "...";
    }
}
