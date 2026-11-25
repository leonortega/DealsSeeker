import { StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { BusinessMarkerDto, GeoPoint } from '../api/types';
import { useApp } from '../hooks/useApp';

export interface NativeMapPreviewProps {
  center: GeoPoint;
  businesses: BusinessMarkerDto[];
  radiusMeters: number;
  showUserMarker?: boolean;
  onSelectMarker?: (marker: BusinessMarkerDto) => void;
  interactive?: boolean;
  onMapTap?: (point: GeoPoint) => void;
  onMapDragEnd?: (point: GeoPoint) => void;
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
  onMapDragEnd,
  pin,
  hint,
  showCoverage,
  height,
}: NativeMapPreviewProps) {
  const { palette, t } = useApp();

  if (!MapView) {
    return (
      <View testID="native-map-unavailable" accessibilityRole="alert" style={styles.container}>
        <Text style={{ color: palette.ink }}>{t('offers.mapUnavailable')}</Text>
      </View>
    );
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
          onMapTap?.({
            lat: event.nativeEvent.coordinate.latitude,
            lng: event.nativeEvent.coordinate.longitude,
          });
        }}
        onRegionChangeComplete={(region) => {
          if (interactive) {
            onMapDragEnd?.({ lat: region.latitude, lng: region.longitude });
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
