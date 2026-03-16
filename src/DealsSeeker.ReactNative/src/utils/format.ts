import { OfferItemDto } from '../api/types';

export function formatDistanceMeters(distanceMeters: number) {
  return `${Math.round(Math.max(0, distanceMeters))} m`;
}

export function shorten(text: string, max = 120) {
  const trimmed = (text ?? '').trim();
  if (trimmed.length <= max) {
    return trimmed;
  }

  return `${trimmed.slice(0, max - 3).trimEnd()}...`;
}

export function extractWords(text: string) {
  const matches = text.match(/\b[\p{L}\p{Nd}][\p{L}\p{Nd}\-']*%?(?=\b|\s|$|[.,;:!?])/gu) ?? [];
  return Array.from(new Set(matches.map((word) => word.trim()).filter(Boolean))).slice(0, 30);
}

export function validateEmail(email: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/u.test(email.trim());
}

export function validateStrongPassword(password: string) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export function partitionOffers(offers: OfferItemDto[], query: string) {
  if (query.trim().length > 0) {
    return {
      promoted: [] as OfferItemDto[],
      feed: offers.slice().sort((left, right) => Number(left.isReported) - Number(right.isReported)),
    };
  }

  const promoted = offers
    .filter((offer) => offer.isPromoted && !offer.isReported)
    .sort((left, right) => Number(left.isReported) - Number(right.isReported));
  const promotedIds = new Set(promoted.map((offer) => offer.offerId));
  const feed = offers
    .filter((offer) => !promotedIds.has(offer.offerId))
    .sort((left, right) => Number(left.isReported) - Number(right.isReported));

  return { promoted, feed };
}
