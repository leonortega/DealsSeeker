import { fireEvent, render, screen } from '@testing-library/react-native';
import { AddOfferScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/AddOfferScreen';

let mockOverlayRoute: { name: string; offerId?: string } | null = { name: 'add-offer' };
const mockCloseOverlay = jest.fn();
const mockOpenTab = jest.fn();
const mockCreateOffer = jest.fn();
const mockUpdateOffer = jest.fn();
const mockGetMyOfferDraft = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    api: { createOffer: mockCreateOffer, updateOffer: mockUpdateOffer, getMyOfferDraft: mockGetMyOfferDraft },
    closeOverlay: mockCloseOverlay,
    openTab: mockOpenTab,
    overlayRoute: mockOverlayRoute,
    palette: {
      accent: '#b85c38',
      accentMuted: '#e9c9b8',
      border: '#d7c9b5',
      card: '#fffdf8',
      danger: '#8d2f2f',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      panel: '#fff9f0',
      panelAlt: '#e6f0e6',
    },
    preferences: { language: 'en', navigationMode: 'pedestrian' },
    t: (key: string) => key,
  }),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
}));

jest.mock('expo-location', () => ({
  LocationAccuracy: { Balanced: 3 },
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/MapPreview', () => ({ MapPreview: () => null }));

describe('AddOfferScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOverlayRoute = { name: 'add-offer' };
    mockCreateOffer.mockResolvedValue({ success: true });
    mockGetMyOfferDraft.mockResolvedValue(null);
  });

  it('renders nothing when the overlay is closed', async () => {
    mockOverlayRoute = null;
    await render(<AddOfferScreen />);
    expect(screen.queryByText('add.title')).toBeNull();
  });

  it('shows the add-offer form with its required sections', async () => {
    await render(<AddOfferScreen />);
    expect(screen.getByText('add.title')).toBeTruthy();
    expect(screen.getByText('add.description')).toBeTruthy();
    expect(screen.getByText('add.location')).toBeTruthy();
  });

  it('blocks submission and lists every missing required field', async () => {
    await render(<AddOfferScreen />);
    await screen.findByText('add.currentLocationUnavailable');

    await fireEvent.press(screen.getByText('add.submitCreate'));

    const status = screen.getByText(/add.photoRequired/);
    expect(status.props.children).toContain('add.validationDescription');
    expect(status.props.children).toContain('add.validationTags');
    expect(status.props.children).toContain('add.validationLocation');
    expect(mockCreateOffer).not.toHaveBeenCalled();
  });

  it('uses the edit title when editing an owned offer', async () => {
    mockOverlayRoute = { name: 'add-offer', offerId: 'o1' };
    await render(<AddOfferScreen />);
    expect(screen.getByText('add.editTitle')).toBeTruthy();
  });
});
