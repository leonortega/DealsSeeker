import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { BusinessMarkerDto, GeoPoint } from '../api/types';
import { useApp } from '../hooks/useApp';
import { MapPreview } from './MapPreview';

export interface NativeMapPreviewProps {
  center: GeoPoint;
  businesses: BusinessMarkerDto[];
  radiusMeters: number;
  showUserMarker?: boolean;
  onSelectMarker?: (marker: BusinessMarkerDto) => void;
  interactive?: boolean;
  onMapTap?: (point: GeoPoint) => void;
  pin?: GeoPoint | null;
  hint?: string;
  showCoverage?: boolean;
  height?: number;
}

export function NativeMapPreview({
  center,
  businesses,
  radiusMeters,
  showUserMarker,
  onSelectMarker,
  interactive,
  onMapTap,
  pin,
  hint,
  showCoverage,
  height,
}: NativeMapPreviewProps) {
  const { palette } = useApp();
  const fallbackProps = {
    center,
    businesses,
    radiusMeters,
    showUserMarker,
    onSelectMarker,
    interactive,
    onMapTap,
    pin,
    hint,
    showCoverage,
    height,
  };

  if (!MapView) {
    return <MapPreview {...fallbackProps} />;
  }

  return (
    <View testID="native-map" style={[styles.container, height ? { height } : null]}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        onPress={(event) => {
          if (onMapTap) {
            onMapTap({
              lat: event.nativeEvent.coordinate.latitude,
              lng: event.nativeEvent.coordinate.longitude,
            });
          }
        }}
      >
        {showCoverage ? (
          <Circle
            center={{ latitude: center.lat, longitude: center.lng }}
            radius={Math.max(100, radiusMeters)}
            fillColor={palette.accentMuted}
            strokeColor={palette.accent}
          />
        ) : null}
        {showUserMarker ? (
          <Marker
            testID="native-map-user"
            coordinate={{ latitude: center.lat, longitude: center.lng }}
            pinColor={palette.success}
            title={hint}
          />
        ) : null}
        {businesses.map((marker) => (
          <Marker
            key={marker.businessId}
            testID={`native-map-marker-${marker.businessId}`}
            coordinate={{ latitude: marker.location.lat, longitude: marker.location.lng }}
            title={marker.name}
            pinColor={palette.accent}
            onPress={() => onSelectMarker?.(marker)}
          />
        ))}
        {pin ? (
          <Marker
            testID="native-map-pin"
            coordinate={{ latitude: pin.lat, longitude: pin.lng }}
            pinColor={palette.danger}
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});
