import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { MD3LightTheme } from 'react-native-paper';
import { AddOfferScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/AddOfferScreen';

let mockOverlayRoute: { name: string; offerId?: string } | null = { name: 'add-offer' };
let mockIsPending = false;
const mockCloseOverlay = jest.fn();
const mockOpenTab = jest.fn();
const mockCreateOffer = jest.fn();
const mockUpdateOffer = jest.fn();
const mockGetMyOfferDraft = jest.fn();
const mockSearchLocations = jest.fn();
const mockLaunchImageLibraryAsync = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    api: {
      createOffer: mockCreateOffer,
      updateOffer: mockUpdateOffer,
      getMyOfferDraft: mockGetMyOfferDraft,
      searchLocations: mockSearchLocations,
      reverseLocation: jest.fn(),
    },
    isPending: () => mockIsPending,
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


async function goToPlace() {
  await fireEvent.press(screen.getByTestId('add-step-next'));
}

async function goToDetails() {
  await fireEvent.press(screen.getByTestId('add-step-next'));
  await fireEvent.press(screen.getByTestId('add-step-next'));
}

async function fillValidDraft() {
  mockLaunchImageLibraryAsync.mockResolvedValue({
    canceled: false,
    assets: [
      {
        base64: 'AAA',
        uri: 'file://photo.jpg',
        mimeType: 'image/jpeg',
        fileSize: 10,
        width: 10,
        height: 10,
        fileName: 'photo.jpg',
      },
    ],
  });
  await fireEvent.press(screen.getByText('add.upload'));
  await goToPlace();
  mockSearchLocations.mockResolvedValue([{ label: 'Main Street', position: { lat: 1, lng: 2 } }]);
  mockIsPending = false;
  await fireEvent.changeText(screen.getByPlaceholderText('add.locationSearch'), 'main');
  await waitFor(() => expect(mockSearchLocations).toHaveBeenCalled());
  await screen.findByText('Main Street');
  await fireEvent.press(screen.getByText('Main Street'));
  await fireEvent.press(screen.getByText('add.confirmLocation'));
  await fireEvent.press(screen.getByTestId('add-step-next'));
  await fireEvent.changeText(screen.getByPlaceholderText('add.descriptionPlaceholder'), 'fresh coffee ');
}

describe('Add Offer lifecycle (impeccable pass)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOverlayRoute = { name: 'add-offer' };
    mockIsPending = false;
    mockCreateOffer.mockResolvedValue({ success: true });
    mockUpdateOffer.mockResolvedValue({ success: true });
    mockGetMyOfferDraft.mockResolvedValue(null);
    mockSearchLocations.mockResolvedValue([]);
  });

  it('shows a recoverable error, blocks submit, and retries when the edit draft fails to load', async () => {
    mockOverlayRoute = { name: 'add-offer', offerId: 'o1' };
    mockGetMyOfferDraft.mockRejectedValue(new Error('boom'));

    await render(<AddOfferScreen />);

    expect(await screen.findByText('add.loadFailed')).toBeTruthy();
    expect(screen.queryByText('add.submitEdit')).toBeNull();

    fireEvent.press(screen.getByText('add.retry'));
    await waitFor(() => expect(mockGetMyOfferDraft).toHaveBeenCalledTimes(2));
  });

  it('shows a searching indicator while a location lookup is in flight', async () => {
    mockSearchLocations.mockReturnValue(new Promise(() => undefined));
    mockIsPending = true;

    await render(<AddOfferScreen />);
    await goToPlace();
    fireEvent.changeText(screen.getByPlaceholderText('add.locationSearch'), 'main');
    await waitFor(() => expect(mockSearchLocations).toHaveBeenCalled());

    expect(await screen.findByText('add.searchingLocations')).toBeTruthy();
  });

  it('shows a no-results message when a lookup returns nothing', async () => {
    await render(<AddOfferScreen />);
    await goToPlace();
    fireEvent.changeText(screen.getByPlaceholderText('add.locationSearch'), 'main');

    expect(await screen.findByText('add.noLocationResults', {}, { timeout: 2000 })).toBeTruthy();
  });

  it('shows a retry on lookup failure and keeps the selected location', async () => {
    mockSearchLocations.mockRejectedValueOnce(new Error('offline')).mockResolvedValue([]);

    await render(<AddOfferScreen />);
    await goToPlace();
    fireEvent.changeText(screen.getByPlaceholderText('add.locationSearch'), 'main');

    expect(await screen.findByText('add.locationSearchFailed', {}, { timeout: 2000 })).toBeTruthy();
    fireEvent.press(screen.getByText('add.retry'));
    await waitFor(() => expect(mockSearchLocations).toHaveBeenCalledTimes(2));
  });

  it('exposes real disabled state on the location toggle controls', async () => {
    await render(<AddOfferScreen />);
    await goToPlace();
    await screen.findByText('add.currentLocationUnavailable');

    expect(screen.getByLabelText('add.editLocation').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByLabelText('add.confirmLocation').props.accessibilityState.disabled).toBe(true);
  });

  it('closes an empty draft without a confirmation step', async () => {
    await render(<AddOfferScreen />);
    await screen.findByText('add.currentLocationUnavailable');

    fireEvent.press(screen.getByTestId('add-cancel'));

    expect(screen.queryByTestId('add-discard-dialog', { includeHiddenElements: true })).toBeNull();
    expect(mockCloseOverlay).toHaveBeenCalledTimes(1);
  });

  it('confirms before discarding a draft with content and keeps it when declined', async () => {
    await render(<AddOfferScreen />);
    await screen.findByText('add.currentLocationUnavailable');
    await goToDetails();
    await fireEvent.changeText(screen.getByPlaceholderText('add.descriptionPlaceholder'), 'fresh coffee');

    fireEvent.press(screen.getByTestId('add-cancel'));
    expect(await screen.findByText('add.discardTitle', { includeHiddenElements: true })).toBeTruthy();

    await fireEvent.press(
      screen.getByRole('button', { name: 'add.keepEditing', includeHiddenElements: true })
    );
    expect(mockCloseOverlay).not.toHaveBeenCalled();
    expect(
      screen.getByPlaceholderText('add.descriptionPlaceholder', { includeHiddenElements: true }).props.value
    ).toBe('fresh coffee');

    await fireEvent.press(screen.getByTestId('add-cancel', { includeHiddenElements: true }));
    expect(await screen.findByTestId('add-discard-dialog', { includeHiddenElements: true })).toBeTruthy();
    await fireEvent.press(screen.getByTestId('add-discard-confirm', { includeHiddenElements: true }));
    expect(mockCloseOverlay).toHaveBeenCalledTimes(1);
  });

  it('shows the inline note explaining automatic tag addition', async () => {
    await render(<AddOfferScreen />);
    await goToDetails();
    expect(screen.getByText('add.tagsAutoHint')).toBeTruthy();
  });

  it('holds a success-toned confirmation until an explicit completion control (ADD.OFFER.UX.001-R5)', async () => {
    await render(<AddOfferScreen />);
    await screen.findByText('add.currentLocationUnavailable');
    await fillValidDraft();

    fireEvent.press(screen.getByText('add.submitCreate'));
    const confirmation = await screen.findByText('add.created');
    expect(StyleSheet.flatten(confirmation.props.style).color).toBe(MD3LightTheme.colors.primary);
    expect(mockCloseOverlay).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(mockCloseOverlay).not.toHaveBeenCalled();
    expect(screen.getByText('add.created')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('add-view-offer'));
    expect(mockCloseOverlay).toHaveBeenCalledTimes(1);
    expect(mockOpenTab).toHaveBeenCalledWith('offers');
  });
});
