import { Platform, StyleSheet, Text, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { createElement, useEffect, useRef } from 'react';
import { apiConfig, normalizeProvider, resolveDisplayProvider } from '../api/config';
import { BusinessMarkerDto, GeoPoint } from '../api/types';
import { useApp } from '../hooks/useApp';

interface MapPreviewProps {
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

interface MapMessage {
  businessId?: string;
  lat: number;
  lng: number;
  name?: string;
  type: 'marker-selected' | 'map-tapped';
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
  interactive,
}: {
  center: GeoPoint;
  markers: BusinessMarkerDto[];
  provider: 'GoogleMaps' | 'OpenLayers';
  fallbackProvider: 'GoogleMaps' | 'OpenLayers';
  googleMapsApiKey: string;
  showUserMarker: boolean;
  zoom: number;
  themeMode: 'light' | 'dark';
  interactive: boolean;
}) {
  const background = themeMode === 'dark' ? '#22332f' : '#edf3e7';
  const textColor = themeMode === 'dark' ? '#f7f1e8' : '#1f3128';
  const userColor = themeMode === 'dark' ? '#7ec48c' : '#2f6e46';
  const businessColor = themeMode === 'dark' ? '#f08f62' : '#b85c38';
  const pinColor = themeMode === 'dark' ? '#e94f37' : '#d92b1c';
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
        interactive,
        markers: markerPayload,
        provider,
        showUserMarker,
        zoom,
      })};

      function postMessage(payload) {
        const serialized = JSON.stringify(payload);
        if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
          window.ReactNativeWebView.postMessage(serialized);
          return;
        }

        if (window.parent && window.parent !== window) {
          window.parent.postMessage(serialized, '*');
        }
      }

      function showMessage(text) {
        const node = document.getElementById('map');
        node.innerHTML = '<div class="message">' + text + '</div>';
      }

      let pinSetter = null;
      let pendingPin = null;

      function setPin(lat, lng) {
        pendingPin = { lat: lat, lng: lng };
        if (pinSetter) {
          pinSetter(lat, lng);
        }
      }

      function clearPin() {
        pendingPin = null;
        if (pinSetter) {
          pinSetter(null, null);
        }
      }

      function applyPendingPin() {
        if (pendingPin && pinSetter) {
          pinSetter(pendingPin.lat, pendingPin.lng);
        }
      }

      window.addEventListener('message', function (event) {
        var data = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (error) {
            return;
          }
        }

        if (!data || !data.type) {
          return;
        }

        if (data.type === 'set-pin') {
          setPin(data.lat, data.lng);
          return;
        }

        if (data.type === 'clear-pin') {
          clearPin();
        }
      });

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

        const pinSource = new ol.source.Vector();
        map.addLayer(new ol.layer.Vector({ source: pinSource }));

        let pinFeature = null;
        pinSetter = function (lat, lng) {
          if (lat === null || lng === null) {
            pinSource.clear();
            pinFeature = null;
            return;
          }

          const geometry = new ol.geom.Point(ol.proj.fromLonLat([lng, lat]));
          if (!pinFeature) {
            pinFeature = new ol.Feature({ geometry: geometry });
            pinFeature.setStyle(new ol.style.Style({
              image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({ color: '${pinColor}' }),
                stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
              })
            }));
            pinSource.addFeature(pinFeature);
            return;
          }

          pinFeature.setGeometry(geometry);
        };

        applyPendingPin();

        map.on('singleclick', function (event) {
          if (config.interactive) {
            const lonLat = ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
            postMessage({
              type: 'map-tapped',
              lat: lonLat[1],
              lng: lonLat[0]
            });
          }

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

          if (config.interactive) {
            map.addListener('click', function (event) {
              postMessage({
                type: 'map-tapped',
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
              });
            });
          }

          let pinMarker = null;
          pinSetter = function (lat, lng) {
            if (lat === null || lng === null) {
              if (pinMarker) {
                pinMarker.setMap(null);
                pinMarker = null;
              }
              return;
            }

            const position = { lat: lat, lng: lng };
            if (!pinMarker) {
              pinMarker = new google.maps.Marker({
                position: position,
                map: map,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '${pinColor}',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2
                }
              });
              return;
            }

            pinMarker.setPosition(position);
          };

          applyPendingPin();

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

export function MapPreview({
  businesses,
  center,
  onSelectMarker,
  onMapTap,
  pin,
  radiusMeters,
  showUserMarker = true,
  interactive = false,
  hint,
  showCoverage = true,
  height = 240,
}: MapPreviewProps) {
  const { palette, t } = useApp();
  const provider = resolveDisplayProvider();
  const fallbackProvider = normalizeProvider(apiConfig.mapDisplayProviderFallback);
  const zoom = calculateMapZoomForCoverage(radiusMeters, center.lat);
  const html = buildMapHtml({
    center,
    fallbackProvider,
    googleMapsApiKey: apiConfig.googleMapsApiKey,
    markers: businesses,
    provider,
    showUserMarker,
    themeMode: palette.mode,
    zoom,
    interactive,
  });

  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  function sendPin(point: GeoPoint | null) {
    const message = point ? { type: 'set-pin', lat: point.lat, lng: point.lng } : { type: 'clear-pin' };
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(message, '*');
      return;
    }

    webViewRef.current?.postMessage(JSON.stringify(message));
  }

  useEffect(() => {
    sendPin(pin ?? null);
  }, [pin?.lat, pin?.lng]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    function handleWindowMessage(event: MessageEvent) {
      try {
        const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!payload) {
          return;
        }

        if (payload.type === 'map-tapped') {
          onMapTap?.({ lat: payload.lat, lng: payload.lng });
          return;
        }

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

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [businesses, onSelectMarker, onMapTap]);
  function handleMessage(event: WebViewMessageEvent) {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as MapMessage;
      if (payload.type === 'map-tapped') {
        onMapTap?.({ lat: payload.lat, lng: payload.lng });
        return;
      }

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
    <View style={[styles.frame, { borderColor: palette.border, height }]}>
      <View style={[styles.badge, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.badgeText, { color: palette.inkMuted }]}>
          {provider === 'GoogleMaps' ? t('offers.provider.google') : t('offers.provider.openlayers')}
        </Text>
      </View>

      {Platform.OS === 'web' ? (
        createElement('iframe', {
          ref: iframeRef,
          srcDoc: html,
          style: { border: 0, height: '100%', width: '100%' },
          title: 'DealsSeeker Map',
          onLoad: () => sendPin(pin ?? null),
        })
      ) : (
        <WebView
          cacheEnabled={false}
          domStorageEnabled
          javaScriptEnabled
          mixedContentMode="never"
          onMessage={handleMessage}
          onLoad={() => sendPin(pin ?? null)}
          ref={webViewRef}
          scrollEnabled={false}
          source={{ html }}
          style={styles.map}
        />
      )}

      <View style={[styles.footer, { backgroundColor: palette.panel, borderColor: palette.border }]}>
        {showCoverage ? (
          <Text style={[styles.footerText, { color: palette.ink }]}>
            {t('offers.coverage')}: {radiusMeters} m
          </Text>
        ) : null}
        <Text style={[styles.footerHint, { color: palette.inkMuted }]}>
          {hint ?? (businesses.length > 0 ? t('offers.markerHint') : t('offers.markersEmpty'))}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: 28,
    borderWidth: 1,
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
