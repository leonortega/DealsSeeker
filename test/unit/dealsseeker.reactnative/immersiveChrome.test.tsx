import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { ImmersiveActionCaption } from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveActionGlyphs';
import { ImmersiveFeedTabs } from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveFeedTabs';
import { ImmersiveOfferFeed } from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed';

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
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
      overlay: 'rgba(22,30,28,0.52)',
    },
    t: (key: string) => key,
  }),
}));

const offer = {
  offerId: 'o1',
  businessName: 'Cafe',
  description: 'Coffee',
  tags: [],
  imageUrl: '',
  imageUrls: [],
  isPromoted: false,
  isReported: false,
  isFavorite: false,
  distanceMeters: 100,
  hasCurrentUserVoted: false,
  positiveAvailabilityCount: 2,
  negativeAvailabilityCount: 1,
  location: { lat: 40.7, lng: -74 },
} as never;

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useOfferImageUri', () => ({
  useOfferImageUri: () => 'https://example.com/offer.png',
}));

describe('immersive chrome over the fixed dark backdrop', () => {
  it('renders feed tab labels in a light color even when the light theme is active', async () => {
    await render(<ImmersiveFeedTabs activeTab="viewAll" onChangeTab={jest.fn()} />);

    const label = screen.getByText('offers.tabViewAll');
    expect(StyleSheet.flatten(label.props.style).color).toBe('#f7f1e8');
  });

  it('renders action captions in a light color even when the light theme is active', async () => {
    await render(<ImmersiveActionCaption label="Comments" />);

    expect(StyleSheet.flatten(screen.root.props.style).color).toBe('#c6d0c9');
  });

  it('renders availability counts in a light color even when the light theme is active', async () => {
    await render(
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

    const more = screen.queryByRole('button', { name: 'offers.action.more' });
    if (more) {
      await fireEvent.press(more);
    }
    expect(StyleSheet.flatten(screen.getByText('2').props.style).color).toBe('#c6d0c9');
  });

  it('renders the authored brand mark in the top bar', async () => {
    await render(
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

    expect(screen.getByTestId('brand-mark')).toBeTruthy();
  });

  it('renders the offer image as a full-bleed background', async () => {
    await render(
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

    expect(screen.getByTestId('offer-image').props.resizeMode).toBe('cover');
  });

  it('falls back to a placeholder when an offer image fails to load', async () => {
    await render(
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

    const image = screen.getByTestId('offer-image');
    await act(async () => image.props.onError());

    expect(screen.getByText('▤')).toBeTruthy();
  });

  it('expands a truncated description when More is pressed', async () => {
    const longOffer = { ...offer, description: 'x'.repeat(200) };
    await render(
      <ImmersiveOfferFeed
        offers={[longOffer]}
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

    await fireEvent.press(screen.getByText('offers.more'));

    expect(screen.getByText('x'.repeat(200))).toBeTruthy();
    expect(screen.queryByText('offers.more')).toBeNull();
  });

  it('keeps measured page geometry stable after the first layout', async () => {
    await render(
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

    const feedArea = screen.getByTestId('immersive-feed-area');
    fireEvent(feedArea, 'layout', { nativeEvent: { layout: { height: 600 } } });
    fireEvent(feedArea, 'layout', { nativeEvent: { layout: { height: 500 } } });

    await waitFor(() =>
      expect(screen.getByTestId('immersive-offer-list').props.getItemLayout(null, 0).length).toBe(600)
    );
  });
});
