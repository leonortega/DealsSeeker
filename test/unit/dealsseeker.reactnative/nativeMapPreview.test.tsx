import { fireEvent, render, screen } from '@testing-library/react-native';
import { NativeMapPreview } from '../../../src/DealsSeeker.ReactNative/src/components/NativeMapPreview';

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/MapPreview', () => ({ MapPreview: () => null }));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    palette: { accent: '#b85c38', accentMuted: '#e9c9b8', card: '#fffdf8', danger: '#8d2f2f', success: '#2f6e46' },
  }),
}));

const businesses = [
  { businessId: 'b1', name: 'Cafe', location: { lat: 40.7, lng: -74 } },
  { businessId: 'b2', name: 'Shop', location: { lat: 40.71, lng: -74.01 } },
] as never;

const baseProps = {
  center: { lat: 40.7, lng: -74 },
  businesses,
  radiusMeters: 1000,
};

describe('NativeMapPreview', () => {
  it('renders a native map rather than a web view', async () => {
    await render(<NativeMapPreview {...baseProps} />);

    expect(screen.getByTestId('native-map')).toBeTruthy();
    expect(screen.getByTestId('rn-map')).toBeTruthy();
  });

  it('shows business markers and coverage', async () => {
    await render(<NativeMapPreview {...baseProps} showCoverage showUserMarker />);

    expect(screen.getByTestId('native-map-marker-b1')).toBeTruthy();
    expect(screen.getByTestId('native-map-marker-b2')).toBeTruthy();
    expect(screen.getByTestId('native-map-user')).toBeTruthy();
    expect(screen.getByTestId('native-map-circle')).toBeTruthy();
  });

  it('keeps marker selection behavior', async () => {
    const onSelectMarker = jest.fn();
    await render(<NativeMapPreview {...baseProps} onSelectMarker={onSelectMarker} />);

    await fireEvent.press(screen.getByTestId('native-map-marker-b1'));

    expect(onSelectMarker).toHaveBeenCalledWith(businesses[0]);
  });

  it('sets the pin from a map tap', async () => {
    const onMapTap = jest.fn();
    await render(<NativeMapPreview {...baseProps} onMapTap={onMapTap} />);

    await fireEvent(screen.getByTestId('rn-map'), 'press', {
      nativeEvent: { coordinate: { latitude: 40.72, longitude: -74.02 } },
    });

    expect(onMapTap).toHaveBeenCalledWith({ lat: 40.72, lng: -74.02 });
  });

  it('renders the selected pin', async () => {
    await render(<NativeMapPreview {...baseProps} pin={{ lat: 40.73, lng: -74.03 }} />);

    expect(screen.getByTestId('native-map-pin')).toBeTruthy();
  });
});
