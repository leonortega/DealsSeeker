const STORAGE_PATH = '../../../src/DealsSeeker.ReactNative/src/utils/storage';

const store = new Map<string, string>();
const mockSecureStore = {
  getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    store.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    store.delete(key);
  }),
};

jest.mock('expo-secure-store', () => mockSecureStore);

describe('session and preference storage on native', () => {
  let storage: typeof import('../../../src/DealsSeeker.ReactNative/src/utils/storage');

  beforeEach(() => {
    jest.resetModules();
    store.clear();
    mockSecureStore.getItemAsync.mockClear();
    mockSecureStore.setItemAsync.mockClear();
    mockSecureStore.deleteItemAsync.mockClear();
    storage = require(STORAGE_PATH);
  });

  it('round-trips a session through secure storage', async () => {
    const session = { userId: 'usr-1', accessToken: 'tok-1' };
    await storage.saveSession(session);

    expect(await storage.loadSession()).toEqual(session);
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith('dealseeker.auth.session', JSON.stringify(session));
  });

  it('returns null and clears an unreadable session', async () => {
    store.set('dealseeker.auth.session', '{broken');

    expect(await storage.loadSession()).toBeNull();
    expect(store.has('dealseeker.auth.session')).toBe(false);
  });

  it('clears the session', async () => {
    await storage.saveSession({ token: 'x' });
    await storage.clearSession();

    expect(await storage.loadSession()).toBeNull();
  });

  it('loads normalized preference defaults', async () => {
    expect(await storage.loadPreferences('en')).toEqual(storage.DEFAULT_PREFERENCES);
    expect(await storage.loadPreferences('es')).toEqual({ ...storage.DEFAULT_PREFERENCES, language: 'es' });
  });

  it('normalizes stored preference values', async () => {
    store.set('dealseeker.theme.usr-1', 'dark');
    store.set('dealseeker.language.usr-1', 'es-AR');
    store.set('dealseeker.navigation.usr-1', 'car');

    expect(await storage.loadPreferences('en', 'usr-1')).toEqual({
      themeMode: 'dark',
      themeWorld: 'tangerine',
      language: 'es',
      navigationMode: 'car',
    });
  });

  it('saves preferences under a per-user key', async () => {
    await storage.savePreferences(
      { themeMode: 'light', themeWorld: 'market', language: 'es', navigationMode: 'car' },
      ' usr-1 '
    );

    expect(store.get('dealseeker.theme.usr-1')).toBe('light');
    expect(store.get('dealseeker.world.usr-1')).toBe('market');
    expect(store.get('dealseeker.language.usr-1')).toBe('es');
    expect(store.get('dealseeker.navigation.usr-1')).toBe('car');
  });
});
