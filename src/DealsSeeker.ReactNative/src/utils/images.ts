import { apiConfig } from '../api/config';

export function resolveOfferImageUri(imageUrl?: string | null) {
  const candidate = imageUrl?.trim();
  if (!candidate) {
    return null;
  }

  if (/^(data|https?|file|content|blob):/iu.test(candidate)) {
    return candidate;
  }

  if (candidate.startsWith('/')) {
    return `${apiConfig.baseUrl}${candidate}`;
  }

  return null;
}

export function isSvgImageUri(imageUrl?: string | null) {
  const candidate = imageUrl?.trim().toLowerCase();
  if (!candidate) {
    return false;
  }

  return candidate.endsWith('.svg') || candidate.startsWith('data:image/svg+xml');
}
