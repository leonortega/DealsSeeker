import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import fs from 'fs';
import path from 'path';
import { StyleSheet } from 'react-native';
import { Button, IconButton, Searchbar, Text as PaperText, TouchableRipple } from 'react-native-paper';

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
import { OffersScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/OffersScreen';
import { platformTouchFloor } from '../../../src/DealsSeeker.ReactNative/src/utils/layout';

// Paper primitives keep testID/accessibilityRole/style so the authored assertions still hold.
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Pressable, TextInput, Text } = require('react-native');
  const basic = (name: string, Component: any, defaultRole?: string) => ({
    children, label, testID, style, accessibilityRole, inputStyle, visible, ...rest
  }: any) => {
    if (visible === false) {
      return null;
    }
    const content = children ?? label;
    const rendered = typeof content === 'string' && Component !== Text
      ? React.createElement(Text, null, content)
      : content;
    return React.createElement(Component, {
      ...rest,
      testID: testID ?? `m3-${name}`,
      style: style ?? inputStyle,
      accessibilityRole: accessibilityRole ?? defaultRole,
    }, rendered);
  };
  const RadioButton = { Group: basic('radio-group', View, 'radiogroup') };
  RadioButton.Android = basic('radio', Pressable, 'radio');
  RadioButton.Item = RadioButton.Android;
  return {
    MD3LightTheme: { colors: {}, fonts: {} },
    MD3DarkTheme: { colors: {}, fonts: {} },
    DefaultTheme: { colors: {}, fonts: {} },
    PaperProvider: ({ children }: any) => children,
    useTheme: () => ({ colors: { primary: '#b85c38', onPrimary: '#ffffff', surface: '#fffdf8', surfaceVariant: '#f5ded6', background: '#fffdf8', onSurface: '#1f3128', onSurfaceVariant: '#53433e', outline: '#d7c9b5', error: '#ba1a1a' }, fonts: {} }),
    Portal: ({ children }: any) => children,
    Searchbar: basic('searchbar', TextInput),
    Chip: basic('chip', Pressable, 'button'),
    Text: basic('text', Text),
    TouchableRipple: basic('touchable-ripple', Pressable),
    Button: basic('button', Pressable, 'button'),
    Card: basic('card', View),
    Badge: basic('badge', View),
    FAB: basic('fab', Pressable, 'button'),
    RadioButton,
    Snackbar: basic('snackbar', View),
    IconButton: basic('iconbutton', Pressable, 'button'),
    ProgressBar: basic('progressbar', View),
  };
});

let mockImmersiveOffers = false;
let mockIsPending = false;
let mockLoadingCount = 0;
const mockSearchOffers = jest.fn();
const mockRunOperation = jest.fn((_key: string | null, task: () => Promise<unknown>) => task());
const mockOpenImmersiveOffers = jest.fn();
const mockCloseImmersiveOffers = jest.fn();

jest.mock('expo-location', () => ({
  LocationAccuracy: { Balanced: 3 },
  getCurrentPositionAsync: jest.fn().mockResolvedValue({ coords: { latitude: 40.7128, longitude: -74.006 } }),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
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
    closeImmersiveOffers: mockCloseImmersiveOffers,
    immersiveOffers: mockImmersiveOffers,
    isAuthenticated: true,
    closeSheet: jest.fn(),
    isAuthenticated: true,
    isPending: () => mockIsPending,
    openSheet: jest.fn(),
    loadingCount: mockLoadingCount,
    openAddOffer: jest.fn(),
    openImmersiveOffers: mockOpenImmersiveOffers,
    palette: {
      accent: '#b85c38',
      border: '#d7c9b5',
      card: '#fffdf8',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      panel: '#fff9f0',
    },
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
describe('presentation mode switch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockImmersiveOffers = false;
    mockIsPending = false;
    mockLoadingCount = 0;
    mockSearchOffers.mockResolvedValue({ offers: [], businesses: [] });
  });

  it('uses the shell loading operation for the initial search', async () => {
    await render(<OffersScreen />);

    expect(mockRunOperation).toHaveBeenCalledWith(null, expect.any(Function));
    expect(screen.queryByText('app.loading')).toBeNull();
  });

  it('shows the authored empty-state guidance when a search returns no offers', async () => {
    await render(<OffersScreen />);

    expect(screen.getByText('offers.emptyTitle')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'offers.createFirstOffer' })).toBeTruthy();
    expect(screen.getByTestId('offers-scroll')).toBeTruthy();
  });

  it('does not mount its own loading overlay in the feed', async () => {
    mockImmersiveOffers = true;

    await render(<OffersScreen />);

    expect(screen.queryByText('app.loading')).toBeNull();
    expect(screen.queryByText('offers.loading')).toBeNull();
  });

  it('never runs a second inline progress indicator in the feed', async () => {
    mockImmersiveOffers = true;
    mockIsPending = true;

    await render(<OffersScreen />);
    await waitFor(() => expect(screen.queryByText('app.loading')).toBeNull());

    expect(screen.queryByText('offers.loading')).toBeNull();
  });

  it('offers Feed and Map options in the Offers view', async () => {
    await render(<OffersScreen />);

    expect(screen.getByRole('tab', { name: 'offers.mode.feed' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'offers.mode.map' })).toBeTruthy();
    expect(screen.queryByText('app.title')).toBeNull();
  });

  it('shows the brand mark to the left of the presentation switch', async () => {
    await render(<OffersScreen />);

    const mark = screen.getByTestId('brand-mark');
    const modeSlot = screen.getByRole('tab', { name: 'offers.mode.feed' }).parent.parent;
    const controls = mark.parent;
    expect(controls).toBe(modeSlot.parent);
    expect(controls.children.indexOf(mark)).toBeLessThan(
      controls.children.indexOf(modeSlot)
    );
  });

  it('mirrors the immersive top bar treatment for map-view controls', async () => {
    await render(<OffersScreen />);

    const mark = screen.getByTestId('brand-mark');
    const controls = mark.parent;
    expect(StyleSheet.flatten(controls.props.style)).toMatchObject({
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 8,
    });
    expect(StyleSheet.flatten(mark.props.style)).toMatchObject({
      backgroundColor: '#fff9f0',
      borderRadius: 999,
      height: 40,
      width: 40,
    });
    const topBarStyle = StyleSheet.flatten(controls.parent.props.style);
    expect(topBarStyle).toMatchObject({
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    });
    expect(topBarStyle.marginHorizontal).toBeUndefined();
    expect(StyleSheet.flatten(controls.parent.parent.props.style)).toMatchObject({ flex: 1 });
    expect(StyleSheet.flatten(controls.parent.parent.props.style).marginHorizontal).toBeUndefined();
  });

  it('hides scroll indicators in the standard Offers view', async () => {
    await render(<OffersScreen />);

    const scroll = screen.getByTestId('offers-scroll');
    expect(scroll.props.showsVerticalScrollIndicator).toBe(false);
    expect(scroll.props.showsHorizontalScrollIndicator).toBe(false);
  });

  it('renders standard offers through a recycling list', async () => {
    await render(<OffersScreen />);

    const scroll = screen.getByTestId('offers-scroll');
    expect(Array.isArray(scroll.props.data)).toBe(true);
    expect(typeof scroll.props.renderItem).toBe('function');
  });

  it('gives the title clearance below the map-view controls', async () => {
    await render(<OffersScreen />);

    const content = screen.getByTestId('offers-scroll').props.contentContainerStyle;
    expect(StyleSheet.flatten(content).paddingTop).toBe(68);
  });

  it('reuses the feed header slots with the search control hidden', async () => {
    await render(<OffersScreen />);

    const modeSlot = screen.getByRole('tab', { name: 'offers.mode.feed' }).parent.parent;
    expect(StyleSheet.flatten(modeSlot.props.style)).toMatchObject({ maxWidth: 360 });

    const topActions = screen.getByRole('button', { name: 'common.help' }).parent;
    expect(StyleSheet.flatten(topActions.props.style)).toMatchObject({ flexDirection: 'row', gap: 8 });
    expect(StyleSheet.flatten(topActions.children[0].props.style)).toMatchObject({
      height: platformTouchFloor,
      width: platformTouchFloor,
    });
    expect(screen.queryByRole('button', { name: 'offers.search' })).toBeNull();
  });

  it('presents the Offers map inside a bordered panel', async () => {
    await render(<OffersScreen />);

    expect(StyleSheet.flatten(screen.getByTestId('native-map').parent.props.style)).toMatchObject({
      borderRadius: 28,
      borderWidth: 1,
      borderColor: '#d7c9b5',
      padding: 0,
    });
  });

  it('marks Map selected in the standard view and switches to Feed', async () => {
    await render(<OffersScreen />);

    const mapTab = screen.getByRole('tab', { name: 'offers.mode.map' });
    expect(mapTab.props.accessibilityState.selected).toBe(true);

    await fireEvent.press(screen.getByRole('tab', { name: 'offers.mode.feed' }));
    expect(mockOpenImmersiveOffers).toHaveBeenCalledTimes(1);
  });

  it('marks Feed selected in the immersive view and switches to Map', async () => {
    mockImmersiveOffers = true;
    await render(<OffersScreen />);

    const feedTab = screen.getByRole('tab', { name: 'offers.mode.feed' });
    expect(feedTab.props.accessibilityState.selected).toBe(true);

    await fireEvent.press(screen.getByRole('tab', { name: 'offers.mode.map' }));
    expect(mockCloseImmersiveOffers).toHaveBeenCalledTimes(1);
  });

  it('uses Material 3 search, icon button, button and snackbar chrome (APP.PLATFORM.CHROME.001-R18)', async () => {
    await render(<OffersScreen />);

    expect(hasComponent(screen.root, Searchbar)).toBe(true);
    expect(hasComponent(screen.root, IconButton)).toBe(true);
    expect(hasComponent(screen.root, Button)).toBe(true);
  });

  it('uses a Material 3 ripple and type role for the presentation switch (APP.PLATFORM.CHROME.001-R18/R19, APP.TYPOGRAPHY.001-R7)', async () => {
    const view = await render(<OffersScreen />);

    expect(hasComponent(view.root, TouchableRipple)).toBe(true);
    expect(hasComponent(view.root, PaperText)).toBe(true);
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../../src/DealsSeeker.ReactNative/src/components/PresentationModeSwitch.tsx'),
      'utf8'
    );
    expect(source).toMatch(/useTheme/);
    expect(source).toMatch(/rippleColor=/);
    expect(source).not.toMatch(/android_ripple/);
    expect(source).not.toMatch(/<Pressable/);
    expect(source).not.toMatch(/fontSize/);
  });
});
