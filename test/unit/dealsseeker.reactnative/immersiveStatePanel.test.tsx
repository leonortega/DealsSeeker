import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { OffersScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/OffersScreen';

const mockSearchOffers = jest.fn();

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
      searchOffers: mockSearchOffers,
      setOfferFavorite: jest.fn(),
      voteOfferAvailability: jest.fn(),
    },
    clearReportDraft: jest.fn(),
    closeImmersiveOffers: jest.fn(),
    immersiveOffers: true,
    isPending: () => false,
    openAddOffer: jest.fn(),
    openImmersiveOffers: jest.fn(),
    palette: {
      accent: '#ce4719', accentMuted: '#fbe6df', accentText: '#b83b12', backdrop: '#121417',
      background: '#faf8f5', border: '#8b857e', card: '#ffffff', danger: '#b42318',
      highlight: '#0d7a5f', ink: '#18181b', inkMuted: '#52525b', onAccent: '#ffffff',
      onDanger: '#ffffff', onHighlight: '#ffffff', panel: '#ffffff',
    },
    preferences: { language: 'en', navigationMode: 'pedestrian' },
    reportDraft: null,
    runOperation: (_key: string | null, task: () => Promise<unknown>) => task(),
    setReportDraft: jest.fn(),
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed', () => ({
  ImmersiveOfferFeed: () => null,
  NARROW_BREAKPOINT: 768,
}));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferDetailModal', () => ({ OfferDetailModal: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferCommentsModal', () => ({ OfferCommentsModal: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/HelpSheet', () => ({ HelpSheet: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferReportSheet', () => ({ OfferReportSheet: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/FirstRunSheet', () => ({ FirstRunSheet: () => null }));

describe('immersive recovery panel placement', () => {
  beforeEach(() => {
    mockSearchOffers.mockReset();
    mockSearchOffers.mockRejectedValue(new Error('offline'));
  });

  it('lays the recovery panel out below the top controls (APP.POLISH.UX.001-R14)', async () => {
    await render(<OffersScreen />);

    const overlay = await screen.findByTestId('immersive-state-overlay');
    expect(StyleSheet.flatten(overlay.props.style)).toMatchObject({ position: 'absolute' });
    expect(StyleSheet.flatten(overlay.props.style).top).toBeGreaterThan(0);
    expect(screen.getByText('offers.searchFailed')).toBeTruthy();
  });
});
