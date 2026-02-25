using System.Net.Http.Json;
using DealsSeeker.Shared.Contracts.AddOffer;
using DealsSeeker.Shared.Contracts.Common;
using DealsSeeker.Shared.Contracts.Feedback;
using DealsSeeker.Shared.Contracts.Offers;
using DealsSeeker.Shared.Models;

namespace DealsSeeker.Mobile.Services.Api;

public sealed class DealsSeekerApiClient(HttpClient httpClient) : IDealsSeekerApiClient
{
    public async Task<SearchOffersResponse> SearchOffersAsync(SearchOffersRequest request, CancellationToken cancellationToken)
    {
        var response = await httpClient.PostAsJsonAsync("/api/offers/search", request, cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<SearchOffersResponse>(cancellationToken: cancellationToken)
               ?? new SearchOffersResponse([], []);
    }

    public async Task<CommandResult> VoteOfferAvailabilityAsync(string offerId, OfferAvailabilityVoteRequest request, CancellationToken cancellationToken)
    {
        var response = await httpClient.PostAsJsonAsync($"/api/offers/{offerId}/availability", request, cancellationToken);
        return await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: cancellationToken)
               ?? new CommandResult(response.IsSuccessStatusCode, response.ReasonPhrase ?? "Availability vote processed.");
    }

    public async Task<CommandResult> ReportOfferAsync(string offerId, ReportOfferRequest request, CancellationToken cancellationToken)
    {
        var response = await httpClient.PostAsJsonAsync($"/api/offers/{offerId}/report", request, cancellationToken);
        return await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: cancellationToken)
               ?? new CommandResult(response.IsSuccessStatusCode, response.ReasonPhrase ?? "Offer report processed.");
    }

    public async Task<OfferItemDto?> CreateOfferAsync(AddOfferRequest request, CancellationToken cancellationToken)
    {
        var response = await httpClient.PostAsJsonAsync("/api/offers", request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        return await response.Content.ReadFromJsonAsync<OfferItemDto>(cancellationToken: cancellationToken);
    }

    public async Task<IReadOnlyList<LocationSearchResultDto>> SearchLocationsAsync(string query, CancellationToken cancellationToken)
    {
        var response = await httpClient.GetAsync($"/api/locations/search?query={Uri.EscapeDataString(query)}", cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<IReadOnlyList<LocationSearchResultDto>>(cancellationToken: cancellationToken) ?? [];
    }

    public async Task<CommandResult> SubmitSuggestionAsync(SuggestionRequest request, CancellationToken cancellationToken)
    {
        var response = await httpClient.PostAsJsonAsync("/api/suggestions", request, cancellationToken);
        return await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: cancellationToken)
               ?? new CommandResult(response.IsSuccessStatusCode, response.ReasonPhrase ?? "Suggestion processed.");
    }

    public async Task<CommandResult> SubmitReportAsync(ReportRequest request, CancellationToken cancellationToken)
    {
        var response = await httpClient.PostAsJsonAsync("/api/reports", request, cancellationToken);
        return await response.Content.ReadFromJsonAsync<CommandResult>(cancellationToken: cancellationToken)
               ?? new CommandResult(response.IsSuccessStatusCode, response.ReasonPhrase ?? "Report processed.");
    }
}
