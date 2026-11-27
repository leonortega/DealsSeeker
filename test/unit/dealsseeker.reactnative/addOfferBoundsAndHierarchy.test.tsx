import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { AddOfferScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/AddOfferScreen';

let mockOverlayRoute: { name: string; offerId?: string } | null = { name: 'add-offer' };
const mockGetMyOfferDraft = jest.fn();
const mockLaunchImageLibraryAsync = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => {
  const { translate } = jest.requireActual('../../../src/DealsSeeker.ReactNative/src/utils/translations');
  return {
    useApp: () => ({
      api: {
        createOffer: jest.fn(),
        updateOffer: jest.fn(),
        getMyOfferDraft: mockGetMyOfferDraft,
        searchLocations: jest.fn(),
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
      t: (key: string) => translate('en', key),
    }),
  };
});

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibraryAsync(...args),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
}));

jest.mock('expo-location', () => ({
  LocationAccuracy: { Balanced: 3 },
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
}));


async function goToPlace() {
  await fireEvent.press(screen.getByTestId('add-step-next'));
}

async function goToDetails() {
  await fireEvent.press(screen.getByTestId('add-step-next'));
  await fireEvent.press(screen.getByTestId('add-step-next'));
}

describe('Add Offer input bounds (ADD.OFFER.INPUT.BOUNDS.001)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOverlayRoute = { name: 'add-offer' };
    mockGetMyOfferDraft.mockResolvedValue(null);
  });

  it('bounds the description at 500 characters and discloses the limit', async () => {
    await render(<AddOfferScreen />);
    await goToDetails();

    expect(screen.getByPlaceholderText('Describe the offer').props.maxLength).toBe(500);
    expect(screen.getByText('Up to 500 characters')).toBeTruthy();
  });

  it('shows a live description counter that stops at 500 characters', async () => {
    await render(<AddOfferScreen />);
    await goToDetails();

    const input = screen.getByPlaceholderText('Describe the offer');
    expect(screen.getByText('0/500')).toBeTruthy();

    await fireEvent.changeText(input, 'Short');
    expect(screen.getByText('5/500')).toBeTruthy();

    await fireEvent.changeText(input, 'x'.repeat(600));
    expect(input.props.value).toHaveLength(500);
    expect(screen.getByText('500/500')).toBeTruthy();
  });

  it('bounds the location search at 120 characters', async () => {
    await render(<AddOfferScreen />);
    await goToPlace();

    expect(screen.getByPlaceholderText('Search business or address').props.maxLength).toBe(120);
  });

  it('keeps the bound in edit mode', async () => {
    mockOverlayRoute = { name: 'add-offer', offerId: 'o1' };
    mockGetMyOfferDraft.mockResolvedValue({ description: 'prefilled', tags: [], images: [], location: null });

    await render(<AddOfferScreen />);
    await waitFor(() => expect(mockGetMyOfferDraft).toHaveBeenCalled());
    await goToDetails();
    await waitFor(() => expect(screen.getByPlaceholderText('Describe the offer').props.value).toBe('prefilled'));

    expect(screen.getByPlaceholderText('Describe the offer').props.maxLength).toBe(500);
  });
});

describe('Add Offer image hierarchy (ADD.OFFER.VISUAL.HIERARCHY.001)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ base64: 'AAA', uri: 'file://photo.jpg', mimeType: 'image/jpeg' }],
    });
  });

  async function renderWithPhoto() {
    await render(<AddOfferScreen />);
    await fireEvent.press(screen.getByText('Upload Photos'));
    await screen.findByTestId('add-move-left');
  }

  it('gives photo entry a larger share of the row than reorder actions', async () => {
    await renderWithPhoto();

    const takePhoto = screen.getByTestId('add-take-photo');
    const moveLeft = screen.getByTestId('add-move-left');
    expect(StyleSheet.flatten(takePhoto.props.style).flex).toBe(1);
    expect(StyleSheet.flatten(moveLeft.props.style).flex).toBe(0);
  });

  it('uses quieter colors for reorder and remove than for photo entry', async () => {
    await renderWithPhoto();

    expect(StyleSheet.flatten(screen.getByTestId('add-take-photo').props.style).backgroundColor).toBe('#fff9f0');
    expect(StyleSheet.flatten(screen.getByTestId('add-move-left').props.style).backgroundColor).toBe('#fffdf8');
    expect(StyleSheet.flatten(screen.getByTestId('add-remove-image').props.style).backgroundColor).toBe('#fffdf8');
  });

  it('keeps every image-panel control at least 44pt tall', async () => {
    await renderWithPhoto();

    for (const id of ['add-take-photo', 'add-upload', 'add-move-left', 'add-move-right', 'add-remove-image']) {
      expect(StyleSheet.flatten(screen.getByTestId(id).props.style).minHeight).toBeGreaterThanOrEqual(44);
    }
  });
});
