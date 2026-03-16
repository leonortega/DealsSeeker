export type Language = 'en' | 'es';
export type ThemeMode = 'system' | 'light' | 'dark';
export type NavigationMode = 'pedestrian' | 'car';
export type MainTab = 'account' | 'offers' | 'suggestions' | 'reports';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface BusinessMarkerDto {
  businessId: string;
  name: string;
  location: GeoPoint;
  distanceMeters: number;
}

export interface OfferItemDto {
  offerId: string;
  businessId: string;
  businessName: string;
  description: string;
  tags: string[];
  imageUrl: string;
  imageUrls: string[];
  isActive: boolean;
  isPromoted: boolean;
  isFavorite: boolean;
  isReported: boolean;
  relevanceScore: number;
  matchStrategies: string[];
  location: GeoPoint;
  distanceMeters: number;
  positiveAvailabilityCount: number;
  negativeAvailabilityCount: number;
  hasCurrentUserVoted: boolean;
}

export interface SearchOffersRequest {
  query: string;
  userLocation: GeoPoint;
  radiusMeters?: number;
  locale?: string | null;
  favoritesOnly?: boolean;
}

export interface SearchOffersResponse {
  offers: OfferItemDto[];
  businesses: BusinessMarkerDto[];
}

export interface CommandResult {
  success: boolean;
  message: string;
}

export interface RegisterUserRequest {
  displayName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSessionDto {
  userId: string;
  displayName: string;
  email: string;
  accessToken: string;
}

export interface UserProfileDto {
  userId: string;
  displayName: string;
  email: string;
}

export interface OfferImageDto {
  source: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  order: number;
  fileName?: string | null;
  dataUrl?: string | null;
}

export interface OfferLocationDto {
  source: string;
  label?: string | null;
  position: GeoPoint;
}

export interface AddOfferRequest {
  description: string;
  tags: string[];
  images: OfferImageDto[];
  location?: OfferLocationDto | null;
}

export interface LocationSearchResultDto {
  label: string;
  position: GeoPoint;
}

export interface SuggestionRequest {
  message: string;
  contact?: string | null;
}

export interface ReportRequest {
  message: string;
  offerId?: string | null;
  userId?: string | null;
  reportedAtUtc?: string | null;
}

export interface SetFavoriteRequest {
  isFavorite: boolean;
}

export type OfferAvailabilityVoteType = 1 | 2;

export interface OfferAvailabilityVoteRequest {
  vote: OfferAvailabilityVoteType;
}

export interface ReportOfferRequest {
  reason: string;
}

export interface UserPreferences {
  themeMode: ThemeMode;
  language: Language;
  navigationMode: NavigationMode;
}

export interface OfferReportDraft {
  offer: OfferItemDto;
  userId: string;
  reportedAtUtc: string;
  initialMessage: string;
}
