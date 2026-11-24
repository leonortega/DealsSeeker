import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { AppFooterBar } from '../../../src/DealsSeeker.ReactNative/src/components/AppFooterBar';
import { ImmersiveOfferFeed } from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed';
import { OffersScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/OffersScreen';
import type { OfferItemDto } from '../../../src/DealsSeeker.ReactNative/src/api/types';

const mockSearchOffers = jest.fn();

const palette = {
  accent: '#b85c38',
  border: '#d7c9b5',
  card: '#fffdf8',
  ink: '#1f3128',
  inkMuted: '#5f6d63',
  panel: '#fff9f0',
};

jest.mock('expo-location', () => ({
  LocationAccuracy: { Balanced: 3 },
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: false }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    activeTab: 'offers',
    api: {
      reverseLocation: jest.fn().mockResolvedValue(null),
      searchOffers: mockSearchOffers,
      setOfferFavorite: jest.fn(),
      voteOfferAvailability: jest.fn(),
    },
    immersiveOffers: false,
    isPending: () => false,
    openAddOffer: jest.fn(),
    openTab: jest.fn(),
    palette,
    preferences: { language: 'en', navigationMode: 'pedestrian' },
    setReportDraft: jest.fn(),
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/MapPreview', () => ({ MapPreview: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferCard', () => ({ OfferCard: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferDetailModal', () => ({
  OfferDetailModal: () => null,
}));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferCommentsModal', () => ({
  OfferCommentsModal: () => null,
}));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/StandardHeader', () => ({
  StandardHeader: () => null,
}));

function styleOf(node: { props: { style?: unknown } }) {
  return StyleSheet.flatten(node.props.style) ?? {};
}

function hostElements(): { type: string; props: { style?: unknown } }[] {
  const found: { type: string; props: { style?: unknown } }[] = [];
  const visit = (node: unknown) => {
    const element = node as { type?: string; props?: { style?: unknown }; children?: unknown[] } | null;
    if (!element || typeof element !== 'object') {
      return;
    }
    if (element.type) {
      found.push({ type: element.type, props: element.props ?? {} });
    }
    for (const child of element.children ?? []) {
      visit(child);
    }
  };
  visit(screen.container);
  return found;
}

const footerItems = [
  { key: 'account', icon: '👤', label: 'Account', onPress: jest.fn() },
  { key: 'suggestions', icon: '✏️', label: 'Suggestions', onPress: jest.fn() },
];

describe('touch target and label floors', () => {
  beforeEach(() => {
    mockSearchOffers.mockResolvedValue({ offers: [], businesses: [] });
  });

  it('keeps the night footer palette fixed rather than theme-driven', async () => {
    await render(
      <AppFooterBar items={[{ ...footerItems[0], active: true }, footerItems[1]]} />
    );

    const wrapper = hostElements().find(
      (node) => node.type === 'View' && styleOf(node).flexDirection === 'row'
    );
    expect(styleOf(wrapper as never)).toMatchObject({
      backgroundColor: '#22332f',
      borderColor: '#476258',
      borderRadius: 28,
    });
    expect(styleOf(screen.getByRole('button', { name: 'Account' })).backgroundColor).toBe('#5e3a2a');
    expect(styleOf(screen.getByText('👤')).color).toBe('#f08f62');
  });

  it('keeps default footer labels on a single line', async () => {
    await render(<AppFooterBar items={footerItems} />);

    const label = screen.getByText('Suggestions');
    expect(label.props.numberOfLines).toBe(1);
    expect(styleOf(label).fontSize).toBeGreaterThanOrEqual(11);
  });

  it('reserves scroll space for the floating action below the search controls', async () => {
    await render(<OffersScreen />);

    const scroll = hostElements().find((node) => node.type === 'ScrollView');
    expect(styleOf(scroll as never).paddingBottom).toBeGreaterThanOrEqual(88);
  });

  it('gives every footer tab a 44-unit touch target', async () => {
    await render(<AppFooterBar items={footerItems} />);

    for (const item of footerItems) {
      const tab = screen.getByRole('button', { name: item.label });
      expect(styleOf(tab).minHeight).toBeGreaterThanOrEqual(44);
    }
  });

  it('separates adjacent footer tabs by at least 8 units', async () => {
    await render(<AppFooterBar items={footerItems} />);

    const wrapper = hostElements().find(
      (node) => node.type === 'View' && styleOf(node).flexDirection === 'row'
    );
    expect(styleOf(wrapper as never).gap).toBeGreaterThanOrEqual(8);
  });

  it('renders footer labels at a legible size', async () => {
    await render(<AppFooterBar items={footerItems} />);

    expect(styleOf(screen.getByText('Account')).fontSize).toBeGreaterThanOrEqual(11);
  });

  it('gives coverage radius chips a 44-unit touch target', async () => {
    await render(<OffersScreen />);

    const chip = await screen.findByRole('button', { name: '500 m' });
    expect(styleOf(chip).minHeight).toBeGreaterThanOrEqual(44);
  });

  it('gives the immersive search control a 44-unit touch target', async () => {
    const offer: OfferItemDto = {
      offerId: 'o1',
      businessId: 'b1',
      businessName: 'Cafe',
      description: 'Coffee',
      tags: ['coffee'],
      imageUrl: 'https://example.test/one.png',
      imageUrls: ['https://example.test/one.png', 'https://example.test/two.png'],
      isActive: true,
      isPromoted: false,
      isFavorite: false,
      isReported: false,
      relevanceScore: 1,
      matchStrategies: [],
      location: { lat: 40.7, lng: -74 },
      distanceMeters: 100,
      positiveAvailabilityCount: 0,
      negativeAvailabilityCount: 0,
      hasCurrentUserVoted: false,
    };

    await render(
      <ImmersiveOfferFeed
        feedTab="viewAll"
        offers={[offer]}
        onComments={jest.fn()}
        onDirections={jest.fn()}
        onFavorite={jest.fn()}
        onFeedTabChange={jest.fn()}
        onRadiusChange={jest.fn()}
        onReport={jest.fn()}
        onSearch={jest.fn()}
        onVote={jest.fn()}
        query=""
        radiusMeters={1500}
      />
    );

    expect(styleOf(screen.getByRole('button', { name: 'offers.search' })).width).toBeGreaterThanOrEqual(44);
  });
});
