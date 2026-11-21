import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';
import { MapPreview } from '../../../src/DealsSeeker.ReactNative/src/components/MapPreview';

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View: MockView } = require('react-native');
  const WebViewMock = React.forwardRef((props: Record<string, unknown>, ref: unknown) => {
    React.useImperativeHandle(ref, () => ({ postMessage: jest.fn() }));
    return React.createElement(MockView, { ...props, testID: 'map-webview' });
  });
  return { WebView: WebViewMock };
});

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    palette: {
      accent: '#b85c38',
      border: '#d7c9b5',
      card: '#fffdf8',
      danger: '#8d2f2f',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      mode: 'light',
      panel: '#fff9f0',
      panelAlt: '#e6f0e6',
      success: '#2f6e46',
    },
    t: (key: string) => key,
  }),
}));

const marker = {
  businessId: 'b1',
  businessName: 'Main Street Cafe',
  location: { lat: 40.7, lng: -74 },
} as never;

async function renderMap(onSelectMarker = jest.fn(), onMapTap = jest.fn()) {
  await render(
    <MapPreview
      businesses={[marker]}
      center={{ lat: 40.7, lng: -74 }}
      onMapTap={onMapTap}
      onSelectMarker={onSelectMarker}
      radiusMeters={1500}
    />
  );
  return { onSelectMarker, onMapTap };
}

function sendMessage(payload: unknown) {
  const webview = screen.getByTestId('map-webview');
  webview.props.onMessage({ nativeEvent: { data: JSON.stringify(payload) } });
}

describe('MapPreview', () => {
  it('uses palette tokens instead of invented map colors', async () => {
    await renderMap();
    const html = screen.getByTestId('map-webview').props.source.html as string;
    expect(html).toContain('#e6f0e6');
    expect(html).toContain('#8d2f2f');
    expect(html).not.toContain('#edf3e7');
    expect(html).not.toContain('#e94f37');
  });

  it('shows a provider badge and coverage footer', async () => {
    await renderMap();
    expect(screen.getByText(/offers.provider\./)).toBeTruthy();
    expect(screen.getByText(/offers.coverage: 1500 m/)).toBeTruthy();
  });

  it('reports a selected marker back to the caller', async () => {
    const { onSelectMarker } = await renderMap();
    sendMessage({ type: 'marker-selected', businessId: 'b1' });
    expect(onSelectMarker).toHaveBeenCalledWith(marker);
  });

  it('ignores a marker message for an unknown business', async () => {
    const { onSelectMarker } = await renderMap();
    sendMessage({ type: 'marker-selected', businessId: 'unknown' });
    expect(onSelectMarker).not.toHaveBeenCalled();
  });

  it('reports a map tap back to the caller', async () => {
    const { onMapTap } = await renderMap();
    sendMessage({ type: 'map-tapped', lat: 40.8, lng: -73.9 });
    expect(onMapTap).toHaveBeenCalledWith({ lat: 40.8, lng: -73.9 });
  });

  it('ignores malformed messages', async () => {
    const { onSelectMarker, onMapTap } = await renderMap();
    expect(() => sendMessage(null)).not.toThrow();
    expect(onSelectMarker).not.toHaveBeenCalled();
    expect(onMapTap).not.toHaveBeenCalled();
  });
});
