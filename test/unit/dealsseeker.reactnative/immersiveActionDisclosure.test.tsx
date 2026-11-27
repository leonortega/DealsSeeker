import { fireEvent, render, screen } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import { ImmersiveOfferFeed } from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed';

jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({
  width: 400,
  height: 400,
  fontScale: 1.5,
  scale: 2,
} as never);

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    palette: {
      accent: '#b85c38', accentMuted: '#e9c9b8', backdrop: '#121417', border: '#d7c9b5',
      card: '#fffdf8', danger: '#8d2f2f', highlight: '#0d7a5f', ink: '#1f3128',
      inkMuted: '#5f6d63', onAccent: '#ffffff', onDanger: '#ffffff', onHighlight: '#ffffff',
      panel: '#fff9f0',
    },
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useOfferImageUri', () => ({
  useOfferImageUri: () => 'https://example.com/offer.png',
}));

const offer = {
  offerId: 'o1', businessName: 'Cafe', description: 'Coffee', tags: [], imageUrl: '', imageUrls: [],
  isPromoted: false, isReported: false, isFavorite: false, distanceMeters: 100,
  hasCurrentUserVoted: false, positiveAvailabilityCount: 2, negativeAvailabilityCount: 1,
  location: { lat: 40.7, lng: -74 },
} as never;

function renderFeed() {
  return render(
    <ImmersiveOfferFeed
      offers={[offer]}
      onRadiusChange={jest.fn()}
      radiusMeters={1500}
      query=""
      onFavorite={jest.fn()}
      onVote={jest.fn()}
      onReport={jest.fn()}
      onDirections={jest.fn()}
      onComments={jest.fn()}
      onSearch={jest.fn()}
      feedTab="viewAll"
      onFeedTabChange={jest.fn()}
    />
  );
}

describe('labelled action disclosure (OFFERS.ACTIONS.LABELS.001-R2)', () => {
  it('shows one visibly labelled control when captions do not fit', async () => {
    await renderFeed();
    expect(screen.getByRole('button', { name: 'offers.action.more' })).toBeTruthy();
    expect(screen.queryByText('offers.action.report')).toBeNull();
  });

  it('reveals labelled secondary actions when opened', async () => {
    await renderFeed();
    await fireEvent.press(screen.getByRole('button', { name: 'offers.action.more' }));

    expect(screen.getByText('offers.action.report')).toBeTruthy();
    expect(screen.getByText('offers.action.available')).toBeTruthy();
    expect(screen.getByText('offers.action.unavailable')).toBeTruthy();
  });
});
