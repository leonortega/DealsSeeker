import { render, screen } from '@testing-library/react-native';
import { Text as PaperText } from 'react-native-paper';
import { NativeMapPreview } from '../../../src/DealsSeeker.ReactNative/src/components/NativeMapPreview';

function hasComponent(node: any, component: unknown): boolean {
  const visit = (fiber: any): boolean => {
    if (!fiber) {
      return false;
    }
    if (fiber.type === component) {
      return true;
    }
    return visit(fiber.child) || visit(fiber.sibling);
  };
  let top = node.unstable_fiber;
  while (top?.return) {
    top = top.return;
  }
  return visit(top);
}

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
    const view = await render(<NativeMapPreview center={{ lat: 40.7, lng: -74 }} businesses={[]} radiusMeters={1000} />);

    expect(screen.getByTestId('native-map-unavailable')).toBeTruthy();
    expect(screen.getByText('Map unavailable')).toBeTruthy();
    expect(hasComponent(view.root, PaperText)).toBe(true);
    expect(screen.queryByTestId('rn-map')).toBeNull();
  });
});
