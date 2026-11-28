import { fireEvent, render, screen } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import { Text as PaperText, TouchableRipple } from 'react-native-paper';
import { ImmersiveOfferFeed } from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed';
import { OFFER_ACTION_LABEL_KEYS, OFFER_ACTION_ORDER } from '../../../src/DealsSeeker.ReactNative/src/components/OfferActionVocabulary';

jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({
  width: 420,
  height: 720,
  fontScale: 1,
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
  useOfferImageUri: () => null,
}));

const offer = {
  offerId: 'o1', businessName: 'Cafe', description: 'Coffee', tags: [], imageUrl: '', imageUrls: [],
  isPromoted: false, isReported: false, isFavorite: false, distanceMeters: 100,
  hasCurrentUserVoted: false, positiveAvailabilityCount: 2, negativeAvailabilityCount: 1,
} as never;

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

describe('canonical offer action vocabulary (OFFERS.ACTIONS.LABELS.001)', () => {
  it('caps the rail at four labelled actions and one More disclosure', async () => {
    await renderFeed();

    expect(screen.getByTestId('rail-action-directions')).toBeTruthy();
    expect(screen.getByTestId('rail-action-favorite')).toBeTruthy();
    expect(screen.getByTestId('rail-action-comments')).toBeTruthy();
    expect(screen.getByTestId('rail-action-available')).toBeTruthy();
    expect(screen.getByTestId('offer-more-actions')).toBeTruthy();
    expect(screen.queryByTestId('rail-action-report')).toBeNull();

    await fireEvent.press(screen.getByTestId('offer-more-actions'));
    expect(screen.getByTestId('rail-action-report')).toBeTruthy();
  });

  it('renders the actions in canonical order', async () => {
    await renderFeed();

    const order = screen
      .getAllByTestId(/^rail-action-/u)
      .map((node) => node.props.testID)
      .filter((testID: string) => /^rail-action-[a-z]+$/u.test(testID));

    expect(order).toEqual(OFFER_ACTION_ORDER.slice(0, 4).map((action) => `rail-action-${action}`));
  });

  it('uses Material 3 ripple surfaces and type roles without changing the rail vocabulary', async () => {
    const view = await renderFeed();

    expect(hasAncestor(screen.getByTestId('rail-action-directions'), TouchableRipple)).toBe(true);
    expect(hasAncestor(screen.getByTestId('rail-action-favorite'), TouchableRipple)).toBe(true);
    expect(hasComponent(view.root, PaperText)).toBe(true);
    expect(screen.getByTestId('rail-action-directions').props.accessibilityLabel).toBe(
      OFFER_ACTION_LABEL_KEYS.directions
    );
  });
});
