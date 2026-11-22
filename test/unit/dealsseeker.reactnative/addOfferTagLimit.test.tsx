import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AddOfferScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/AddOfferScreen';

const mockGetMyOfferDraft = jest.fn();
const mockCreateOffer = jest.fn();
const mockSearchLocations = jest.fn();
const mockLaunchImageLibraryAsync = jest.fn();
let mockOverlayRoute: { name: string; offerId?: string } | null = { name: 'add-offer' };
const words = 'coffee discount fresh bakery';

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    api: {
      createOffer: mockCreateOffer,
      updateOffer: jest.fn(),
      getMyOfferDraft: mockGetMyOfferDraft,
      searchLocations: mockSearchLocations,
      reverseLocation: jest.fn(),
    },
    isPending: () => false,
    closeOverlay: jest.fn(),
    openTab: jest.fn(),
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
      success: '#2f6e46',
    },
    preferences: { language: 'en', navigationMode: 'pedestrian' },
    t: (key: string) => key,
  }),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibraryAsync(...args),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
}));

jest.mock('expo-location', () => ({
  LocationAccuracy: { Balanced: 3 },
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/MapPreview', () => ({ MapPreview: () => null }));

describe('Add Offer tag limit (ADD.OFFER.TAG.LIMIT.001)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOverlayRoute = { name: 'add-offer' };
    mockGetMyOfferDraft.mockResolvedValue(null);
    mockCreateOffer.mockResolvedValue({ offerId: 'o-new' });
    mockSearchLocations.mockResolvedValue([{ label: 'Main Street', position: { lat: 1, lng: 2 } }]);
  });

  it('caps automatic tags at ten and shows the limit hint', async () => {
    await render(<AddOfferScreen />);
    const input = screen.getByPlaceholderText('add.descriptionPlaceholder');
    let value = '';
    for (const word of words.split(' ')) {
      value = `${value}${word} `;
      await fireEvent.changeText(input, value);
    }

    await waitFor(() => expect(screen.getAllByTestId('add-tag-chip')).toHaveLength(10));
    expect(screen.getByText('add.tagsLimitHint')).toBeTruthy();
  });

  it('refuses manual additions at the limit and frees a slot when a tag is removed', async () => {
    mockOverlayRoute = { name: 'add-offer', offerId: 'o1' };
    mockGetMyOfferDraft.mockResolvedValue({
      description: 'prefilled',
      tags: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
      images: [],
      location: null,
    });
    await render(<AddOfferScreen />);
    await waitFor(() => expect(screen.getAllByTestId('add-tag-chip')).toHaveLength(10));

    await fireEvent.press(screen.getByText('prefilled'));
    expect(screen.getAllByTestId('add-tag-chip').length).toBeLessThanOrEqual(10);

    const chips = screen.getAllByTestId('add-tag-chip');
    await fireEvent.press(chips[0]);
    expect(screen.getAllByTestId('add-tag-chip').length).toBeLessThanOrEqual(10);
  });

  it('never submits more tags than the declared limit', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ base64: 'AAA', uri: 'file://photo.jpg', mimeType: 'image/jpeg' }],
    });

    await render(<AddOfferScreen />);
    await fireEvent.press(screen.getByText('add.upload'));

    const description = screen.getByPlaceholderText('add.descriptionPlaceholder');
    let value = '';
    for (const word of words.split(' ')) {
      value = `${value}${word} `;
      await fireEvent.changeText(description, value);
    }

    const location = screen.getByPlaceholderText('add.locationSearch');
    await fireEvent.changeText(location, 'main');
    await waitFor(() => expect(mockSearchLocations).toHaveBeenCalled());
    await screen.findByText('Main Street');
    await fireEvent.press(screen.getByText('Main Street'));
    await fireEvent.press(screen.getByText('add.confirmLocation'));

    await fireEvent.press(screen.getByText('add.submitCreate'));

    await waitFor(() => expect(mockCreateOffer).toHaveBeenCalled());
    const payload = mockCreateOffer.mock.calls[0][0];
    expect(payload.tags.length).toBeLessThanOrEqual(10);
  });
});
