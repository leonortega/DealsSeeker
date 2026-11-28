import { render, screen } from '@testing-library/react-native';
import { MD3LightTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { AppFooterBar } from '../../../src/DealsSeeker.ReactNative/src/components/AppFooterBar';
import { platformTouchFloor } from '../../../src/DealsSeeker.ReactNative/src/utils/layout';
import { ImmersiveOfferFeed } from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed';
import { OffersScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/OffersScreen';
import type { OfferItemDto } from '../../../src/DealsSeeker.ReactNative/src/api/types';

const mockSearchOffers = jest.fn();
const mockRunOperation = (_key: string | null, task: () => Promise<unknown>) => task();

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
    runOperation: mockRunOperation,
    setReportDraft: jest.fn(),
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferCard', () => ({ OfferCard: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferDetailModal', () => ({
  OfferDetailModal: () => null,
}));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferCommentsModal', () => ({
  OfferCommentsModal: () => null,
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

  it('uses the Material 3 bar surface and active indicator from the Paper theme', async () => {
    await render(
      <AppFooterBar items={[{ ...footerItems[0], active: true }, footerItems[1]]} />
    );

    expect(screen.getByTestId('bottom-navigation-bar')).toBeTruthy();
    expect(screen.getByTestId('footer-tab-account').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true, disabled: false })
    );
    const styles = hostElements().map((node) => styleOf(node));
    expect(styles.some((style) => style.backgroundColor === MD3LightTheme.colors.elevation.level2)).toBe(true);
    expect(styles.some((style) => style.backgroundColor === MD3LightTheme.colors.secondaryContainer)).toBe(true);
    const authoredColors = new Set([palette.accent, palette.border, palette.card, palette.ink]);
    expect(styles.some((style) => authoredColors.has(String(style.backgroundColor)))).toBe(false);
  });

  it('uses Material 3 navigation roles for the RNP bar', async () => {
    await render(<AppFooterBar items={footerItems} />);

    const wrapper = screen.getByTestId('bottom-navigation-bar-content-wrapper');
    expect(wrapper.props.accessibilityRole).toBe('tablist');
    const labels = screen.getAllByText(/Account|Suggestions/, { includeHiddenElements: true });
    expect(labels.length).toBeGreaterThanOrEqual(2);
  });

  it('lets footer labels wrap and follow the system reading size', async () => {
    await render(<AppFooterBar items={footerItems} />);

    const label = screen.getAllByText('Suggestions', { includeHiddenElements: true })[0];
    expect(label.props.numberOfLines).toBeUndefined();
    expect(label.props.maxFontSizeMultiplier).toBeUndefined();
    expect(styleOf(label).flexShrink).toBeGreaterThan(0);
  });

  it('uses pill corners for the search and filter controls', async () => {
    await render(<OffersScreen />);

    const input = screen.getByPlaceholderText('offers.searchPlaceholder');
    expect(styleOf(input).borderRadius).toBe(999);
  });

  it('keeps the selected coverage value legible against the muted fill', async () => {
    await render(<OffersScreen />);

    expect(styleOf(screen.getByText(/1500 m/)).color).toBe('#8a5a00');
  });

  it('reserves scroll space for the floating action below the search controls', async () => {
    await render(<OffersScreen />);

    const scroll = screen.getByTestId('offers-scroll');
    expect(StyleSheet.flatten(scroll.props.contentContainerStyle).paddingBottom).toBeGreaterThanOrEqual(88);
  });

  it('keeps the Create action outside the navigation destinations', async () => {
    await render(<AppFooterBar items={footerItems} />);

    expect(screen.getAllByTestId(/^footer-tab-/)).toHaveLength(2);
    expect(screen.queryByText('Create')).toBeNull();
  });

  it('renders one Material 3 bar with a single tablist', async () => {
    await render(<AppFooterBar items={footerItems} />);

    expect(screen.getAllByTestId('bottom-navigation-bar')).toHaveLength(1);
    expect(screen.getByTestId('bottom-navigation-bar-content-wrapper').props.accessibilityRole).toBe('tablist');
  });

  it('gives every footer tab the platform touch floor', async () => {
    await render(<AppFooterBar items={footerItems} />);

    for (const item of footerItems) {
      const tab = screen.getByTestId(`footer-tab-${item.key}`);
      expect(styleOf(tab).minHeight).toBeGreaterThanOrEqual(platformTouchFloor);
      expect(styleOf(tab).minWidth).toBeGreaterThanOrEqual(platformTouchFloor);
    }
  });

  it('separates adjacent footer tabs by at least 8 units', async () => {
    await render(<AppFooterBar items={footerItems} />);

    const tabs = footerItems.map((item) => screen.getByTestId(`footer-tab-${item.key}`));
    const separation = tabs.reduce((total, tab) => total + Number(styleOf(tab).marginHorizontal ?? 0), 0);
    expect(separation).toBeGreaterThanOrEqual(8);
  });

  it('renders footer labels at a legible size', async () => {
    await render(<AppFooterBar items={footerItems} />);

    const label = screen.getAllByText('Account', { includeHiddenElements: true })[0];
    expect(styleOf(label).fontSize).toBeGreaterThanOrEqual(10);
  });

  it('gives the coverage control the platform touch floor without showing five chips', async () => {
    await render(<OffersScreen />);

    const control = await screen.findByRole('button', { name: /1500 m/ });
    expect(styleOf(control).minHeight).toBeGreaterThanOrEqual(platformTouchFloor);
    expect(screen.queryByRole('button', { name: '500 m' })).toBeNull();
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

  it('keeps the iOS touch floor at 44 units', () => {
    expect(platformTouchFloor).toBe(44);
  });
});
