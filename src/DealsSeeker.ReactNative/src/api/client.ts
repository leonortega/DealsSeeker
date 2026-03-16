import {
  AddOfferRequest,
  AuthSessionDto,
  CommandResult,
  LocationSearchResultDto,
  LoginRequest,
  OfferAvailabilityVoteRequest,
  OfferItemDto,
  RegisterUserRequest,
  ReportOfferRequest,
  ReportRequest,
  SearchOffersRequest,
  SearchOffersResponse,
  SetFavoriteRequest,
  SuggestionRequest,
  UserProfileDto,
} from './types';

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
  }
}

export class ApiRequestError extends Error {
  status: number;
  statusText: string;
  responseText: string;

  constructor(status: number, statusText: string, message: string, responseText = '') {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.statusText = statusText;
    this.responseText = responseText;
  }
}

interface ApiFactoryOptions {
  baseUrl: string;
  getAccessToken: () => string | null;
  onUnauthorized?: () => Promise<void> | void;
}

async function readJson<T>(response: Response): Promise<T | null> {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text) as T;
}

function extractErrorMessage(response: Response, responseText: string) {
  const fallback = `${response.status} ${response.statusText}`.trim();
  const trimmed = responseText.trim();

  if (!trimmed) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(trimmed) as { error?: unknown; message?: unknown; title?: unknown };
    const candidate = [parsed.message, parsed.title, parsed.error].find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0
    );

    if (candidate) {
      return `${fallback}: ${candidate.trim()}`;
    }
  } catch {
    // Ignore invalid JSON error bodies.
  }

  return trimmed.length > 160 ? fallback : `${fallback}: ${trimmed}`;
}

async function throwApiError(response: Response): Promise<never> {
  const responseText = await response.text();
  throw new ApiRequestError(
    response.status,
    response.statusText,
    extractErrorMessage(response, responseText),
    responseText
  );
}

async function request<TResponse>(
  options: ApiFactoryOptions,
  path: string,
  init?: RequestInit,
  requiresAuth = false
): Promise<TResponse> {
  const headers = new Headers(init?.headers ?? {});
  headers.set('Accept', 'application/json');

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (requiresAuth) {
    const token = options.getAccessToken();
    if (!token) {
      throw new UnauthorizedError();
    }

    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${options.baseUrl}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    await options.onUnauthorized?.();
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    await throwApiError(response);
  }

  return (await readJson<TResponse>(response)) as TResponse;
}

async function requestCommandResult(
  options: ApiFactoryOptions,
  path: string,
  init?: RequestInit,
  requiresAuth = false
) {
  try {
    return await request<CommandResult>(options, path, init, requiresAuth);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { success: false, message: 'Unauthorized.' };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Request failed.',
    } satisfies CommandResult;
  }
}

export function createDealsSeekerApi(options: ApiFactoryOptions) {
  return {
    async registerUser(requestBody: RegisterUserRequest) {
      return requestCommandResult(options, '/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
    },

    async login(requestBody: LoginRequest) {
      const response = await fetch(`${options.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        await throwApiError(response);
      }

      return readJson<AuthSessionDto>(response);
    },

    async logout() {
      return requestCommandResult(
        options,
        '/api/auth/logout',
        {
          method: 'POST',
        },
        true
      );
    },

    async getMyProfile() {
      const response = await fetch(`${options.baseUrl}/api/account/me`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${options.getAccessToken() ?? ''}`,
        },
      });

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        await throwApiError(response);
      }

      return readJson<UserProfileDto>(response);
    },

    async getMyOffers() {
      const response = await fetch(`${options.baseUrl}/api/account/offers`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${options.getAccessToken() ?? ''}`,
        },
      });

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        await throwApiError(response);
      }

      return (await readJson<OfferItemDto[]>(response)) ?? [];
    },

    async getMyOfferDraft(offerId: string) {
      const response = await fetch(`${options.baseUrl}/api/account/offers/${encodeURIComponent(offerId)}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${options.getAccessToken() ?? ''}`,
        },
      });

      if (response.status === 401 || response.status === 404) {
        return null;
      }

      if (!response.ok) {
        await throwApiError(response);
      }

      return readJson<AddOfferRequest>(response);
    },

    async searchOffers(requestBody: SearchOffersRequest) {
      return request<SearchOffersResponse>(
        options,
        '/api/offers/search',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        },
        true
      );
    },

    async voteOfferAvailability(offerId: string, requestBody: OfferAvailabilityVoteRequest) {
      return requestCommandResult(
        options,
        `/api/offers/${encodeURIComponent(offerId)}/availability`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        },
        true
      );
    },

    async reportOffer(offerId: string, requestBody: ReportOfferRequest) {
      return requestCommandResult(options, `/api/offers/${encodeURIComponent(offerId)}/report`, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
    },

    async setOfferFavorite(offerId: string, requestBody: SetFavoriteRequest) {
      return requestCommandResult(
        options,
        `/api/offers/${encodeURIComponent(offerId)}/favorite`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        },
        true
      );
    },

    async createOffer(requestBody: AddOfferRequest) {
      return request<OfferItemDto>(
        options,
        '/api/offers',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        },
        true
      );
    },

    async updateOffer(offerId: string, requestBody: AddOfferRequest) {
      return request<OfferItemDto>(
        options,
        `/api/offers/${encodeURIComponent(offerId)}`,
        {
          method: 'PUT',
          body: JSON.stringify(requestBody),
        },
        true
      );
    },

    async deleteOffer(offerId: string) {
      return requestCommandResult(
        options,
        `/api/offers/${encodeURIComponent(offerId)}`,
        {
          method: 'DELETE',
        },
        true
      );
    },

    async searchLocations(query: string) {
      return request<LocationSearchResultDto[]>(
        options,
        `/api/locations/search?query=${encodeURIComponent(query)}`
      );
    },

    async reverseLocation(lat: number, lng: number) {
      const response = await fetch(
        `${options.baseUrl}/api/locations/reverse?lat=${encodeURIComponent(
          String(lat)
        )}&lng=${encodeURIComponent(String(lng))}`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        await throwApiError(response);
      }

      return readJson<LocationSearchResultDto>(response);
    },

    async submitSuggestion(requestBody: SuggestionRequest) {
      return requestCommandResult(options, '/api/suggestions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
    },

    async submitReport(requestBody: ReportRequest) {
      return requestCommandResult(options, '/api/reports', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
    },
  };
}
