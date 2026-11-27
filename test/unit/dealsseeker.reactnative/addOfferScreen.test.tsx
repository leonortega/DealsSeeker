import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
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


describe('AddOfferScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOverlayRoute = { name: 'add-offer' };
    mockCreateOffer.mockResolvedValue({ success: true });
    mockGetMyOfferDraft.mockResolvedValue(null);
  });

  async function goToDetails() {
    await fireEvent.press(screen.getByTestId('add-step-next'));
    await fireEvent.press(screen.getByTestId('add-step-next'));
  }

  it('renders nothing when the overlay is closed', async () => {
    mockOverlayRoute = null;
    await render(<AddOfferScreen />);
    expect(screen.queryByText('add.title')).toBeNull();
  });

  it('shows only the Photo step at first render (ADD.OFFER.PROGRESSIVE.DISCLOSURE.001-R1/R2)', async () => {
    await render(<AddOfferScreen />);

    expect(screen.getByText('add.title')).toBeTruthy();
    expect(screen.queryByText('app.title')).toBeNull();
    expect(screen.getByTestId('add-step-photo')).toBeTruthy();
    expect(screen.queryByTestId('add-step-place')).toBeNull();
    expect(screen.queryByTestId('add-step-details')).toBeNull();
    expect(screen.queryByPlaceholderText('add.descriptionPlaceholder')).toBeNull();
    expect(screen.queryByPlaceholderText('add.locationSearch')).toBeNull();
    expect(screen.queryByTestId('add-submit-button')).toBeNull();
  });

  it('advancing reveals the next step only (ADD.OFFER.PROGRESSIVE.DISCLOSURE.001-R2/R3)', async () => {
    await render(<AddOfferScreen />);

    await fireEvent.press(screen.getByTestId('add-step-next'));

    expect(screen.getByTestId('add-step-place')).toBeTruthy();
    expect(screen.queryByTestId('add-step-photo')).toBeNull();
    expect(screen.queryByTestId('add-step-details')).toBeNull();
    expect(screen.queryByPlaceholderText('add.descriptionPlaceholder')).toBeNull();
    expect(screen.getByTestId('add-active-step').props.children).toBe('add.step.place');
    expect(screen.getByTestId('add-steps-remaining').props.children).toContain(1);
    expect(screen.queryByTestId('add-submit-button')).toBeNull();
  });

  it('keeps Next, Back and progress available on every step (ADD.OFFER.PROGRESSIVE.DISCLOSURE.001-R9)', async () => {
    await render(<AddOfferScreen />);

    expect(screen.getByTestId('add-step-next')).toBeTruthy();
    expect(screen.getByTestId('add-step-back')).toBeTruthy();
    expect(screen.getByTestId('add-step-progress')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('add-step-next'));
    expect(screen.getByTestId('add-step-next')).toBeTruthy();
    expect(screen.getByTestId('add-step-back')).toBeTruthy();
    expect(screen.getByTestId('add-step-progress')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('add-step-next'));
    expect(screen.getByTestId('add-step-next')).toBeTruthy();
    expect(screen.getByTestId('add-step-back')).toBeTruthy();
    expect(screen.getByTestId('add-active-step').props.children).toBe('add.step.details');
    expect(screen.getByTestId('add-steps-remaining').props.children).toContain(0);
  });

  it('presents the three named steps with visible progress (ADD.OFFER.SEQUENCED.001-R1/R2)', async () => {
    await render(<AddOfferScreen />);

    expect(screen.getAllByText('add.step.photo').length).toBeGreaterThan(0);
    expect(screen.getByText('add.step.place')).toBeTruthy();
    expect(screen.getByText('add.step.details')).toBeTruthy();
    expect(screen.getByTestId('add-step-progress')).toBeTruthy();
    expect(screen.getByTestId('add-steps-remaining').props.children).toContain(2);
    expect(screen.getByTestId('add-active-step').props.children).toBe('add.step.photo');
  });

  it('shows the save action only on the Details step (ADD.OFFER.PROGRESSIVE.DISCLOSURE.001-R6)', async () => {
    await render(<AddOfferScreen />);
    expect(screen.queryByTestId('add-submit-button')).toBeNull();

    await fireEvent.press(screen.getByTestId('add-step-next'));
    expect(screen.queryByTestId('add-submit-button')).toBeNull();

    await fireEvent.press(screen.getByTestId('add-step-next'));
    expect(screen.getByTestId('add-submit-button')).toBeTruthy();
  });

  it('moves between steps with explicit Next and Back without discarding data (ADD.OFFER.SEQUENCED.001-R4)', async () => {
    await render(<AddOfferScreen />);
    await goToDetails();
    await fireEvent.changeText(screen.getByPlaceholderText('add.descriptionPlaceholder'), 'coffee and tea');

    await fireEvent.press(screen.getByTestId('add-step-back'));
    await fireEvent.press(screen.getByTestId('add-step-back'));
    expect(screen.getByTestId('add-active-step').props.children).toBe('add.step.photo');
    expect(screen.queryByPlaceholderText('add.descriptionPlaceholder')).toBeNull();

    await fireEvent.press(screen.getByTestId('add-step-next'));
    await fireEvent.press(screen.getByTestId('add-step-next'));
    expect(screen.getByTestId('add-active-step').props.children).toBe('add.step.details');
    expect(screen.getByPlaceholderText('add.descriptionPlaceholder').props.value).toBe('coffee and tea');
  });

  it('blocks submission and attaches a message to each missing field (ADD.OFFER.UX.001-R1/R2)', async () => {
    await render(<AddOfferScreen />);
    await screen.findByText('add.currentLocationUnavailable');
    await goToDetails();

    await fireEvent.press(screen.getByText('add.submitCreate'));

    expect(screen.getByTestId('add-error-description')).toBeTruthy();
    expect(screen.getByTestId('add-error-tags')).toBeTruthy();
    expect(mockCreateOffer).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('add-step-back'));
    expect(screen.getByTestId('add-error-location')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('add-step-back'));
    expect(screen.getByTestId('add-error-photo')).toBeTruthy();
  });

  it('offers related tags as opt-in suggestions with an explicit Add action', async () => {
    await render(<AddOfferScreen />);
    await goToDetails();
    await fireEvent.changeText(screen.getByPlaceholderText('add.descriptionPlaceholder'), 'coffee ');

    expect(screen.getByText('add.suggestionsTitle')).toBeTruthy();
    expect(screen.getByText('cafe')).toBeTruthy();
    const hasCafeChip = () =>
      screen.queryAllByTestId('add-tag-chip').some((chip) => within(chip).queryByText('cafe') !== null);
    expect(hasCafeChip()).toBe(false);

    const addControls = screen.getAllByTestId('add-suggestion-add');
    const cafeIndex = addControls.findIndex((control) => control.props.accessibilityLabel?.includes('cafe'));
    await fireEvent.press(addControls[cafeIndex]);
    expect(hasCafeChip()).toBe(true);
  });

  it('restores values of not-yet-visited steps in edit mode (ADD.OFFER.PROGRESSIVE.DISCLOSURE.001-R7)', async () => {
    mockOverlayRoute = { name: 'add-offer', offerId: 'o1' };
    mockGetMyOfferDraft.mockResolvedValue({
      description: 'saved tea',
      tags: ['tea'],
      images: [
        {
          source: 'gallery',
          mimeType: 'image/jpeg',
          sizeBytes: 1,
          width: 1,
          height: 1,
          order: 0,
          fileName: 'photo.jpg',
          dataUrl: 'https://example.com/photo.jpg',
        },
      ],
      location: { source: 'search', label: 'Saved Street', position: { lat: 12.345678, lng: 98.765432 } },
    });

    await render(<AddOfferScreen />);
    await screen.findByText('add.editTitle');
    await waitFor(() => expect(screen.getByTestId('add-step-photo')).toBeTruthy());
    expect(screen.queryByText(/Saved Street/u)).toBeNull();
    expect(screen.queryByPlaceholderText('add.descriptionPlaceholder')).toBeNull();

    await fireEvent.press(screen.getByTestId('add-step-next'));
    expect(screen.getByText(/Saved Street/u)).toBeTruthy();
    expect(screen.queryByPlaceholderText('add.descriptionPlaceholder')).toBeNull();

    await fireEvent.press(screen.getByTestId('add-step-next'));
    expect(screen.getByPlaceholderText('add.descriptionPlaceholder').props.value).toBe('saved tea');
    expect(screen.queryByText('Saved Street')).toBeNull();
  });

  it('never shows raw coordinates on any step (ADD.OFFER.PROGRESSIVE.DISCLOSURE.001-R8)', async () => {
    mockOverlayRoute = { name: 'add-offer', offerId: 'o1' };
    mockGetMyOfferDraft.mockResolvedValue({
      description: 'saved tea',
      tags: ['tea'],
      images: [],
      location: { source: 'search', label: 'Saved Street', position: { lat: 12.345678, lng: 98.765432 } },
    });

    await render(<AddOfferScreen />);
    await screen.findByText('add.editTitle');
    await waitFor(() => expect(screen.getByTestId('add-step-photo')).toBeTruthy());

    for (let step = 0; step < 3; step += 1) {
      expect(screen.queryByText(/12\.345678/u)).toBeNull();
      expect(screen.queryByText(/98\.765432/u)).toBeNull();
      if (step < 2) {
        await fireEvent.press(screen.getByTestId('add-step-next'));
      }
    }
  });

  it('uses the edit title when editing an owned offer', async () => {
    mockOverlayRoute = { name: 'add-offer', offerId: 'o1' };
    await render(<AddOfferScreen />);
    expect(screen.getByText('add.editTitle')).toBeTruthy();
  });
});
