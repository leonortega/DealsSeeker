/**
 * Optional development-only position for environments without a usable
 * location provider. Read at call time so tests and reloads see the current
 * environment configuration.
 */
export function resolveEmulatorLocation(): { lat: number; lng: number } | null {
  const raw: string | undefined = process.env['EXPO_PUBLIC_EMULATOR_LOCATION'];
  if (!raw) {
    return null;
  }

  const [lat, lng] = raw.split(',').map((part) => Number(part.trim()));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return { lat, lng };
}
