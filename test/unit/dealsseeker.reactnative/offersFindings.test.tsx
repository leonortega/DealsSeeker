import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { BackHandler, StyleSheet } from 'react-native';
import { OffersScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/OffersScreen';
import { OffersStatePanel } from '../../../src/DealsSeeker.ReactNative/src/components/OffersStatePanel';

let mockImmersiveOffers = false;
const mockCloseImmersiveOffers = jest.fn();
const backHandlers: Array<() => boolean> = [];

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
    openImmersiveOffers: jest.fn(),
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

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/MapPreview', () => ({ MapPreview: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferCard', () => ({ OfferCard: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferDetailModal', () => ({ OfferDetailModal: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferCommentsModal', () => ({ OfferCommentsModal: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/StandardHeader', () => ({ StandardHeader: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed', () => ({ ImmersiveOfferFeed: () => null }));

const palette = {
  accent: '#b85c38',
  border: '#d7c9b5',
  card: '#fffdf8',
  ink: '#1f3128',
  inkMuted: '#5f6d63',
  panel: '#fff9f0',
  panelAlt: '#e6f0e6',
  success: '#2f6e46',
  danger: '#8d2f2f',
  mode: 'light' as const,
  background: '#f4efe6',
  backgroundRaised: '#efe5d8',
  shadow: 'rgba(0,0,0,0.1)',
  overlay: 'rgba(0,0,0,0.4)',
};

describe('Offers device findings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    backHandlers.length = 0;
    mockImmersiveOffers = false;
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
      backHandlers.push(handler as () => boolean);
      return { remove: jest.fn() };
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('closes the immersive view on system Back without leaving the app', async () => {
    mockImmersiveOffers = true;
    await render(<OffersScreen />);

    let consumed = false;
    await act(async () => {
      consumed = backHandlers.map((handler) => handler()).some(Boolean);
    });

    expect(consumed).toBe(true);
    expect(mockCloseImmersiveOffers).toHaveBeenCalledTimes(1);
  });

  it('keeps the recovery action compact so the create control cannot cover it', async () => {
    const onAction = jest.fn();
    await render(
      <OffersStatePanel
        title="No offers"
        hint="Clear the filters"
        actionLabel="Clear filters"
        onAction={onAction}
        palette={palette}
      />
    );

    const action = screen.getByRole('button', { name: 'Clear filters' });
    expect(StyleSheet.flatten(action.props.style).alignSelf).toBe('flex-start');
    await fireEvent.press(action);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
