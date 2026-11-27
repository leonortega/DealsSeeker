import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';

let mockReduceMotion = false;
let mockTopInset = 0;
let mockWidth = 390;
let mockImmersiveOffers = false;

const mockStackScreenOptions = jest.fn(() => ({ headerShown: false }));
const mockModalScreenOptions = jest.fn(() => ({ headerShown: false }));

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

let mockTabNavigatorProps: { screenOptions?: Record<string, unknown> } = {};
let mockTabScreenOptions: Record<string, Record<string, unknown>> = {};

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({
      children,
      tabBar,
      ...props
    }: {
      children: React.ReactNode;
      tabBar?: (args: {
        state: { routes: Array<{ name: string }>; index: number };
        navigation: { navigate: () => void };
      }) => React.ReactNode;
    }) => {
      mockTabNavigatorProps = props as { screenOptions?: Record<string, unknown> };
      return (
        <>
          {children}
          {tabBar?.({
            state: { routes: [{ name: 'offers' }], index: 0 },
            navigation: { navigate: jest.fn() },
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
    }: {
      children?: () => React.ReactNode;
      component?: () => React.ReactNode;
    }) => {
      if (Component) {
        return <Component />;
      }
      return typeof children === 'function' ? children() : (children ?? null);
    },
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/navigation/shellOptions', () => ({
  stackScreenOptions: (...args: unknown[]) => mockStackScreenOptions(...(args as [])),
  tabScreenOptions: () => ({ headerShown: true }),
  modalScreenOptions: (...args: unknown[]) => mockModalScreenOptions(...(args as [])),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useReduceMotion', () => ({
  useReduceMotion: () => mockReduceMotion,
}));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: () => ({ top: mockTopInset, right: 0, bottom: 0, left: 0 }),
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
      panel: '#fff9f0',
    },
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/AppFooterBar', () => ({
  AppFooterBar: () => null,
  footerBarAppearance: (palette: { backdrop: string; border: string; accent: string; inkMuted: string }) => ({
    backgroundColor: palette.backdrop,
    borderColor: palette.border,
    activeTintColor: palette.accent,
    inactiveTintColor: palette.inkMuted,
  }),
}));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/CreateOfferFab', () => ({ CreateOfferFab: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/LoadingOverlay', () => ({ LoadingOverlay: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/NavIcon', () => ({ NavIcon: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/AccountScreen', () => ({ AccountScreen: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/AddOfferScreen', () => ({ AddOfferScreen: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/FavoritesScreen', () => ({ FavoritesScreen: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/OffersScreen', () => ({ OffersScreen: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/SuggestionsScreen', () => ({ SuggestionsScreen: () => null }));

const { AppNavigator } = require('../../../src/DealsSeeker.ReactNative/src/navigation/AppNavigator');

describe('native shell platform behavior', () => {
  beforeEach(() => {
    mockReduceMotion = false;
    mockTopInset = 0;
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

  it('uses a bottom tab bar at compact width and a navigation rail at tablet width', async () => {
    await render(<AppNavigator />);
    expect(mockTabNavigatorProps.screenOptions?.tabBarPosition).toBe('bottom');

    mockWidth = 900;
    await render(<AppNavigator />);
    expect(mockTabNavigatorProps.screenOptions?.tabBarPosition).toBe('left');
  });

  it('paints the native tab surface with the authored night footer palette', async () => {
    await render(<AppNavigator />);

    const options = mockTabNavigatorProps.screenOptions ?? {};
    expect(StyleSheet.flatten(options.tabBarStyle)).toMatchObject({
      backgroundColor: '#121417',
      borderColor: '#d7c9b5',
    });
    expect(options.tabBarActiveTintColor).toBe('#b85c38');
    expect(options.tabBarInactiveTintColor).toBe('#5f6d63');
  });

  it('shows a native header with each destination title and hides it for the immersive feed', async () => {
    await render(<AppNavigator />);

    expect(mockTabNavigatorProps.screenOptions?.headerShown).toBe(true);
    expect(mockTabScreenOptions.account.title).toBe('nav.account');
    expect(mockTabScreenOptions.suggestions.title).toBe('nav.suggestions');
    expect(mockTabScreenOptions.offers.title).toBe('nav.offers');
    expect(mockTabScreenOptions.offers.headerShown).toBe(true);

    mockImmersiveOffers = true;
    await render(<AppNavigator />);
    expect(mockTabScreenOptions.offers.headerShown).toBe(false);
  });
});
