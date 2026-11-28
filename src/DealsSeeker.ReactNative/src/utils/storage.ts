import * as SecureStore from 'expo-secure-store';
import {
  GeoPoint,
  Language,
  NavigationMode,
  OfferImageDto,
  OfferLocationDto,
  ThemeMode,
  ThemeWorld,
  UserPreferences,
} from '../api/types';

const SESSION_KEY = 'dealseeker.auth.session';
const FIRST_RUN_KEY = 'dealseeker.onboarding.completed';
const ADD_OFFER_DRAFT_KEY = 'dealseeker.addOffer.draft';

export interface AddOfferDraftSnapshot {
  description: string;
  tags: string[];
  images: OfferImageDto[];
  location: OfferLocationDto | null;
  locationQuery?: string;
  locationConfirmed?: boolean;
  mapCenter?: GeoPoint | null;
}
export const DEFAULT_PREFERENCES: UserPreferences = {
  themeMode: 'system',
  themeWorld: 'tangerine',
  language: 'en',
  navigationMode: 'pedestrian',
};

function preferenceKey(kind: 'theme' | 'world' | 'language' | 'navigation', userId?: string | null) {
  const suffix = userId?.trim() ? userId.trim() : 'global';
  return `dealseeker.${kind}.${suffix}`;
}

async function readValue(key: string) {
  return SecureStore.getItemAsync(key);
}

async function writeValue(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

async function deleteValue(key: string) {
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

export async function loadFirstRunCompleted() {
  return (await readValue(FIRST_RUN_KEY)) === 'true';
}

export async function saveFirstRunCompleted() {
  await writeValue(FIRST_RUN_KEY, 'true');
}

function normalizeThemeMode(value?: string | null): ThemeMode {
  return value === 'light' || value === 'dark' ? value : 'system';
}

function normalizeThemeWorld(value?: string | null): ThemeWorld {
  return value === 'golden' || value === 'market' || value === 'tangerine' ? value : 'tangerine';
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
  const [themeMode, themeWorld, language, navigationMode] = await Promise.all([
    readValue(preferenceKey('theme', userId)),
    readValue(preferenceKey('world', userId)),
    readValue(preferenceKey('language', userId)),
    readValue(preferenceKey('navigation', userId)),
  ]);

  return {
    themeMode: normalizeThemeMode(themeMode),
    themeWorld: normalizeThemeWorld(themeWorld),
    language: normalizeLanguage(language ?? fallbackLanguage),
    navigationMode: normalizeNavigationMode(navigationMode),
  };
}

export async function savePreferences(preferences: UserPreferences, userId?: string | null) {
  await Promise.all([
    writeValue(preferenceKey('theme', userId), preferences.themeMode),
    writeValue(preferenceKey('world', userId), preferences.themeWorld),
    writeValue(preferenceKey('language', userId), preferences.language),
    writeValue(preferenceKey('navigation', userId), preferences.navigationMode),
  ]);
}

export async function loadAddOfferDraft(): Promise<AddOfferDraftSnapshot | null> {
  const raw = await readValue(ADD_OFFER_DRAFT_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AddOfferDraftSnapshot;
    if (!parsed || typeof parsed.description !== 'string' || !Array.isArray(parsed.tags) || !Array.isArray(parsed.images)) {
      throw new Error('Invalid draft');
    }
    return parsed;
  } catch {
    await deleteValue(ADD_OFFER_DRAFT_KEY);
    return null;
  }
}

export async function saveAddOfferDraft(draft: AddOfferDraftSnapshot) {
  await writeValue(ADD_OFFER_DRAFT_KEY, JSON.stringify(draft));
}

export async function clearAddOfferDraft() {
  await deleteValue(ADD_OFFER_DRAFT_KEY);
}
