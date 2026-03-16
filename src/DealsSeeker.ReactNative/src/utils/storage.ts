import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Language, NavigationMode, ThemeMode, UserPreferences } from '../api/types';

const SESSION_KEY = 'dealseeker.auth.session';
export const DEFAULT_PREFERENCES: UserPreferences = {
  themeMode: 'system',
  language: 'en',
  navigationMode: 'pedestrian',
};

function preferenceKey(kind: 'theme' | 'language' | 'navigation', userId?: string | null) {
  const suffix = userId?.trim() ? userId.trim() : 'global';
  return `dealseeker.${kind}.${suffix}`;
}

async function readValue(key: string) {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

async function writeValue(key: string, value: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function deleteValue(key: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function loadSession<T>() {
  const raw = await readValue(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    await deleteValue(SESSION_KEY);
    return null;
  }
}

export async function saveSession(value: unknown) {
  await writeValue(SESSION_KEY, JSON.stringify(value));
}

export async function clearSession() {
  await deleteValue(SESSION_KEY);
}

function normalizeThemeMode(value?: string | null): ThemeMode {
  return value === 'light' || value === 'dark' ? value : 'system';
}

function normalizeLanguage(value?: string | null): Language {
  return value?.trim().toLowerCase().startsWith('es') ? 'es' : 'en';
}

function normalizeNavigationMode(value?: string | null): NavigationMode {
  return value?.trim().toLowerCase() === 'car' ? 'car' : 'pedestrian';
}

export async function loadPreferences(
  fallbackLanguage: Language,
  userId?: string | null
): Promise<UserPreferences> {
  const [themeMode, language, navigationMode] = await Promise.all([
    readValue(preferenceKey('theme', userId)),
    readValue(preferenceKey('language', userId)),
    readValue(preferenceKey('navigation', userId)),
  ]);

  return {
    themeMode: normalizeThemeMode(themeMode),
    language: normalizeLanguage(language ?? fallbackLanguage),
    navigationMode: normalizeNavigationMode(navigationMode),
  };
}

export async function savePreferences(preferences: UserPreferences, userId?: string | null) {
  await Promise.all([
    writeValue(preferenceKey('theme', userId), preferences.themeMode),
    writeValue(preferenceKey('language', userId), preferences.language),
    writeValue(preferenceKey('navigation', userId), preferences.navigationMode),
  ]);
}
