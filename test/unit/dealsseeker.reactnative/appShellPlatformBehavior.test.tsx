import { StyleSheet } from 'react-native';
import { MD3LightTheme } from 'react-native-paper';
import { render, screen } from '@testing-library/react-native';

let mockReduceMotion = false;
let mockTopInset = 0;
let mockBottomInset = 0;
let mockWidth = 390;
let mockImmersiveOffers = false;

const mockStackScreenOptions = jest.fn(() => ({ headerShown: true }));
const mockModalScreenOptions = jest.fn(() => ({ headerShown: true }));

jest.spyOn(require('react-native'), 'useWindowDimensions').mockImplementation(
  () => ({ width: mockWidth, height: 844, scale: 2, fontScale: 1 })
);

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    addListener: () => () => undefined,
  }),
  useNavigationContainerRef: () => ({
    isReady: () => true,
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useNavigationState: (selector: (state: { routes: Array<{ name: string }>; index: number }) => unknown) =>
    selector({ routes: [{ name: 'offers' }], index: 0 }),
}));

let mockTabNavigatorProps: { screenOptions?: Record<string, unknown>; tabBar?: (args: unknown) => React.ReactNode } = {};
let mockTabScreenOptions: Record<string, Record<string, unknown>> = {};
const mockBarState = {
  key: 'MainTabs',
  index: 0,
  routes: [
    { key: 'account-key', name: 'account' },
    { key: 'suggestions-key', name: 'suggestions' },
    { key: 'offers-key', name: 'offers' },
  ],
};
const mockDescriptors = Object.fromEntries(
  mockBarState.routes.map((route) => [
    route.key,
    { options: { title: `nav.${route.name}`, tabBarLabel: `nav.${route.name}` } },
  ])
);

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({
      children,
      tabBar,
      ...props
    }: {
      children: React.ReactNode;
      tabBar?: (args: unknown) => React.ReactNode;
    }) => {
      mockTabNavigatorProps = { ...props, tabBar } as {
        screenOptions?: Record<string, unknown>;
        tabBar?: (args: unknown) => React.ReactNode;
      };
      return (
        <>
          {children}
          {tabBar?.({
            state: mockBarState,
            descriptors: mockDescriptors,
            navigation: {
              emit: () => ({ defaultPrevented: false }),
              dispatch: jest.fn(),
            },
            insets: { top: mockTopInset, right: 0, bottom: mockBottomInset, left: 0 },
          })}
        </>
      );
    },
    Screen: ({
      component: Component,
      name,
      options,
    }: {
      component: () => React.ReactNode;
      name: string;
      options: Record<string, unknown>;
    }) => {
      mockTabScreenOptions[name] = options;
      return <Component />;
    },
  }),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({
      children,
      component: Component,
      options,
    }: {
      children?: () => React.ReactNode;
      component?: () => React.ReactNode;
      options?: { header?: () => React.ReactNode };
    }) => {
      const header = options?.header?.();
      const content = Component ? <Component /> : typeof children === 'function' ? children() : children;
      return (
        <>
          {header}
          {content}
        </>
      );
    },
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/navigation/shellOptions', () => ({
  stackScreenOptions: (...args: unknown[]) => mockStackScreenOptions(...(args as [])),
  tabScreenOptions: () => ({ headerShown: false }),
  modalScreenOptions: (...args: unknown[]) => mockModalScreenOptions(...(args as [])),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useReduceMotion', () => ({
  useReduceMotion: () => mockReduceMotion,
}));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: () => ({ top: mockTopInset, right: 0, bottom: mockBottomInset, left: 0 }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    activeTab: 'offers',
    closeImmersiveOffers: jest.fn(),
    closeOverlay: jest.fn(),
    immersiveOffers: mockImmersiveOffers,
    openAddOffer: jest.fn(),
    openTab: jest.fn(),
    overlayRoute: null,
    palette: {
      accent: '#b85c38',
      backdrop: '#121417',
      background: '#f4efe6',
      border: '#d7c9b5',
      card: '#fffdf8',
      footerActive: '#5a2e20',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      mode: 'light' as const,
      panel: '#fff9f0',
    },
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/CreateOfferFab', () => ({ CreateOfferFab: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/LoadingOverlay', () => ({ LoadingOverlay: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/AccountScreen', () => ({ AccountScreen: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/AddOfferScreen', () => ({ AddOfferScreen: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/FavoritesScreen', () => ({ FavoritesScreen: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/OffersScreen', () => ({ OffersScreen: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/SuggestionsScreen', () => ({ SuggestionsScreen: () => null }));

const { AppNavigator } = require('../../../src/DealsSeeker.ReactNative/src/navigation/AppNavigator');

function hostStyles(): Record<string, unknown>[] {
  const found: Record<string, unknown>[] = [];
  const visit = (node: unknown) => {
    const element = node as { type?: string; props?: { style?: unknown }; children?: unknown[] } | null;
    if (!element || typeof element !== 'object') {
      return;
    }
    if (typeof element.type === 'string') {
      found.push((StyleSheet.flatten(element.props?.style) ?? {}) as Record<string, unknown>);
    }
    for (const child of element.children ?? []) {
      visit(child);
    }
  };
  visit(screen.container);
  return found;
}

describe('native shell platform behavior', () => {
  beforeEach(() => {
    mockReduceMotion = false;
    mockTopInset = 0;
    mockBottomInset = 0;
    mockWidth = 390;
    mockImmersiveOffers = false;
    mockTabNavigatorProps = {};
    mockTabScreenOptions = {};
    mockStackScreenOptions.mockClear();
    mockModalScreenOptions.mockClear();
  });

  it('passes Reduce Motion into native stack and modal transition options', async () => {
    mockReduceMotion = true;

    await render(<AppNavigator />);

    expect(mockStackScreenOptions).toHaveBeenCalledWith(true);
    expect(mockModalScreenOptions).toHaveBeenCalledWith(expect.any(String), true);
  });

  it('does not alter transition options when Reduce Motion is disabled', async () => {
    await render(<AppNavigator />);

    expect(mockStackScreenOptions).toHaveBeenCalledWith(false);
    expect(mockModalScreenOptions).toHaveBeenCalledWith(expect.any(String), false);
  });

  it('applies the reported top safe-area inset to the authenticated shell', async () => {
    mockTopInset = 24;

    await render(<AppNavigator />);

    expect(StyleSheet.flatten(screen.getByTestId('app-shell-root').props.style).paddingTop).toBe(24);
  });

  it('applies the navigation-bar inset and follows the rendered route background', async () => {
    mockBottomInset = 24;
    mockImmersiveOffers = true;

    await render(<AppNavigator />);

    const content = screen.getByTestId('app-shell-content');
    expect(StyleSheet.flatten(content.props.style).paddingBottom).toBe(24);
    expect(StyleSheet.flatten(screen.getByTestId('app-shell-root').props.style).backgroundColor).toBe(
      MD3LightTheme.colors.inverseSurface
    );
  });

  it('uses a bottom tab bar at compact width and a navigation rail at tablet width', async () => {
    await render(<AppNavigator />);
    expect(mockTabNavigatorProps.screenOptions?.tabBarPosition).toBe('bottom');

    mockWidth = 900;
    await render(<AppNavigator />);
    expect(mockTabNavigatorProps.screenOptions?.tabBarPosition).toBe('left');
  });

  it('renders one RNP navigation bar with Material 3 component defaults', async () => {
    await render(<AppNavigator />);

    expect(typeof mockTabNavigatorProps.tabBar).toBe('function');
    expect(screen.getByTestId('bottom-navigation-bar')).toBeTruthy();
    expect(screen.getByTestId('bottom-navigation-bar-content-wrapper').props.accessibilityRole).toBe('tablist');
    const styles = hostStyles();
    expect(styles.some((style) => style.backgroundColor === MD3LightTheme.colors.elevation.level2)).toBe(true);
    expect(styles.some((style) => style.backgroundColor === MD3LightTheme.colors.secondaryContainer)).toBe(true);
    expect(mockTabNavigatorProps.screenOptions?.tabBarStyle).toBeUndefined();
    expect(mockTabNavigatorProps.screenOptions?.tabBarActiveTintColor).toBeUndefined();
    expect(mockTabNavigatorProps.screenOptions?.tabBarInactiveTintColor).toBeUndefined();
  });

  it('passes the reported bottom inset to the RNP navigation bar', async () => {
    mockBottomInset = 24;
    await render(<AppNavigator />);

    expect(
      StyleSheet.flatten(screen.getByTestId('bottom-navigation-bar-content-wrapper').props.style).marginBottom
    ).toBe(24);
  });

  it('uses Material 3 app bars instead of native headers and keeps the immersive feed headerless', async () => {
    await render(<AppNavigator />);

    expect(mockTabNavigatorProps.screenOptions?.headerShown).toBe(false);
    expect(mockTabScreenOptions.account.title).toBe('nav.account');
    expect(mockTabScreenOptions.suggestions.title).toBe('nav.suggestions');
    expect(mockTabScreenOptions.offers.title).toBe('nav.offers');
    expect(screen.getAllByText('nav.offers').some((node) => node.props.accessibilityRole === 'header')).toBe(true);

    mockImmersiveOffers = true;
    await render(<AppNavigator />);
    expect(screen.queryAllByText('nav.offers').some((node) => node.props.accessibilityRole === 'header')).toBe(false);
  });
});
