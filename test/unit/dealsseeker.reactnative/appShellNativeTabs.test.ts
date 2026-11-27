import { MAIN_TAB_DESTINATIONS, resolveTabFromRoute } from '../../../src/DealsSeeker.ReactNative/src/navigation/tabs';
import { resolveTabBarPosition } from '../../../src/DealsSeeker.ReactNative/src/utils/layout';

describe('native tab destinations', () => {
  it('exposes the three branded sections in the spec order', () => {
    expect(MAIN_TAB_DESTINATIONS.map((destination) => destination.name)).toEqual([
      'account',
      'suggestions',
      'offers',
    ]);
  });

  it('maps every native tab route back to its app destination', () => {
    expect(MAIN_TAB_DESTINATIONS.map((destination) => resolveTabFromRoute(destination.name))).toEqual(
      MAIN_TAB_DESTINATIONS.map((destination) => destination.name)
    );
  });

  it('ignores unknown routes', () => {
    expect(resolveTabFromRoute('AddOffer')).toBeNull();
  });

  it('uses a bottom bar at compact width and a rail at tablet width (APP.SHELL.002-R10)', () => {
    expect(resolveTabBarPosition(390)).toBe('bottom');
    expect(resolveTabBarPosition(719)).toBe('bottom');
    expect(resolveTabBarPosition(720)).toBe('left');
    expect(resolveTabBarPosition(1024)).toBe('left');
  });
});
