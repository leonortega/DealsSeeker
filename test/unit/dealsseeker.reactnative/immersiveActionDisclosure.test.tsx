import { fireEvent, render, screen } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import { Button, IconButton, MD3LightTheme, TouchableRipple } from 'react-native-paper';
import { ImmersiveOfferFeed } from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed';
import { platformTouchFloor } from '../../../src/DealsSeeker.ReactNative/src/utils/layout';

function hasComponent(node: any, component: unknown): boolean {
  const visit = (fiber: any): boolean => {
    if (!fiber) {
      return false;
    }
    if (fiber.type === component) {
      return true;
    }
    return visit(fiber.child) || visit(fiber.sibling);
  };
  let top = node.unstable_fiber;
  while (top?.return) {
    top = top.return;
  }
  return visit(top);
}

function hasAncestor(instance: any, component: unknown): boolean {
  let fiber = instance?.unstable_fiber;
  while (fiber) {
    if (fiber.type === component) {
      return true;
    }
    fiber = fiber.return;
  }
  return false;
}

function hasVariant(instance: any, variant: keyof typeof MD3LightTheme.fonts): boolean {
  return ReactNative.StyleSheet.flatten(instance.props.style).fontSize ===
    MD3LightTheme.fonts[variant].fontSize;
}

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

function renderFeed(feedOffer: unknown = offer) {
  return render(
    <ImmersiveOfferFeed
      offers={[feedOffer as never]}
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

  it('reflows every caption into the labelled disclosure at large text sizes', async () => {
    await renderFeed();
    await fireEvent.press(screen.getByRole('button', { name: 'offers.action.more' }));

    expect(screen.getByText('offers.action.directions')).toBeTruthy();
    expect(screen.getByText('offers.action.favorite')).toBeTruthy();
    expect(screen.getByText('offers.action.comments')).toBeTruthy();
  });

  it('keeps the disclosure itself visibly labelled while the controls stay tappable', async () => {
    await renderFeed();
    const more = screen.getByRole('button', { name: 'offers.action.more' });

    expect(screen.getByText('offers.action.more')).toBeTruthy();
    await fireEvent.press(more);
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(6);
  });

  it('builds the rail from Material 3 icon buttons (APP.PLATFORM.CHROME.001-R18)', async () => {
    await renderFeed();

    expect(hasComponent(screen.root, IconButton)).toBe(true);
  });

  it('builds every rail action from Material 3 button components (OFFERS.FEED.IMMERSIVE.001-R62)', async () => {
    await renderFeed();

    expect(hasComponent(screen.root, Button)).toBe(true);
    expect(hasComponent(screen.root, IconButton)).toBe(true);
    const action = screen.getByTestId('rail-action-directions');
    expect(ReactNative.StyleSheet.flatten(action.props.style).minHeight).toBeGreaterThanOrEqual(platformTouchFloor);
  });

  it('keeps the exact favorite selected state on the Material 3 rail action (OFFERS.ACTIONS.LABELS.001-R11)', async () => {
    await renderFeed();

    expect(screen.getByTestId('rail-action-favorite').props.accessibilityState).toMatchObject({ selected: false });
  });

  it('builds rail actions, photo dots and captions from Material 3 components (APP.PLATFORM.CHROME.001-R18/R19)', async () => {
    await renderFeed({
      ...offer,
      imageUrl: 'https://example.com/a.png',
      imageUrls: ['https://example.com/a.png', 'https://example.com/b.png'],
    });

    expect(hasAncestor(screen.getByTestId('rail-action-directions'), TouchableRipple)).toBe(true);
    expect(hasAncestor(screen.getByTestId('offer-more-actions'), IconButton)).toBe(true);
    expect(hasAncestor(screen.getByLabelText('offers.goToImage 1'), TouchableRipple)).toBe(true);
    expect(hasAncestor(screen.getByLabelText('offers.select'), Button)).toBe(true);
    expect(hasVariant(screen.getByText('Cafe'), 'titleLarge')).toBe(true);
    expect(hasVariant(screen.getByText('Coffee'), 'bodyMedium')).toBe(true);
  });
});
