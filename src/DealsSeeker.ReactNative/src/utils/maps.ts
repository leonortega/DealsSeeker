import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';
import { GeoPoint, NavigationMode } from '../api/types';
import { resolveRedirectProvider } from '../api/config';

function buildGoogleTravelMode(mode: NavigationMode) {
  return mode === 'car' ? 'driving' : 'walking';
}

function buildAndroidMode(mode: NavigationMode) {
  return mode === 'car' ? 'd' : 'w';
}

function buildIosMode(mode: NavigationMode) {
  return mode === 'car' ? 'd' : 'w';
}

function buildOpenStreetMapEngine(mode: NavigationMode) {
  return mode === 'car' ? 'fossgis_osrm_car' : 'fossgis_osrm_foot';
}

export async function openDirections(destination: GeoPoint, navigationMode: NavigationMode) {
  const lat = destination.lat.toString();
  const lng = destination.lng.toString();
  const provider = resolveRedirectProvider();

  if (provider === 'GoogleMaps') {
    const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${buildGoogleTravelMode(
      navigationMode
    )}`;

    if (Platform.OS === 'android') {
      const nativeUrl = `google.navigation:q=${lat},${lng}&mode=${buildAndroidMode(navigationMode)}`;
      if (await Linking.canOpenURL(nativeUrl)) {
        await Linking.openURL(nativeUrl);
        return;
      }
    }

    if (Platform.OS === 'ios') {
      const nativeUrl = `maps://?daddr=${lat},${lng}&dirflg=${buildIosMode(navigationMode)}`;
      if (await Linking.canOpenURL(nativeUrl)) {
        await Linking.openURL(nativeUrl);
        return;
      }
    }

    await Linking.openURL(webUrl);
    return;
  }

  let originSegment = '';

  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.granted) {
      const origin = await Location.getCurrentPositionAsync({
        accuracy: Location.LocationAccuracy.Balanced,
      });
      originSegment = `${origin.coords.latitude}%2C${origin.coords.longitude}%3B`;
    }
  } catch {
    originSegment = '';
  }

  const openStreetMapUrl = originSegment
    ? `https://www.openstreetmap.org/directions?engine=${buildOpenStreetMapEngine(
        navigationMode
      )}&route=${originSegment}${lat}%2C${lng}`
    : `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  await Linking.openURL(openStreetMapUrl);
}
