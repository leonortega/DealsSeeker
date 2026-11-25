import { Linking, Platform } from 'react-native';
import { GeoPoint, NavigationMode } from '../api/types';

function buildGoogleTravelMode(mode: NavigationMode) {
  return mode === 'car' ? 'driving' : 'walking';
}

function buildNativeMode(mode: NavigationMode) {
  return mode === 'car' ? 'd' : 'w';
}

export async function openDirections(destination: GeoPoint, navigationMode: NavigationMode) {
  const lat = destination.lat.toString();
  const lng = destination.lng.toString();
  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${buildGoogleTravelMode(
    navigationMode
  )}`;

  if (Platform.OS === 'android') {
    const nativeUrl = `google.navigation:q=${lat},${lng}&mode=${buildNativeMode(navigationMode)}`;
    if (await Linking.canOpenURL(nativeUrl)) {
      await Linking.openURL(nativeUrl);
      return;
    }
  }

  if (Platform.OS === 'ios') {
    const nativeUrl = `maps://?daddr=${lat},${lng}&dirflg=${buildNativeMode(navigationMode)}`;
    if (await Linking.canOpenURL(nativeUrl)) {
      await Linking.openURL(nativeUrl);
      return;
    }
  }

  await Linking.openURL(webUrl);
}
