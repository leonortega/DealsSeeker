import { render, screen } from '@testing-library/react-native';
import { NativeMapPreview } from '../../../src/DealsSeeker.ReactNative/src/components/NativeMapPreview';

jest.mock('react-native-maps', () => ({
  __esModule: true,
  default: undefined,
  Marker: () => null,
  Circle: () => null,
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({ palette: { ink: '#18181b' }, t: () => 'Map unavailable' }),
}));

describe('native map availability', () => {
  it('reports an unavailable native map without showing a fallback renderer', async () => {
    await render(<NativeMapPreview center={{ lat: 40.7, lng: -74 }} businesses={[]} radiusMeters={1000} />);

    expect(screen.getByTestId('native-map-unavailable')).toBeTruthy();
    expect(screen.getByText('Map unavailable')).toBeTruthy();
    expect(screen.queryByTestId('rn-map')).toBeNull();
  });
});
