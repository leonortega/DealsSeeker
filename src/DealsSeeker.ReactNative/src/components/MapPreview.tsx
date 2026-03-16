import { StyleSheet, Text, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { apiConfig, normalizeProvider, resolveDisplayProvider } from '../api/config';
import { BusinessMarkerDto, GeoPoint } from '../api/types';
import { useApp } from '../hooks/useApp';

interface MapPreviewProps {
  center: GeoPoint;
  businesses: BusinessMarkerDto[];
  radiusMeters: number;
  showUserMarker?: boolean;
  onSelectMarker?: (marker: BusinessMarkerDto) => void;
}

interface MapMessage {
  businessId: string;
  lat: number;
  lng: number;
  name: string;
  type: 'marker-selected';
}

function calculateMapZoomForCoverage(radiusMeters: number, latitude: number) {
  const safeRadius = Math.max(100, radiusMeters);
  const clampedLatitude = Math.max(-85, Math.min(85, latitude));
  const latitudeRadians = (clampedLatitude * Math.PI) / 180;

  const metersPerPixelAtZoom0 = 156543.03392;
  const assumedMapWidthPixels = 420;
  const diameterCoverageRatio = 0.75;
  const targetMetersPerPixel = (2 * safeRadius) / (assumedMapWidthPixels * diameterCoverageRatio);
  const latitudeScale = Math.max(0.1, Math.cos(latitudeRadians));
  const rawZoom = Math.log2((metersPerPixelAtZoom0 * latitudeScale) / targetMetersPerPixel);

  return Math.max(2, Math.min(18, Math.round(rawZoom)));
}

function escapeHtmlJson(value: unknown) {
  return JSON.stringify(value).replace(/</gu, '\\u003c');
}

function buildMapHtml({
  center,
  markers,
  provider,
  fallbackProvider,
  googleMapsApiKey,
  showUserMarker,
  zoom,
  themeMode,
}: {
  center: GeoPoint;
  markers: BusinessMarkerDto[];
  provider: 'GoogleMaps' | 'OpenLayers';
  fallbackProvider: 'GoogleMaps' | 'OpenLayers';
  googleMapsApiKey: string;
  showUserMarker: boolean;
  zoom: number;
  themeMode: 'light' | 'dark';
}) {
  const background = themeMode === 'dark' ? '#22332f' : '#edf3e7';
  const textColor = themeMode === 'dark' ? '#f7f1e8' : '#1f3128';
  const userColor = themeMode === 'dark' ? '#7ec48c' : '#2f6e46';
  const businessColor = themeMode === 'dark' ? '#f08f62' : '#b85c38';
  const markerPayload = markers.map((marker) => ({
    businessId: marker.businessId,
    lat: marker.location.lat,
    lng: marker.location.lng,
    name: marker.name,
  }));

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <title>DealsSeeker Map</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@10.6.1/ol.css" />
    <style>
      html, body, #map {
        background: ${background};
        height: 100%;
        margin: 0;
        overflow: hidden;
        padding: 0;
        width: 100%;
      }

      body {
        color: ${textColor};
        font-family: Arial, sans-serif;
      }

      .message {
        align-items: center;
        box-sizing: border-box;
        display: flex;
        height: 100%;
        justify-content: center;
        padding: 18px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const config = ${escapeHtmlJson({
        center,
        fallbackProvider,
        googleMapsApiKey,
        markers: markerPayload,
        provider,
        showUserMarker,
        zoom,
      })};

      function postMessage(payload) {
        if (!window.ReactNativeWebView || typeof window.ReactNativeWebView.postMessage !== 'function') {
          return;
        }

        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }

      function showMessage(text) {
        const node = document.getElementById('map');
        node.innerHTML = '<div class="message">' + text + '</div>';
      }

      function renderOpenLayers() {
        if (!window.ol || !ol.Map || !ol.layer || !ol.proj) {
          showMessage('Map library unavailable.');
          return;
        }

        const features = [];
        if (config.showUserMarker) {
          const userFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([config.center.lng, config.center.lat]))
          });

          userFeature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
              radius: 7,
              fill: new ol.style.Fill({ color: '${userColor}' }),
              stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
            })
          }));

          userFeature.set('isUserMarker', true);
          features.push(userFeature);
        }

        config.markers.forEach(function (marker) {
          const feature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([marker.lng, marker.lat])),
            name: marker.name
          });

          feature.setProperties(marker);
          feature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
              radius: 6,
              fill: new ol.style.Fill({ color: '${businessColor}' }),
              stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
            })
          }));

          features.push(feature);
        });

        const map = new ol.Map({
          target: 'map',
          layers: [
            new ol.layer.Tile({
              source: new ol.source.OSM({ transition: 0 })
            }),
            new ol.layer.Vector({
              source: new ol.source.Vector({ features })
            })
          ],
          view: new ol.View({
            center: ol.proj.fromLonLat([config.center.lng, config.center.lat]),
            zoom: config.zoom,
            enableRotation: false
          })
        });

        map.on('singleclick', function (event) {
          const feature = map.forEachFeatureAtPixel(event.pixel, function (hitFeature) {
            return hitFeature;
          }, { hitTolerance: 10 });

          if (!feature || feature.get('isUserMarker')) {
            return;
          }

          postMessage({
            type: 'marker-selected',
            businessId: feature.get('businessId'),
            lat: feature.get('lat'),
            lng: feature.get('lng'),
            name: feature.get('name') || ''
          });
        });
      }

      function renderGoogleMaps() {
        if (!config.googleMapsApiKey) {
          if (config.fallbackProvider === 'OpenLayers') {
            renderOpenLayers();
            return;
          }

          showMessage('Google Maps key is missing.');
          return;
        }

        function initialize() {
          if (!window.google || !google.maps || !google.maps.Map) {
            if (config.fallbackProvider === 'OpenLayers') {
              renderOpenLayers();
              return;
            }

            showMessage('Google Maps failed to load.');
            return;
          }

          const map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: config.center.lat, lng: config.center.lng },
            clickableIcons: false,
            fullscreenControl: false,
            mapTypeControl: false,
            rotateControl: false,
            streetViewControl: false,
            zoom: config.zoom
          });

          if (config.showUserMarker) {
            new google.maps.Marker({
              position: { lat: config.center.lat, lng: config.center.lng },
              map,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: '${userColor}',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
              }
            });
          }

          config.markers.forEach(function (marker) {
            const mapMarker = new google.maps.Marker({
              position: { lat: marker.lat, lng: marker.lng },
              map,
              title: marker.name
            });

            mapMarker.addListener('click', function () {
              postMessage({
                type: 'marker-selected',
                businessId: marker.businessId,
                lat: marker.lat,
                lng: marker.lng,
                name: marker.name
              });
            });
          });
        }

        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(config.googleMapsApiKey);
        script.async = true;
        script.defer = true;
        script.onload = initialize;
        script.onerror = function () {
          if (config.fallbackProvider === 'OpenLayers') {
            renderOpenLayers();
            return;
          }

          showMessage('Google Maps failed to load.');
        };
        document.head.appendChild(script);
      }

      const openLayersScript = document.createElement('script');
      openLayersScript.src = 'https://cdn.jsdelivr.net/npm/ol@10.6.1/dist/ol.js';
      openLayersScript.async = true;
      openLayersScript.defer = true;
      openLayersScript.onload = function () {
        if (config.provider === 'GoogleMaps') {
          renderGoogleMaps();
          return;
        }

        renderOpenLayers();
      };
      openLayersScript.onerror = function () {
        if (config.provider === 'GoogleMaps') {
          renderGoogleMaps();
          return;
        }

        showMessage('Map library unavailable.');
      };
      document.head.appendChild(openLayersScript);
    </script>
  </body>
</html>`;
}

export function MapPreview({ businesses, center, onSelectMarker, radiusMeters, showUserMarker = true }: MapPreviewProps) {
  const { palette, t } = useApp();
  const provider = resolveDisplayProvider();
  const fallbackProvider = normalizeProvider(apiConfig.mapDisplayProviderFallback);
  const zoom = calculateMapZoomForCoverage(radiusMeters, center.lat);

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as MapMessage;
      if (payload.type !== 'marker-selected') {
        return;
      }

      const selectedMarker = businesses.find((marker) => marker.businessId === payload.businessId);
      if (selectedMarker) {
        onSelectMarker?.(selectedMarker);
      }
    } catch {
      // Ignore malformed map messages.
    }
  }

  return (
    <View style={[styles.frame, { borderColor: palette.border }]}>
      <View style={[styles.badge, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.badgeText, { color: palette.inkMuted }]}>
          {provider === 'GoogleMaps' ? t('offers.provider.google') : t('offers.provider.openlayers')}
        </Text>
      </View>

      <WebView
        cacheEnabled={false}
        domStorageEnabled
        javaScriptEnabled
        mixedContentMode="never"
        onMessage={handleMessage}
        scrollEnabled={false}
        source={{
          html: buildMapHtml({
            center,
            fallbackProvider,
            googleMapsApiKey: apiConfig.googleMapsApiKey,
            markers: businesses,
            provider,
            showUserMarker,
            themeMode: palette.mode,
            zoom,
          }),
        }}
        style={styles.map}
      />

      <View style={[styles.footer, { backgroundColor: palette.panel, borderColor: palette.border }]}>
        <Text style={[styles.footerText, { color: palette.ink }]}>
          {t('offers.coverage')}: {radiusMeters} m
        </Text>
        <Text style={[styles.footerHint, { color: palette.inkMuted }]}>
          {businesses.length > 0 ? t('offers.markerHint') : t('offers.markersEmpty')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: 28,
    borderWidth: 1,
    height: 240,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  badge: {
    borderBottomRightRadius: 18,
    borderWidth: 1,
    left: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    top: 0,
    zIndex: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  footer: {
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: 'absolute',
    right: 0,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '700',
  },
  footerHint: {
    fontSize: 12,
    marginTop: 4,
  },
});
