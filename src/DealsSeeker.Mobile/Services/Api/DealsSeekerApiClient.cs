using System.Net;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using System.Globalization;
using DealsSeeker.Mobile.Services.Auth;
using DealsSeeker.Mobile.Services.Ui;
using DealsSeeker.Shared.Contracts.Account;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Feedback;
using DealsSeeker.Shared.Contracts.Offers;
using DealsSeeker.Shared.Models;

namespace DealsSeeker.Mobile.Services.Api;

public sealed class DealsSeekerApiClient(HttpClient httpClient, IUserSessionService userSession, IViewBusyService busy) : IDealsSeekerApiClient
{
    public async Task<CommandResult> RegisterUserAsync(RegisterUserRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var response = await httpClient.PostAsJsonAsync("/api/auth/register", request, cancellationToken);
        return await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: cancellationToken)
               ?? new CommandResult(response.IsSuccessStatusCode, response.ReasonPhrase ?? "Registration request processed.");
    }

    public async Task<AuthSessionDto?> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var response = await httpClient.PostAsJsonAsync("/api/auth/login", request, cancellationToken);
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<AuthSessionDto>(cancellationToken: cancellationToken);
    }

    public async Task<CommandResult> LogoutAsync(CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var request = CreateRequest(HttpMethod.Post, "/api/auth/logout", requiresAuth: true);
        var response = await httpClient.SendAsync(request, cancellationToken);
        return await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: cancellationToken)
               ?? new CommandResult(response.IsSuccessStatusCode, response.ReasonPhrase ?? "Logout processed.");
    }

    public async Task<UserProfileDto?> GetMyProfileAsync(CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var request = CreateRequest(HttpMethod.Get, "/api/account/me", requiresAuth: true);
        var response = await httpClient.SendAsync(request, cancellationToken);
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<UserProfileDto>(cancellationToken: cancellationToken);
    }

    public async Task<IReadOnlyList<OfferItemDto>?> GetMyOffersAsync(CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var request = CreateRequest(HttpMethod.Get, "/api/account/offers", requiresAuth: true);
        var response = await httpClient.SendAsync(request, cancellationToken);
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<IReadOnlyList<OfferItemDto>>(cancellationToken: cancellationToken) ?? [];
    }

    public async Task<AddOfferRequest?> GetMyOfferDraftAsync(string offerId, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var request = CreateRequest(HttpMethod.Get, $"/api/account/offers/{offerId}", requiresAuth: true);
        var response = await httpClient.SendAsync(request, cancellationToken);
        if (response.StatusCode is HttpStatusCode.Unauthorized or HttpStatusCode.NotFound)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<AddOfferRequest>(cancellationToken: cancellationToken);
    }

    public async Task<SearchOffersResponse> SearchOffersAsync(SearchOffersRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var httpRequest = CreateRequest(HttpMethod.Post, "/api/offers/search", request, requiresAuth: true);
        var response = await httpClient.SendAsync(httpRequest, cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<SearchOffersResponse>(cancellationToken: cancellationToken)
               ?? new SearchOffersResponse([], []);
    }

    public async Task<CommandResult> VoteOfferAvailabilityAsync(string offerId, OfferAvailabilityVoteRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var httpRequest = CreateRequest(HttpMethod.Post, $"/api/offers/{offerId}/availability", request, requiresAuth: true);
        var response = await httpClient.SendAsync(httpRequest, cancellationToken);
        return await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: cancellationToken)
               ?? new CommandResult(response.IsSuccessStatusCode, response.ReasonPhrase ?? "Availability vote processed.");
    }

    public async Task<CommandResult> ReportOfferAsync(string offerId, ReportOfferRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var response = await httpClient.PostAsJsonAsync($"/api/offers/{offerId}/report", request, cancellationToken);
        return await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: cancellationToken)
               ?? new CommandResult(response.IsSuccessStatusCode, response.ReasonPhrase ?? "Offer report processed.");
    }

    public async Task<CommandResult> SetOfferFavoriteAsync(string offerId, SetFavoriteRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var httpRequest = CreateRequest(HttpMethod.Post, $"/api/offers/{offerId}/favorite", request, requiresAuth: true);
        var response = await httpClient.SendAsync(httpRequest, cancellationToken);
        return await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: cancellationToken)
               ?? new CommandResult(response.IsSuccessStatusCode, response.ReasonPhrase ?? "Favorite processed.");
    }

    public async Task<OfferItemDto?> CreateOfferAsync(AddOfferRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var httpRequest = CreateRequest(HttpMethod.Post, "/api/offers", request, requiresAuth: true);
        var response = await httpClient.SendAsync(httpRequest, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        return await response.Content.ReadFromJsonAsync<OfferItemDto>(cancellationToken: cancellationToken);
    }

    public async Task<OfferItemDto?> UpdateOfferAsync(string offerId, AddOfferRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var httpRequest = CreateRequest(HttpMethod.Put, $"/api/offers/{offerId}", request, requiresAuth: true);
        var response = await httpClient.SendAsync(httpRequest, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        return await response.Content.ReadFromJsonAsync<OfferItemDto>(cancellationToken: cancellationToken);
    }

    public async Task<CommandResult> DeleteOfferAsync(string offerId, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var request = CreateRequest(HttpMethod.Delete, $"/api/offers/{offerId}", requiresAuth: true);
        var response = await httpClient.SendAsync(request, cancellationToken);
        return await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: cancellationToken)
               ?? new CommandResult(response.IsSuccessStatusCode, response.ReasonPhrase ?? "Offer deletion processed.");
    }

    public async Task<IReadOnlyList<LocationSearchResultDto>> SearchLocationsAsync(string query, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var response = await httpClient.GetAsync($"/api/locations/search?query={Uri.EscapeDataString(query)}", cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<IReadOnlyList<LocationSearchResultDto>>(cancellationToken: cancellationToken) ?? [];
    }

    public async Task<LocationSearchResultDto?> ReverseLocationAsync(GeoPoint point, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var lat = point.Lat.ToString("G17", CultureInfo.InvariantCulture);
        var lng = point.Lng.ToString("G17", CultureInfo.InvariantCulture);
        var response = await httpClient.GetAsync($"/api/locations/reverse?lat={Uri.EscapeDataString(lat)}&lng={Uri.EscapeDataString(lng)}", cancellationToken);
        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<LocationSearchResultDto>(cancellationToken: cancellationToken);
    }

    public async Task<CommandResult> SubmitSuggestionAsync(SuggestionRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var response = await httpClient.PostAsJsonAsync("/api/suggestions", request, cancellationToken);
        return await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: cancellationToken)
               ?? new CommandResult(response.IsSuccessStatusCode, response.ReasonPhrase ?? "Suggestion processed.");
    }

    public async Task<CommandResult> SubmitReportAsync(ReportRequest request, CancellationToken cancellationToken)
    {
        using var _ = busy.Begin();
        var response = await httpClient.PostAsJsonAsync("/api/reports", request, cancellationToken);
        return await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: cancellationToken)
               ?? new CommandResult(response.IsSuccessStatusCode, response.ReasonPhrase ?? "Report processed.");
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
}
