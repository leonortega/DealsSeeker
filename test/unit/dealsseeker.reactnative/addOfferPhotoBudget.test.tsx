import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AddOfferScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/AddOfferScreen';

const mockLaunchCameraAsync = jest.fn();
const mockLaunchImageLibraryAsync = jest.fn();

jest.mock('expo-image-picker', () => ({
  launchCameraAsync: (...args: unknown[]) => mockLaunchCameraAsync(...args),
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibraryAsync(...args),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
}));

jest.mock('expo-location', () => ({
  LocationAccuracy: { Balanced: 3 },
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    api: { createOffer: jest.fn(), updateOffer: jest.fn(), getMyOfferDraft: jest.fn().mockResolvedValue(null) },
    closeOverlay: jest.fn(),
    openTab: jest.fn(),
    overlayRoute: { name: 'add-offer' },
    palette: {
      accent: '#ce4719', accentMuted: '#fbe6df', border: '#8b857e', card: '#ffffff',
      danger: '#b42318', ink: '#18181b', inkMuted: '#52525b', panel: '#ffffff', panelAlt: '#e7f7f1',
    },
    preferences: { language: 'en', navigationMode: 'pedestrian' },
    t: (key: string) => key,
  }),
}));

describe('Add Offer photo budget (ADD.OFFER.IMAGE.SIZE.001)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLaunchCameraAsync.mockResolvedValue({ canceled: true, assets: [] });
    mockLaunchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: [] });
  });

  it('requests reduced quality when capturing', async () => {
    await render(<AddOfferScreen />);
    await fireEvent.press(screen.getByTestId('add-take-photo'));

    await waitFor(() => expect(mockLaunchCameraAsync).toHaveBeenCalled());
    expect(mockLaunchCameraAsync).toHaveBeenCalledWith(expect.objectContaining({ quality: 0.5 }));
  });

  it('requests reduced quality and only the remaining slots from the gallery', async () => {
    await render(<AddOfferScreen />);
    await fireEvent.press(screen.getByTestId('add-upload'));

    await waitFor(() => expect(mockLaunchImageLibraryAsync).toHaveBeenCalled());
    expect(mockLaunchImageLibraryAsync).toHaveBeenCalledWith(
      expect.objectContaining({ quality: 0.5, selectionLimit: 3 })
    );
  });
});
