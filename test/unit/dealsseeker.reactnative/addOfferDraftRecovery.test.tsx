import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AddOfferScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/AddOfferScreen';

let mockOverlayRoute: { name: string; offerId?: string } | null = { name: 'add-offer' };
const mockStore: { draft: unknown } = { draft: null };
const mockCloseOverlay = jest.fn();
const mockOpenTab = jest.fn();
const mockCreateOffer = jest.fn();
const mockSearchLocations = jest.fn();
const mockLaunchImageLibraryAsync = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/utils/storage', () => ({
  loadAddOfferDraft: jest.fn(async () => mockStore.draft),
  saveAddOfferDraft: jest.fn(async (draft: unknown) => {
    mockStore.draft = draft;
  }),
  clearAddOfferDraft: jest.fn(async () => {
    mockStore.draft = null;
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    api: {
      createOffer: mockCreateOffer,
      updateOffer: jest.fn(),
      getMyOfferDraft: jest.fn().mockResolvedValue(null),
      searchLocations: mockSearchLocations,
      reverseLocation: jest.fn(),
    },
    isPending: () => false,
    closeOverlay: mockCloseOverlay,
    openTab: mockOpenTab,
    overlayRoute: mockOverlayRoute,
    palette: {
      accent: '#b85c38',
      accentMuted: '#e9c9b8',
      accentText: '#8a5a00',
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

const storage = require('../../../src/DealsSeeker.ReactNative/src/utils/storage');

async function goToDetails() {
  await fireEvent.press(screen.getByTestId('add-step-next'));
  await fireEvent.press(screen.getByTestId('add-step-next'));
}

async function fillValidDraft() {
  mockLaunchImageLibraryAsync.mockResolvedValue({
    canceled: false,
    assets: [{ base64: 'AAA', uri: 'file://photo.jpg', mimeType: 'image/jpeg' }],
  });
  await fireEvent.press(screen.getByText('add.upload'));
  await fireEvent.press(screen.getByTestId('add-step-next'));
  mockSearchLocations.mockResolvedValue([{ label: 'Main Street', position: { lat: 1, lng: 2 } }]);
  await fireEvent.changeText(screen.getByPlaceholderText('add.locationSearch'), 'main');
  await screen.findByText('Main Street');
  await fireEvent.press(screen.getByText('Main Street'));
  await fireEvent.press(screen.getByText('add.confirmLocation'));
  await fireEvent.press(screen.getByTestId('add-step-next'));
  await fireEvent.changeText(screen.getByPlaceholderText('add.descriptionPlaceholder'), 'fresh coffee ');
}

describe('Add Offer draft recovery (APP.DRAFT.RECOVERY.001)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.draft = null;
    mockOverlayRoute = { name: 'add-offer' };
    mockCreateOffer.mockResolvedValue({ success: true });
    mockSearchLocations.mockResolvedValue([]);
  });

  afterEach(() => jest.restoreAllMocks());

  it('persists the draft as the user types without waiting for submit', async () => {
    await render(<AddOfferScreen />);
    await goToDetails();
    await fireEvent.changeText(screen.getByPlaceholderText('add.descriptionPlaceholder'), 'fresh coffee ');

    await waitFor(() =>
      expect(storage.saveAddOfferDraft).toHaveBeenCalledWith(expect.objectContaining({ description: 'fresh coffee ' }))
    );
  });

  it('offers Resume and Discard before starting a new offer after relaunch', async () => {
    mockStore.draft = {
      description: 'saved tea',
      tags: ['tea'],
      images: [],
      location: { source: 'search', label: 'Saved Street', position: { lat: 12.345678, lng: 98.765432 } },
      locationQuery: 'Saved Street',
      locationConfirmed: true,
      mapCenter: { lat: 12.345678, lng: 98.765432 },
    };

    await render(<AddOfferScreen />);

    expect(await screen.findByText('add.draftRestored')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'common.resume' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'add.discardConfirm' })).toBeTruthy();
    expect(mockCreateOffer).not.toHaveBeenCalled();
    expect(mockStore.draft).toEqual(expect.objectContaining({ description: 'saved tea' }));

    await fireEvent.press(screen.getByRole('button', { name: 'common.resume' }));
    await goToDetails();

    expect(screen.getByPlaceholderText('add.descriptionPlaceholder').props.value).toBe('saved tea');
    expect(screen.queryByText('12.345678')).toBeNull();
    expect(screen.queryByText('98.765432')).toBeNull();
  });

  it('clears a discarded draft only after the existing discard confirmation', async () => {
    mockStore.draft = { description: 'saved tea', tags: ['tea'], images: [], location: null };

    await render(<AddOfferScreen />);
    await screen.findByText('add.draftRestored');
    await fireEvent.press(screen.getByRole('button', { name: 'add.discardConfirm' }));

    expect(screen.getByTestId('add-discard-dialog', { includeHiddenElements: true })).toBeTruthy();
    expect(storage.clearAddOfferDraft).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('add-discard-confirm', { includeHiddenElements: true }));

    await waitFor(() => expect(storage.clearAddOfferDraft).toHaveBeenCalledTimes(1));
    expect(mockStore.draft).toBeNull();

    const view = await render(<AddOfferScreen />);
    await waitFor(() => expect(screen.queryByText('add.draftRestored')).toBeNull());
    view.unmount();
  });

  it('does not offer a draft that only holds an auto-populated location', async () => {
    mockStore.draft = {
      description: '',
      tags: [],
      images: [],
      location: { source: 'auto', label: 'Current area', position: { lat: 1, lng: 2 } },
    };

    await render(<AddOfferScreen />);

    expect(screen.queryByText('add.draftRestored')).toBeNull();
    expect(screen.getByText('add.step.photo')).toBeTruthy();
  });

  it('clears the retained draft after a successful submission', async () => {
    await render(<AddOfferScreen />);
    await screen.findByText('add.currentLocationUnavailable');
    await fillValidDraft();
    await fireEvent.press(screen.getByText('add.submitCreate'));

    await screen.findByText('add.created');
    await waitFor(() => expect(storage.clearAddOfferDraft).toHaveBeenCalledTimes(1));
    expect(mockStore.draft).toBeNull();
  });

  it('validates the edited field inline, keeps other values and clears the error when corrected', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ base64: 'AAA', uri: 'file://photo.jpg', mimeType: 'image/jpeg' }],
    });
    await render(<AddOfferScreen />);
    await fireEvent.press(screen.getByText('add.upload'));
    await goToDetails();
    const input = screen.getByPlaceholderText('add.descriptionPlaceholder');
    await fireEvent.changeText(input, 'fresh coffee ');

    await fireEvent.changeText(input, '');

    expect(screen.getByTestId('add-error-description')).toBeTruthy();
    expect((mockStore.draft as { images: unknown[] }).images).toHaveLength(1);

    await fireEvent.changeText(input, 'fresh tea');

    expect(screen.queryByTestId('add-error-description')).toBeNull();
    expect(input.props.value).toBe('fresh tea');
    expect((mockStore.draft as { images: unknown[] }).images).toHaveLength(1);
  });

  it('focuses the first offending field on a rejected submission', async () => {
    await render(<AddOfferScreen />);
    await screen.findByText('add.currentLocationUnavailable');
    await goToDetails();
    await fireEvent.press(screen.getByText('add.submitCreate'));

    await screen.findByTestId('add-error-description');
    expect(screen.getByPlaceholderText('add.descriptionPlaceholder').props.autoFocus).toBe(true);
    expect(mockCreateOffer).not.toHaveBeenCalled();
  });

  it('attaches short guidance to the active field and collapses it when the field is completed', async () => {
    await render(<AddOfferScreen />);
    await goToDetails();
    const input = screen.getByPlaceholderText('add.descriptionPlaceholder');

    await fireEvent(input, 'focus');
    expect(screen.getByTestId('add-guidance-description')).toBeTruthy();

    await fireEvent.changeText(input, 'fresh coffee');
    await fireEvent(input, 'blur');
    expect(screen.queryByTestId('add-guidance-description')).toBeNull();

    await fireEvent.press(screen.getByTestId('add-step-back'));
    expect(screen.queryByTestId('add-guidance-description')).toBeNull();

    const locationInput = screen.getByPlaceholderText('add.locationSearch');
    await fireEvent(locationInput, 'focus');
    const guidance = screen.getByTestId('add-guidance-location');
    expect(guidance.props.accessibilityLabel).toBeTruthy();
    expect(JSON.stringify(guidance.props.children ?? guidance.props)).not.toMatch(/12\.345678|98\.765432/);
  });
});
