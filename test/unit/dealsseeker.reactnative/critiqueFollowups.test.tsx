import { render, screen } from '@testing-library/react-native';

import { AccessibilityInfo, StyleSheet } from 'react-native';
import { ImmersiveOfferFeed } from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed';
import { focusHandle } from '../../../src/DealsSeeker.ReactNative/src/utils/focusReturn';

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
    preferences: { language: 'en', navigationMode: 'pedestrian' },
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
  positiveAvailabilityCount: 0,
  negativeAvailabilityCount: 0,
  location: { lat: 40.7, lng: -74 },
} as never;

describe('primary offer action (OFFERS.UX.002-R8)', () => {
  it('marks directions as the primary action and keeps comments secondary', async () => {
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

    const directions = screen.getByTestId('rail-primary-action');
    const comments = screen.getAllByTestId('rail-secondary-action')[0];
    expect(StyleSheet.flatten(directions.props.style).backgroundColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(StyleSheet.flatten(directions.props.style).backgroundColor).not.toBe('#fff9f0');
    expect(StyleSheet.flatten(comments.props.style).backgroundColor).toBe('#fff9f0');
  });
});

describe('dialog focus return (APP.ACCESSIBILITY.UX.003-R5)', () => {
  it('sets accessibility focus only when a handle is available', () => {
    const spy = jest.spyOn(AccessibilityInfo, 'setAccessibilityFocus').mockImplementation(() => {});

    focusHandle(42);
    expect(spy).toHaveBeenCalledWith(42);

    spy.mockClear();
    focusHandle(null);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
