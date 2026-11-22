export function resolveAddOfferColumns(width: number) {
  return width >= 720 ? 2 : 1;
}

export function resolveOffersGridColumns(width: number) {
  if (width >= 1080) {
    return 3;
  }

  return width >= 720 ? 2 : 1;
}
