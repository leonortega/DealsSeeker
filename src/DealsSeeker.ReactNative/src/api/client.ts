import {
  AddOfferRequest,
  AuthSessionDto,
  CommandResult,
  CreateCommentRequest,
  LocationSearchResultDto,
  LoginRequest,
  OfferAvailabilityVoteRequest,
  OfferCommentDto,
  OfferCommentsResponseDto,
  OfferItemDto,
  RegisterUserRequest,
  ReportOfferRequest,
  ReportRequest,
  SearchOffersRequest,
  SearchOffersResponse,
  SetAvatarRequest,
  SetFavoriteRequest,
  SuggestionRequest,
  UserProfileDto,
} from './types';

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

/**
 * Raised when a request is abandoned because a newer request superseded it.
 */
export class RequestAbortedError extends Error {
  constructor() {
    super('Request superseded');
    this.name = 'RequestAbortedError';
  }
}

export class ApiRequestError extends Error {
  status: number;
  statusText: string;
  responseText: string;
  /** Field-level failures, when the server returned a validation error. */
  fieldErrors: Record<string, string[]>;
  /** Seconds the caller should wait before retrying, when the server said so. */
  retryAfterSeconds: number | null;

  constructor(
    status: number,
    statusText: string,
    message: string,
    responseText = '',
    fieldErrors: Record<string, string[]> = {},
    retryAfterSeconds: number | null = null
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.statusText = statusText;
    this.responseText = responseText;
    this.fieldErrors = fieldErrors;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Per-request controls. A signal lets the caller abandon a request that has been superseded.
 */
export interface RequestOptions {
  signal?: AbortSignal;
}

interface ApiFactoryOptions {
  baseUrl: string;
  getAccessToken: () => string | null;
  onUnauthorized?: () => Promise<void> | void;
}

/**
 * The hosts that can serve the API during development.
 *
 * The correct address depends on where the client runs: `localhost` for a browser or an iOS
 * simulator, `10.0.2.2` for an Android emulator. A wrong choice produces a connection timeout
 * that is easy to make and hard to diagnose, so in development the client falls back to the
 * other known addresses before giving up.
 */
const DEVELOPMENT_HOSTS = ['localhost', '10.0.2.2'] as const;

let resolvedDevelopmentBaseUrl: string | null = null;

function isDevelopmentEnvironment(): boolean {
  return typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';
}

/**
 * Builds the alternative addresses of the same API, keeping the configured port.
 */
function buildFallbackBaseUrls(baseUrl: string): string[] {
  const port = (() => {
    const match = /:(\d{2,5})(?:\/|$)/.exec(baseUrl);
    return match ? match[1] : null;
  })();

  return DEVELOPMENT_HOSTS.map((host) =>
    port ? `http://${host}:${port}` : `http://${host}`
  ).filter((candidate) => candidate !== baseUrl);
}

/**
 * True when the failure is a network-level failure rather than an HTTP response.
 */
function isNetworkFailure(error: unknown): boolean {
  return (
    error instanceof TypeError &&
    !(typeof error === 'object' && error !== null && 'name' in error && (error as { name?: string }).name === 'AbortError')
  );
}

const MAX_ATTEMPTS = 3;
const TRANSIENT_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const MAX_RETRY_AFTER_SECONDS = 5;

/**
 * Identical in-flight reads share one network round trip, so a burst of the same query
 * produces a single request instead of many.
 */
const inFlightReads = new Map<string, Promise<unknown>>();

function isAbortError(error: unknown): boolean {
  return (
    error instanceof RequestAbortedError ||
    (typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name?: string }).name === 'AbortError')
  );
}

/**
 * True when the failure is an abandoned request rather than a real error.
 */
export function isRequestAborted(error: unknown): boolean {
  return isAbortError(error);
}

function delay(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new RequestAbortedError());
      return;
    }

    const timeoutId = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, milliseconds);

    function onAbort() {
      clearTimeout(timeoutId);
      reject(new RequestAbortedError());
    }

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Exponential backoff with jitter, so that retries from many clients do not arrive together.
 */
function backoffDelay(attempt: number): number {
  const base = 250 * Math.pow(2, attempt - 1);
  return base + Math.random() * 150;
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) {
    return null;
  }

  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds;
  }

  const date = Date.parse(header);
  if (Number.isNaN(date)) {
    return null;
  }

  return Math.max(0, Math.round((date - Date.now()) / 1000));
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
    const parsed = JSON.parse(trimmed) as {
      error?: unknown;
      message?: unknown;
      title?: unknown;
      detail?: unknown;
    };
    const candidate = [parsed.detail, parsed.message, parsed.title, parsed.error].find(
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

function extractFieldErrors(responseText: string): Record<string, string[]> {
  try {
    const parsed = JSON.parse(responseText) as { errors?: unknown };
    if (parsed.errors && typeof parsed.errors === 'object') {
      const result: Record<string, string[]> = {};
      for (const [field, messages] of Object.entries(parsed.errors as Record<string, unknown>)) {
        if (Array.isArray(messages)) {
          result[field] = messages.filter((item): item is string => typeof item === 'string');
        }
      }
      return result;
    }
  } catch {
    // Ignore invalid JSON error bodies.
  }

  return {};
}

/**
 * Performs the fetch, falling back to the other development addresses when the configured one
 * cannot be reached. The address that worked is remembered for the remaining requests.
 */
async function fetchWithBaseUrlFallback(
  baseUrl: string,
  path: string,
  init: RequestInit,
  signal?: AbortSignal
): Promise<Response> {
  try {
    return await fetch(`${baseUrl}${path}`, { ...init, signal });
  } catch (error) {
    if (!isDevelopmentEnvironment() || signal?.aborted || !isNetworkFailure(error)) {
      throw error;
    }

    const candidates = resolvedDevelopmentBaseUrl
      ? [resolvedDevelopmentBaseUrl]
      : buildFallbackBaseUrls(baseUrl);

    for (const candidate of candidates) {
      try {
        const response = await fetch(`${candidate}${path}`, { ...init, signal });
        resolvedDevelopmentBaseUrl = candidate;
        console.warn(
          `[api] ${baseUrl} is unreachable; using ${candidate} instead. Set EXPO_PUBLIC_API_BASE_URL to match where the client runs.`
        );
        return response;
      } catch {
        // Try the next known address.
      }
    }

    throw error;
  }
}

async function throwApiError(response: Response) {
  const responseText = await response.text();
  throw new ApiRequestError(
    response.status,
    response.statusText,
    extractErrorMessage(response, responseText),
    responseText,
    extractFieldErrors(responseText),
    parseRetryAfter(response.headers.get('Retry-After'))
  );
}

async function request<TResponse>(
  options: ApiFactoryOptions,
  path: string,
  init?: RequestInit,
  requiresAuth = false,
  requestOptions?: RequestOptions
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

  const signal = requestOptions?.signal;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetchWithBaseUrlFallback(options.baseUrl, path, { ...init, headers }, signal);

      if (response.status === 401) {
        await options.onUnauthorized?.();
        throw new UnauthorizedError();
      }

      if (!response.ok) {
        const retryAfter = parseRetryAfter(response.headers.get('Retry-After'));

        if (
          attempt < MAX_ATTEMPTS &&
          TRANSIENT_STATUS_CODES.has(response.status) &&
          (retryAfter === null || retryAfter <= MAX_RETRY_AFTER_SECONDS)
        ) {
          await delay(retryAfter !== null ? retryAfter * 1000 : backoffDelay(attempt), signal);
          continue;
        }

        await throwApiError(response);
      }

      return (await readJson<TResponse>(response)) as TResponse;
    } catch (error) {
      if (isAbortError(error)) {
        throw error instanceof RequestAbortedError ? error : new RequestAbortedError();
      }

      if (error instanceof UnauthorizedError || error instanceof ApiRequestError) {
        throw error;
      }

      if (attempt < MAX_ATTEMPTS) {
        await delay(backoffDelay(attempt), signal);
        continue;
      }

      throw error;
    }
  }

  throw new Error('The request could not be completed.');
}

/**
 * Runs a read, reusing an identical read that is already in flight.
 */
async function coalescedRead<TResponse>(
  key: string,
  factory: () => Promise<TResponse>
): Promise<TResponse> {
  const existing = inFlightReads.get(key);
  if (existing) {
    return existing as Promise<TResponse>;
  }

  const pending = factory().finally(() => {
    inFlightReads.delete(key);
  });

  inFlightReads.set(key, pending);
  return pending;
}

async function requestCommandResult(
  options: ApiFactoryOptions,
  path: string,
  init?: RequestInit,
  requiresAuth = false,
  requestOptions?: RequestOptions
) {
  try {
    return await request<CommandResult>(options, path, init, requiresAuth, requestOptions);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { success: false, message: 'Unauthorized.' };
    }

    if (isAbortError(error)) {
      throw error;
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Request failed.',
    } satisfies CommandResult;
  }
}

export function createDealsSeekerApi(options: ApiFactoryOptions) {
  return {
    async registerUser(requestBody: RegisterUserRequest, requestOptions?: RequestOptions) {
      return requestCommandResult(options, '/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }, false, requestOptions);
    },

    async login(requestBody: LoginRequest, requestOptions?: RequestOptions) {
      const response = await request<AuthSessionDto>(
        options,
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        },
        false,
        requestOptions
      );

      return response ?? null;
    },

    async logout(requestOptions?: RequestOptions) {
      return requestCommandResult(
        options,
        '/api/auth/logout',
        {
          method: 'POST',
        },
        true,
        requestOptions
      );
    },

    async getMyProfile(requestOptions?: RequestOptions) {
      const response = await request<UserProfileDto>(
        options,
        '/api/account/me',
        undefined,
        true,
        requestOptions
      );

      return response ?? null;
    },

    async getMyOffers(requestOptions?: RequestOptions) {
      const response = await request<OfferItemDto[]>(
        options,
        '/api/account/offers',
        undefined,
        true,
        requestOptions
      );

      return response ?? [];
    },

    async getMyOfferDraft(offerId: string, requestOptions?: RequestOptions) {
      try {
        const response = await request<AddOfferRequest>(
          options,
          `/api/account/offers/${encodeURIComponent(offerId)}`,
          undefined,
          true,
          requestOptions
        );

        return response ?? null;
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },

    async setMyAvatar(requestBody: SetAvatarRequest, requestOptions?: RequestOptions) {
      return requestCommandResult(
        options,
        '/api/account/me/avatar',
        {
          method: 'PUT',
          body: JSON.stringify(requestBody),
        },
        true,
        requestOptions
      );
    },

    async searchOffers(requestBody: SearchOffersRequest, requestOptions?: RequestOptions) {
      return request<SearchOffersResponse>(
        options,
        '/api/offers/search',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        },
        true,
        requestOptions
      );
    },

    async voteOfferAvailability(
      offerId: string,
      requestBody: OfferAvailabilityVoteRequest,
      requestOptions?: RequestOptions
    ) {
      return requestCommandResult(
        options,
        `/api/offers/${encodeURIComponent(offerId)}/availability`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        },
        true,
        requestOptions
      );
    },

    async reportOffer(
      offerId: string,
      requestBody: ReportOfferRequest,
      requestOptions?: RequestOptions
    ) {
      return requestCommandResult(
        options,
        `/api/offers/${encodeURIComponent(offerId)}/report`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        },
        false,
        requestOptions
      );
    },

    async setOfferFavorite(
      offerId: string,
      requestBody: SetFavoriteRequest,
      requestOptions?: RequestOptions
    ) {
      return requestCommandResult(
        options,
        `/api/offers/${encodeURIComponent(offerId)}/favorite`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        },
        true,
        requestOptions
      );
    },

    async getOfferComments(
      offerId: string,
      limit?: number,
      after?: string | null,
      requestOptions?: RequestOptions
    ) {
      const query = new URLSearchParams();
      if (limit !== undefined) {
        query.set('limit', String(limit));
      }
      if (after) {
        query.set('after', after);
      }

      const suffix = query.toString();
      const path = `/api/offers/${encodeURIComponent(offerId)}/comments${suffix ? `?${suffix}` : ''}`;

      return coalescedRead(`comments:${offerId}:${suffix}`, () =>
        request<OfferCommentsResponseDto>(options, path, undefined, true, requestOptions)
      );
    },

    async createOfferComment(
      offerId: string,
      requestBody: CreateCommentRequest,
      requestOptions?: RequestOptions
    ) {
      return request<OfferCommentDto>(
        options,
        `/api/offers/${encodeURIComponent(offerId)}/comments`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        },
        true,
        requestOptions
      );
    },

    async createOffer(requestBody: AddOfferRequest, requestOptions?: RequestOptions) {
      return request<OfferItemDto>(
        options,
        '/api/offers',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        },
        true,
        requestOptions
      );
    },

    async updateOffer(
      offerId: string,
      requestBody: AddOfferRequest,
      requestOptions?: RequestOptions
    ) {
      return request<OfferItemDto>(
        options,
        `/api/offers/${encodeURIComponent(offerId)}`,
        {
          method: 'PUT',
          body: JSON.stringify(requestBody),
        },
        true,
        requestOptions
      );
    },

    async deleteOffer(offerId: string, requestOptions?: RequestOptions) {
      return requestCommandResult(
        options,
        `/api/offers/${encodeURIComponent(offerId)}`,
        {
          method: 'DELETE',
        },
        true,
        requestOptions
      );
    },

    async searchLocations(query: string, requestOptions?: RequestOptions) {
      const encoded = encodeURIComponent(query);
      return coalescedRead(`locations:${query.trim().toLowerCase()}`, () =>
        request<LocationSearchResultDto[]>(
          options,
          `/api/locations/search?query=${encoded}`,
          undefined,
          false,
          requestOptions
        )
      );
    },

    async reverseLocation(lat: number, lng: number, requestOptions?: RequestOptions) {
      try {
        const response = await request<LocationSearchResultDto>(
          options,
          `/api/locations/reverse?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(
            String(lng)
          )}`,
          undefined,
          false,
          requestOptions
        );

        return response ?? null;
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },

    async submitSuggestion(
      requestBody: SuggestionRequest,
      requestOptions?: RequestOptions
    ) {
      return requestCommandResult(options, '/api/suggestions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }, false, requestOptions);
    },

    async submitReport(requestBody: ReportRequest, requestOptions?: RequestOptions) {
      return requestCommandResult(options, '/api/reports', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }, false, requestOptions);
    },
  };
}
