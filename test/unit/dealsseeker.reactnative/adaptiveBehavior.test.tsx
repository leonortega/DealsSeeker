import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { NativeMapPreview } from '../../../src/DealsSeeker.ReactNative/src/components/NativeMapPreview';
import { LoginScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/LoginScreen';
import { OfferCard } from '../../../src/DealsSeeker.ReactNative/src/components/OfferCard';
import { OfferDetailModal } from '../../../src/DealsSeeker.ReactNative/src/components/OfferDetailModal';
import { resolveMotionPreferences } from '../../../src/DealsSeeker.ReactNative/src/utils/motion';

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    openSheet: jest.fn(),
    closeSheet: jest.fn(),
    api: { login: jest.fn() },
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
    setSession: jest.fn(),
    showRegister: jest.fn(),
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useOfferImageUri', () => ({
  useOfferImageUri: jest.fn(() => null),
}));

const offer = {
  offerId: 'o1',
  businessName: 'Cafe',
  description: 'A sufficiently long description for a deal hunter to read on a phone screen',
  tags: [],
  imageUrl: 'https://example.com/a.jpg',
  imageUrls: [],
  isPromoted: false,
  isReported: false,
  isFavorite: false,
  distanceMeters: 100,
  hasCurrentUserVoted: false,
  positiveAvailabilityCount: 0,
  negativeAvailabilityCount: 0,
  location: { lat: 40.7, lng: -74 },
} as never;

describe('adaptive behavior (APP.ADAPTIVE.UX.002)', () => {
  it('uses the native map view instead of an embedded web page', async () => {
    await render(
      <NativeMapPreview
        businesses={[]}
        center={{ lat: 40.7, lng: -74 }}
        onSelectMarker={jest.fn()}
        radiusMeters={1500}
      />
    );

    expect(screen.getByTestId('native-map')).toBeTruthy();
    expect(screen.queryByTestId('map-webview')).toBeNull();
  });

  it('uses non-animated motion when the system requests reduced motion', () => {
    expect(resolveMotionPreferences(true)).toEqual({
      modalAnimation: 'fade',
      springEnabled: false,
      animatedScroll: false,
    });
    expect(resolveMotionPreferences(false)).toEqual({
      modalAnimation: 'slide',
      springEnabled: true,
      animatedScroll: true,
    });
  });

  it('keeps the auth link at the touch floor', async () => {
    await render(<LoginScreen />);
    const link = screen.getByRole('link', { name: 'auth.createAccountLink' });
    expect(link).toBeTruthy();
    const linkText = screen.getByText('auth.createAccountLink');
    expect(StyleSheet.flatten(linkText.props.style).minHeight).toBeGreaterThanOrEqual(44);
  });

  it('keeps offer card vote controls at the touch floor', async () => {
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
    await fireEvent.press(screen.getByRole('button', { name: 'offers.cardMoreActions' }));
    const vote = screen.getByRole('button', { name: /^offers\.action\.available/ });
    expect(StyleSheet.flatten(vote.props.style).minHeight).toBeGreaterThanOrEqual(44);
  });

  it('lets offer description text scale without a fixed line height', async () => {
    await render(
      <OfferDetailModal
        offer={offer}
        onClose={jest.fn()}
        onComments={jest.fn()}
        onDirections={jest.fn()}
        onFavorite={jest.fn()}
        visible
      />
    );
    const description = StyleSheet.flatten(screen.getByText(offer.description).props.style);
    expect(description.lineHeight).toBeUndefined();
  });
});
