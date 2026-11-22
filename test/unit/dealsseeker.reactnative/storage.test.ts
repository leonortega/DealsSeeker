jest.mock('react-native', () => ({ Platform: { OS: 'web' } }));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const STORAGE_PATH = '../../../src/DealsSeeker.ReactNative/src/utils/storage';

describe('session and preference storage', () => {
  let store: Map<string, string>;
  let storage: typeof import('../../../src/DealsSeeker.ReactNative/src/utils/storage');

  beforeEach(() => {
    jest.resetModules();
    store = new Map<string, string>();
    (globalThis as any).localStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    };
    storage = require(STORAGE_PATH);
  });

  it('round-trips a session', async () => {
    const session = { userId: 'usr-1', accessToken: 'tok-1' };
    await storage.saveSession(session);

    expect(await storage.loadSession()).toEqual(session);
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
      language: 'es',
      navigationMode: 'car',
    });
  });

  it('saves preferences under a per-user key', async () => {
    await storage.savePreferences(
      { themeMode: 'light', language: 'es', navigationMode: 'car' },
      ' usr-1 '
    );

    expect(store.get('dealseeker.theme.usr-1')).toBe('light');
    expect(store.get('dealseeker.language.usr-1')).toBe('es');
    expect(store.get('dealseeker.navigation.usr-1')).toBe('car');
  });
});
