import { Linking } from 'react-native';
import { GeoPoint, NavigationMode } from '../api/types';

function buildGoogleTravelMode(mode: NavigationMode) {
  return mode === 'car' ? 'driving' : 'walking';
}

/**
 * Opens a Google Maps route preview with the user's selected travel mode.
 * The HTTPS directions URL keeps the mode explicit on every platform and does
 * not start turn-by-turn navigation automatically.
 */
export async function openDirections(destination: GeoPoint, navigationMode: NavigationMode) {
  const lat = destination.lat.toString();
  const lng = destination.lng.toString();
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${buildGoogleTravelMode(
    navigationMode
  )}`;

  await Linking.openURL(url);
}
