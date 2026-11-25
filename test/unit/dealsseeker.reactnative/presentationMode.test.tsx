import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { OffersScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/OffersScreen';

let mockImmersiveOffers = false;
const mockOpenImmersiveOffers = jest.fn();
const mockCloseImmersiveOffers = jest.fn();

jest.mock('expo-location', () => ({
  LocationAccuracy: { Balanced: 3 },
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    activeTab: 'offers',
    api: {
      reverseLocation: jest.fn().mockResolvedValue(null),
      searchOffers: jest.fn().mockResolvedValue({ offers: [], businesses: [] }),
      setOfferFavorite: jest.fn(),
      voteOfferAvailability: jest.fn(),
    },
    closeImmersiveOffers: mockCloseImmersiveOffers,
    immersiveOffers: mockImmersiveOffers,
    isPending: () => false,
    openAddOffer: jest.fn(),
    openImmersiveOffers: mockOpenImmersiveOffers,
    palette: {
      accent: '#b85c38',
      border: '#d7c9b5',
      card: '#fffdf8',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      panel: '#fff9f0',
    },
    preferences: { language: 'en', navigationMode: 'pedestrian' },
    setReportDraft: jest.fn(),
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferCard', () => ({ OfferCard: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferDetailModal', () => ({
  OfferDetailModal: () => null,
}));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferCommentsModal', () => ({
  OfferCommentsModal: () => null,
}));
describe('presentation mode switch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockImmersiveOffers = false;
  });

  it('offers Feed and Map options in the Offers view', async () => {
    await render(<OffersScreen />);

    expect(screen.getByRole('tab', { name: 'offers.mode.feed' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'offers.mode.map' })).toBeTruthy();
    expect(screen.queryByText('app.title')).toBeNull();
  });

  it('shows the brand mark to the left of the presentation switch', async () => {
    await render(<OffersScreen />);

    const mark = screen.getByTestId('brand-mark');
    const modeSlot = screen.getByRole('tab', { name: 'offers.mode.feed' }).parent.parent;
    const controls = mark.parent;
    expect(controls).toBe(modeSlot.parent);
    expect(controls.children.indexOf(mark)).toBeLessThan(
      controls.children.indexOf(modeSlot)
    );
  });

  it('mirrors the immersive top bar treatment for map-view controls', async () => {
    await render(<OffersScreen />);

    const mark = screen.getByTestId('brand-mark');
    const controls = mark.parent;
    expect(StyleSheet.flatten(controls.props.style)).toMatchObject({
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 8,
    });
    expect(StyleSheet.flatten(mark.props.style)).toMatchObject({
      backgroundColor: '#fff9f0',
      borderRadius: 999,
      height: 40,
      width: 40,
    });
    const topBarStyle = StyleSheet.flatten(controls.parent.props.style);
    expect(topBarStyle).toMatchObject({
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    });
    expect(topBarStyle.marginHorizontal).toBeUndefined();
    expect(StyleSheet.flatten(controls.parent.parent.props.style)).toMatchObject({
      flex: 1,
      marginHorizontal: -16,
    });
  });

  it('gives the title clearance below the map-view controls', async () => {
    await render(<OffersScreen />);

    const content = screen.getByTestId('offers-scroll').props.contentContainerStyle;
    expect(StyleSheet.flatten(content).paddingTop).toBe(68);
  });

  it('reuses the feed header slots with the search control hidden', async () => {
    await render(<OffersScreen />);

    const modeSlot = screen.getByRole('tab', { name: 'offers.mode.feed' }).parent.parent;
    expect(StyleSheet.flatten(modeSlot.props.style)).toMatchObject({ maxWidth: 360 });

    const topActions = screen.getByRole('button', { name: 'common.help' }).parent;
    expect(StyleSheet.flatten(topActions.props.style)).toMatchObject({ flexDirection: 'row', gap: 8 });
    expect(StyleSheet.flatten(topActions.children[0].props.style)).toMatchObject({ height: 44, width: 44 });
    expect(screen.queryByRole('button', { name: 'offers.search' })).toBeNull();
  });

  it('presents the Offers map inside a bordered panel', async () => {
    await render(<OffersScreen />);

    expect(StyleSheet.flatten(screen.getByTestId('native-map').parent.props.style)).toMatchObject({
      borderRadius: 28,
      borderWidth: 1,
      borderColor: '#d7c9b5',
      padding: 0,
    });
  });

  it('marks Map selected in the standard view and switches to Feed', async () => {
    await render(<OffersScreen />);

    const mapTab = screen.getByRole('tab', { name: 'offers.mode.map' });
    expect(mapTab.props.accessibilityState.selected).toBe(true);

    await fireEvent.press(screen.getByRole('tab', { name: 'offers.mode.feed' }));
    expect(mockOpenImmersiveOffers).toHaveBeenCalledTimes(1);
  });

  it('marks Feed selected in the immersive view and switches to Map', async () => {
    mockImmersiveOffers = true;
    await render(<OffersScreen />);

    const feedTab = screen.getByRole('tab', { name: 'offers.mode.feed' });
    expect(feedTab.props.accessibilityState.selected).toBe(true);

    await fireEvent.press(screen.getByRole('tab', { name: 'offers.mode.map' }));
    expect(mockCloseImmersiveOffers).toHaveBeenCalledTimes(1);
  });
});
