const CLIENT_PATH = '../../../src/DealsSeeker.ReactNative/src/api/client';

function loadApi(getAccessToken: () => string | null = () => 'tok') {
  jest.resetModules();
  const { createDealsSeekerApi, ApiRequestError, UnauthorizedError, RequestAbortedError, isRequestAborted } =
    require(CLIENT_PATH);
  return {
    api: createDealsSeekerApi({
      baseUrl: 'http://api.test',
      getAccessToken,
      onUnauthorized: jest.fn(async () => {}),
    }),
    ApiRequestError,
    UnauthorizedError,
    RequestAbortedError,
    isRequestAborted,
  };
}

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers,
  });
}

describe('API client', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs in with a POST and returns the session', async () => {
    const { api } = loadApi();
    const session = { userId: 'usr-1', displayName: 'Ada', email: 'a@b.co', accessToken: 'tok-1' };
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(jsonResponse(session));

    const result = await api.login({ email: 'a@b.co', password: 'password1' });

    expect(result).toEqual(session);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/auth/login');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ email: 'a@b.co', password: 'password1' });
  });

  it('sends the bearer token for authenticated reads', async () => {
    const { api } = loadApi();
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      jsonResponse({ userId: 'usr-1', displayName: 'Ada', email: 'a@b.co', avatarId: 'cat' })
    );

    await api.getMyProfile();

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Headers).get('Authorization')).toBe('Bearer tok');
  });

  it('rejects authenticated calls without a token', async () => {
    const { api, UnauthorizedError } = loadApi(() => null);
    const fetchMock = jest.spyOn(global, 'fetch');

    await expect(api.getMyProfile()).rejects.toBeInstanceOf(UnauthorizedError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('raises UnauthorizedError and notifies on 401', async () => {
    const { api, UnauthorizedError } = loadApi();
    const onUnauthorized = jest.fn(async () => {});
    const withCallback = require(CLIENT_PATH).createDealsSeekerApi({
      baseUrl: 'http://api.test',
      getAccessToken: () => 'tok',
      onUnauthorized,
    });
    jest.spyOn(global, 'fetch').mockResolvedValue(jsonResponse({}, 401));

    await expect(withCallback.getMyProfile()).rejects.toBeInstanceOf(UnauthorizedError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    await expect(api.getMyProfile()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('maps validation errors and Retry-After into ApiRequestError', async () => {
    const { api, ApiRequestError } = loadApi();
    jest.spyOn(global, 'fetch').mockResolvedValue(
      jsonResponse(
        { title: 'Invalid', errors: { query: ['too long'] } },
        400,
        { 'Retry-After': '2' }
      )
    );

    const error = await api.searchOffers({ query: 'x', userLocation: { lat: 0, lng: 0 } }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error.status).toBe(400);
    expect(error.fieldErrors).toEqual({ query: ['too long'] });
    expect(error.retryAfterSeconds).toBe(2);
    expect(error.message).toContain('Invalid');
  });

  it('returns null for empty responses and for missing drafts', async () => {
    const { api } = loadApi();
    const fetchMock = jest.spyOn(global, 'fetch');

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    expect(await api.logout()).toBeNull();

    fetchMock.mockResolvedValueOnce(jsonResponse({}, 404));
    expect(await api.getMyOfferDraft('off-1')).toBeNull();

    fetchMock.mockResolvedValueOnce(jsonResponse({}, 404));
    expect(await api.reverseLocation(1, 2)).toBeNull();
  });

  it('maps command failures to CommandResult', async () => {
    const { api } = loadApi();
    jest.spyOn(global, 'fetch').mockResolvedValue(jsonResponse({ message: 'nope' }, 400));

    expect(await api.submitSuggestion({ message: 'hi' })).toEqual({ success: false, message: '400 Error: nope' });
  });

  it('recognises aborted requests', () => {
    const { RequestAbortedError, isRequestAborted } = loadApi();

    expect(isRequestAborted(new RequestAbortedError())).toBe(true);
    expect(isRequestAborted(Object.assign(new Error('aborted'), { name: 'AbortError' }))).toBe(true);
    expect(isRequestAborted(new Error('other'))).toBe(false);
  });

  it('coalesces identical in-flight reads', async () => {
    const { api } = loadApi();
    let resolveFetch!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    const fetchMock = jest.spyOn(global, 'fetch').mockReturnValue(pending);

    const first = api.getOfferComments('off-1', 10);
    const second = api.getOfferComments('off-1', 10);
    resolveFetch(jsonResponse({ comments: [], hasMore: false }));

    const [a, b] = await Promise.all([first, second]);
    expect(a).toEqual(b);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('routes every remaining endpoint through the shared request pipeline', async () => {
    const { api } = loadApi();
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(async () =>
      jsonResponse({ success: true, offers: [], comments: [] })
    );
    const body = {} as never;

    await api.registerUser(body);
    await api.getMyOffers();
    await api.getMyOfferDraft('off-1');
    await api.setMyAvatar(body);
    await api.voteOfferAvailability('off-1', body);
    await api.reportOffer('off-1', body);
    await api.setOfferFavorite('off-1', body);
    await api.createOfferComment('off-1', body);
    await api.createOffer(body);
    await api.updateOffer('off-1', body);
    await api.deleteOffer('off-1');
    await api.submitReport(body);

    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      'http://api.test/api/auth/register',
      'http://api.test/api/account/offers',
      'http://api.test/api/account/offers/off-1',
      'http://api.test/api/account/me/avatar',
      'http://api.test/api/offers/off-1/availability',
      'http://api.test/api/offers/off-1/report',
      'http://api.test/api/offers/off-1/favorite',
      'http://api.test/api/offers/off-1/comments',
      'http://api.test/api/offers',
      'http://api.test/api/offers/off-1',
      'http://api.test/api/offers/off-1',
      'http://api.test/api/reports',
    ]);
  });

  it('encodes query parameters and offer identifiers', async () => {
    const { api } = loadApi();
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(jsonResponse([]));

    await api.searchLocations('a b/c');
    await api.voteOfferAvailability('off 1', { vote: 1 });

    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/api/locations/search?query=a%20b%2Fc');
    expect(fetchMock.mock.calls[1][0]).toBe('http://api.test/api/offers/off%201/availability');
  });

  it('reuses a cached Photon search result for an identical query', async () => {
    const { api } = loadApi();
    const results = [{ label: 'Central Park', position: { lat: 40.7128, lng: -74.006 } }];
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(jsonResponse(results));

    expect(await api.searchLocations('Central Park')).toEqual(results);
    expect(await api.searchLocations('  central park  ')).toEqual(results);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reuses a cached reverse-geocode result for the same coordinate', async () => {
    const { api } = loadApi();
    const result = { label: 'Central Park', position: { lat: 40.7128, lng: -74.006 } };
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(jsonResponse(result));

    expect(await api.reverseLocation(40.7128, -74.006)).toEqual(result);
    expect(await api.reverseLocation(40.7128, -74.006)).toEqual(result);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
