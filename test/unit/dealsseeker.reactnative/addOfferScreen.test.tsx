import { fireEvent, render, screen, within } from '@testing-library/react-native';
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

  it('renders nothing when the overlay is closed', async () => {
    mockOverlayRoute = null;
    await render(<AddOfferScreen />);
    expect(screen.queryByText('add.title')).toBeNull();
  });

  it('shows the add-offer form with its required sections', async () => {
    await render(<AddOfferScreen />);
    expect(screen.getByText('add.title')).toBeTruthy();
    expect(screen.queryByText('app.title')).toBeNull();
    expect(screen.getByText('add.description')).toBeTruthy();
    expect(screen.getByText('add.location')).toBeTruthy();
  });

  it('blocks submission and attaches a message to each missing field', async () => {
    await render(<AddOfferScreen />);
    await screen.findByText('add.currentLocationUnavailable');

    await fireEvent.press(screen.getByText('add.submitCreate'));

    expect(screen.getByTestId('add-error-photo')).toBeTruthy();
    expect(screen.getByTestId('add-error-description')).toBeTruthy();
    expect(screen.getByTestId('add-error-tags')).toBeTruthy();
    expect(screen.getByTestId('add-error-location')).toBeTruthy();
    expect(mockCreateOffer).not.toHaveBeenCalled();
  });

  it('presents the three named steps with visible progress (ADD.OFFER.SEQUENCED.001-R1/R2)', async () => {
    await render(<AddOfferScreen />);

    expect(screen.getAllByText('add.step.photo').length).toBeGreaterThan(0);
    expect(screen.getByText('add.step.place')).toBeTruthy();
    expect(screen.getByText('add.step.details')).toBeTruthy();
    expect(screen.getByTestId('add-step-progress')).toBeTruthy();
    expect(screen.getByTestId('add-steps-remaining').props.children).toContain(2);
  });

  it('moves between steps with explicit Next and Back without discarding data', async () => {
    await render(<AddOfferScreen />);
    await fireEvent.changeText(screen.getByPlaceholderText('add.descriptionPlaceholder'), 'coffee and tea');

    await fireEvent.press(screen.getByTestId('add-step-next'));
    expect(screen.getByTestId('add-active-step').props.children).toBe('add.step.place');

    await fireEvent.press(screen.getByTestId('add-step-back'));
    expect(screen.getByTestId('add-active-step').props.children).toBe('add.step.photo');
    expect(screen.getByPlaceholderText('add.descriptionPlaceholder').props.value).toBe('coffee and tea');
  });

  it('offers related tags as opt-in suggestions with an explicit Add action', async () => {
    await render(<AddOfferScreen />);
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

  it('uses the edit title when editing an owned offer', async () => {
    mockOverlayRoute = { name: 'add-offer', offerId: 'o1' };
    await render(<AddOfferScreen />);
    expect(screen.getByText('add.editTitle')).toBeTruthy();
  });
});
