/** Restore only non-first pages; the first page needs no scroll correction. */
export function resolveFeedRestoreIndex(
  offers: readonly { offerId: string }[],
  activeOfferId: string | null
): number | null {
  if (!activeOfferId) {
    return null;
  }
  const index = offers.findIndex((offer) => offer.offerId === activeOfferId);
  return index > 0 ? index : null;
}
