import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { OffersScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/OffersScreen';

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
import { OffersStatePanel } from '../../../src/DealsSeeker.ReactNative/src/components/OffersStatePanel';

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
    useTheme: () => ({ colors: { primary: '#b85c38', onPrimary: '#ffffff', surface: '#fffdf8', surfaceVariant: '#f5ded6', background: '#fffdf8', onSurface: '#1f3128', onSurfaceVariant: '#53433e', outline: '#d7c9b5', error: '#ba1a1a' }, fonts: {} }),
    Text: basic('text', Text),
    MD3LightTheme: { colors: {}, fonts: {} },
    MD3DarkTheme: { colors: {}, fonts: {} },
    DefaultTheme: { colors: {}, fonts: {} },
    PaperProvider: ({ children }: any) => children,
    Portal: ({ children }: any) => children,
    Searchbar: basic('searchbar', TextInput),
    Chip: basic('chip', Pressable, 'button'),
    Button: basic('button', Pressable, 'button'),
    Card: basic('card', View),
    Badge: basic('badge', View),
    FAB: basic('fab', Pressable, 'button'),
    RadioButton,
    Snackbar: basic('snackbar', View),
    IconButton: basic('iconbutton', Pressable, 'button'),
    ProgressBar: basic('progressbar', View),
    TouchableRipple: basic('touchable-ripple', Pressable, 'button'),
  };
});

let mockImmersiveOffers = false;
const mockCloseImmersiveOffers = jest.fn();
const mockRunOperation = (_key: string | null, task: () => Promise<unknown>) => task();

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
      searchOffers: jest.fn().mockResolvedValue({ offers: [], businesses: [] }),
      setOfferFavorite: jest.fn(),
      voteOfferAvailability: jest.fn(),
    },
    closeImmersiveOffers: mockCloseImmersiveOffers,
    immersiveOffers: mockImmersiveOffers,
    isPending: () => false,
    openAddOffer: jest.fn(),
    openImmersiveOffers: jest.fn(),
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
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferDetailModal', () => ({ OfferDetailModal: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/OfferCommentsModal', () => ({ OfferCommentsModal: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed', () => ({ ImmersiveOfferFeed: () => null }));

const palette = {
  accent: '#b85c38',
  border: '#d7c9b5',
  card: '#fffdf8',
  ink: '#1f3128',
  inkMuted: '#5f6d63',
  panel: '#fff9f0',
  panelAlt: '#e6f0e6',
  success: '#2f6e46',
  danger: '#8d2f2f',
  mode: 'light' as const,
  background: '#f4efe6',
  backgroundRaised: '#efe5d8',
  shadow: 'rgba(0,0,0,0.1)',
  overlay: 'rgba(0,0,0,0.4)',
};

describe('Offers device findings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockImmersiveOffers = false;
  });

  afterEach(() => jest.restoreAllMocks());

  it('keeps the recovery action compact so the create control cannot cover it', async () => {
    const onAction = jest.fn();
    await render(
      <OffersStatePanel
        title="No offers"
        hint="Clear the filters"
        actionLabel="Clear filters"
        onAction={onAction}
        palette={palette}
      />
    );

    const action = screen.getByRole('button', { name: 'Clear filters' });
    expect(StyleSheet.flatten(action.props.style).alignSelf).toBe('flex-start');
    await fireEvent.press(action);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('uses Material 3 card and button patterns for the recovery surface (OFFERS.UX.002-R16)', async () => {
    await render(
      <OffersStatePanel title="No offers" hint="Clear the filters" palette={palette} />
    );

    expect(hasComponent(screen.root, Card)).toBe(true);
    expect(hasComponent(screen.root, Button)).toBe(false);
  });
});
