import { MAIN_TAB_DESTINATIONS, resolveTabFromRoute } from '../../../src/DealsSeeker.ReactNative/src/navigation/tabs';

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
});
