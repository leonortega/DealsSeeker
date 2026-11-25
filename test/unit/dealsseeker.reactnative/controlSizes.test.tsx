import { render, screen } from '@testing-library/react-native';
import { StyleSheet, View } from 'react-native';
import { AppFooterBar } from '../../../src/DealsSeeker.ReactNative/src/components/AppFooterBar';
import { ImmersiveOfferFeed } from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed';
import { OffersScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/OffersScreen';
import type { OfferItemDto } from '../../../src/DealsSeeker.ReactNative/src/api/types';

const mockSearchOffers = jest.fn();

const palette = {
  accent: '#b85c38',
  accentText: '#8a5a00',
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
      backgroundColor: '#2a2030',
      borderColor: '#8c7a93',
      borderRadius: 28,
    });
    expect(styleOf(screen.getByRole('button', { name: 'Account' })).backgroundColor).toBe('#5a4426');
    expect(styleOf(screen.getByText('👤')).color).toBe('#ffc15e');
  });

  it('lets footer labels wrap and follow the system text size', async () => {
    await render(<AppFooterBar items={footerItems} />);

    const label = screen.getByText('Suggestions');
    expect(label.props.numberOfLines).toBeUndefined();
    expect(label.props.maxFontSizeMultiplier).toBeUndefined();
    expect(styleOf(label).fontSize).toBeGreaterThanOrEqual(10);
  });

  it('uses pill corners for the search and filter controls', async () => {
    await render(<OffersScreen />);

    const input = screen.getByPlaceholderText('offers.searchPlaceholder');
    expect(styleOf(input).borderRadius).toBe(999);
  });

  it('keeps the selected radius chip legible against the muted fill', async () => {
    await render(<OffersScreen />);

    expect(styleOf(screen.getByText('1500 m')).color).toBe('#8a5a00');
  });

  it('reserves scroll space for the floating action below the search controls', async () => {
    await render(<OffersScreen />);

    const scroll = screen.getByTestId('offers-scroll');
    expect(StyleSheet.flatten(scroll.props.contentContainerStyle).paddingBottom).toBeGreaterThanOrEqual(88);
  });

  it('reserves its own slot for the docked create action', async () => {
    await render(
      <AppFooterBar items={footerItems} createAction={<View testID="create-slot" />} />
    );

    expect(screen.getByTestId('create-slot')).toBeTruthy();
  });

  it('keeps the footer compact and centered on wide screens', async () => {
    await render(<AppFooterBar items={footerItems} />);

    const wrapper = hostElements().find(
      (node) => node.type === 'View' && styleOf(node).flexDirection === 'row'
    );
    expect(styleOf(wrapper as never).maxWidth).toBeGreaterThan(0);
    expect(styleOf(wrapper as never).alignSelf).toBe('center');
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

    expect(styleOf(screen.getByText('Account')).fontSize).toBeGreaterThanOrEqual(10);
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
