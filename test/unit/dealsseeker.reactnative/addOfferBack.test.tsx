import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { BackHandler } from 'react-native';
import { AddOfferScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/AddOfferScreen';

const mockCloseOverlay = jest.fn();
const mockGetMyOfferDraft = jest.fn();
let backHandler: (() => boolean) | undefined;

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    api: {
      createOffer: jest.fn(),
      updateOffer: jest.fn(),
      getMyOfferDraft: mockGetMyOfferDraft,
      searchLocations: jest.fn(),
      reverseLocation: jest.fn(),
    },
    isPending: () => false,
    closeOverlay: mockCloseOverlay,
    openTab: jest.fn(),
    overlayRoute: { name: 'add-offer' },
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
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
}));

jest.mock('expo-location', () => ({
  LocationAccuracy: { Balanced: 3 },
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
}));


async function goToDetails() {
  await fireEvent.press(screen.getByTestId('add-step-next'));
  await fireEvent.press(screen.getByTestId('add-step-next'));
}

describe('Add Offer system Back (ADD.OFFER.EXIT.001-R8)', () => {
  it('offers the cancel path from the in-app Back control on the first step', async () => {
    await render(<AddOfferScreen />);
    await fireEvent.press(screen.getByTestId('add-step-back'));
    expect(mockCloseOverlay).toHaveBeenCalledTimes(1);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    backHandler = undefined;
    mockGetMyOfferDraft.mockResolvedValue(null);
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
      backHandler = handler as () => boolean;
      return { remove: jest.fn() };
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('closes an empty draft and consumes the Back event', async () => {
    await render(<AddOfferScreen />);
    await screen.findByText('add.currentLocationUnavailable');

    let consumed = false;
    await act(async () => {
      consumed = backHandler?.() ?? false;
    });

    expect(consumed).toBe(true);
    expect(mockCloseOverlay).toHaveBeenCalledTimes(1);
  });

  it('registers a platform-dismiss guard that blocks discarding a dirty draft', async () => {
    let guard: (() => boolean) | undefined;
    const registerGuard = jest.fn((next: () => boolean) => {
      guard = next;
    });

    await render(<AddOfferScreen onDismissGuard={registerGuard} />);
    await screen.findByText('add.currentLocationUnavailable');
    await goToDetails();
    await fireEvent.changeText(screen.getByPlaceholderText('add.descriptionPlaceholder'), 'fresh coffee');

    expect(guard).toBeDefined();
    let allowed = true;
    await act(async () => {
      allowed = guard?.() ?? true;
    });

    expect(allowed).toBe(false);
    expect(screen.getByTestId('add-discard-dialog', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText('add.discardTitle', { includeHiddenElements: true })).toBeTruthy();
    expect(mockCloseOverlay).not.toHaveBeenCalled();
  });

  it('treats Back as Cancel and confirms before discarding a draft with content', async () => {
    await render(<AddOfferScreen />);
    await screen.findByText('add.currentLocationUnavailable');
    await goToDetails();
    await fireEvent.changeText(screen.getByPlaceholderText('add.descriptionPlaceholder'), 'fresh coffee');

    let consumed = false;
    await act(async () => {
      consumed = backHandler?.() ?? false;
    });

    expect(consumed).toBe(true);
    expect(screen.getByTestId('add-discard-dialog', { includeHiddenElements: true })).toBeTruthy();
    expect(mockCloseOverlay).not.toHaveBeenCalled();
  });
});
