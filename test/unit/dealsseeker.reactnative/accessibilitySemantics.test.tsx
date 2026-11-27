import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { LoginScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/LoginScreen';
import { OfferCard } from '../../../src/DealsSeeker.ReactNative/src/components/OfferCard';
import { ImmersiveOfferFeed } from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed';

const mockLogin = jest.fn();
const mockSetSession = jest.fn();
const mockShowRegister = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    api: { login: mockLogin },
    palette: {
      accent: '#b85c38',
      accentMuted: '#e9c9b8',
      background: '#f4efe6',
      border: '#d7c9b5',
      card: '#fffdf8',
      danger: '#8d2f2f',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      overlay: 'rgba(0,0,0,0.5)',
      panel: '#fff9f0',
      panelAlt: '#e6f0e6',
      shadow: 'rgba(0,0,0,0.1)',
    },
    preferences: { language: 'en', navigationMode: 'pedestrian' },
    setSession: mockSetSession,
    showRegister: mockShowRegister,
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useOfferImageUri', () => ({
  useOfferImageUri: jest.fn(() => 'https://example.com/photo.jpg'),
}));

const offer = {
  offerId: 'o1',
  businessName: 'Main Street Cafe',
  description: 'Coffee and snacks',
  tags: ['coffee'],
  imageUrl: 'https://example.com/photo.jpg',
  imageUrls: ['https://example.com/photo.jpg', 'https://example.com/photo-2.jpg'],
  isPromoted: false,
  isReported: false,
  isFavorite: true,
  distanceMeters: 500,
  hasCurrentUserVoted: true,
  positiveAvailabilityCount: 3,
  negativeAvailabilityCount: 1,
  location: { lat: 40.7, lng: -74 },
} as never;

const baseFeedProps = {
  offers: [offer],
  onRadiusChange: jest.fn(),
  radiusMeters: 1500,
  query: '',
  onFavorite: jest.fn(),
  onVote: jest.fn(),
  onReport: jest.fn(),
  onDirections: jest.fn(),
  onComments: jest.fn(),
  onSearch: jest.fn(),
  feedTab: 'viewAll' as const,
  onFeedTabChange: jest.fn(),
};

describe('accessible control semantics (APP.ACCESSIBILITY.UX.002)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockResolvedValue({ accessToken: 'tok' });
    mockSetSession.mockResolvedValue(undefined);
  });

  it('labels both auth inputs', async () => {
    await render(<LoginScreen />);
    expect(screen.getByLabelText('auth.email')).toBeTruthy();
    expect(screen.getByLabelText('auth.password')).toBeTruthy();
  });

  it('announces the login button as an action and the register link as a link', async () => {
    await render(<LoginScreen />);
    expect(screen.getByRole('button', { name: 'auth.loginButton' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'auth.createAccountLink' })).toBeTruthy();
  });

  it('exposes favorite selected state and vote disabled state on an offer card', async () => {
    await render(
      <OfferCard
        offer={offer}
        onComments={jest.fn()}
        onDirections={jest.fn()}
        onFavorite={jest.fn()}
        onOpenDetail={jest.fn()}
        onReport={jest.fn()}
        onVote={jest.fn()}
        query=""
      />
    );
    expect(screen.getByRole('button', { name: 'offers.favorite' }).props.accessibilityState).toEqual({ selected: true });
    await fireEvent.press(screen.getByRole('button', { name: 'offers.cardMoreActions' }));
    expect(screen.getByRole('button', { name: /^offers\.action\.available/ }).props.accessibilityState).toEqual({ disabled: true });
  });

  it('exposes favorite selected state and labels photo dots in the immersive feed', async () => {
    await render(<ImmersiveOfferFeed {...baseFeedProps} />);
    expect(screen.getByRole('button', { name: 'offers.action.favorite' }).props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByRole('button', { name: 'offers.goToImage 1' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'offers.goToImage 2' })).toBeTruthy();
  });
});

describe('announced feedback (APP.ACCESSIBILITY.UX.003)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
  });

  it('announces a login failure without requiring focus movement', async () => {
    mockLogin.mockResolvedValue(null);
    await render(<LoginScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'auth.loginButton' }));
    await waitFor(() =>
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('auth.invalidCredentials')
    );
  });
});
