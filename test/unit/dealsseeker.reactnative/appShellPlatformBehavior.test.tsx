import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';

let mockReduceMotion = false;
let mockTopInset = 0;

const mockStackScreenOptions = jest.fn(() => ({ headerShown: false }));
const mockModalScreenOptions = jest.fn(() => ({ headerShown: false }));

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

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({
      children,
      tabBar,
    }: {
      children: React.ReactNode;
      tabBar?: (args: {
        state: { routes: Array<{ name: string }>; index: number };
        navigation: { navigate: () => void };
      }) => React.ReactNode;
    }) => (
      <>
        {children}
        {tabBar?.({
          state: { routes: [{ name: 'offers' }], index: 0 },
          navigation: { navigate: jest.fn() },
        })}
      </>
    ),
    Screen: ({ component: Component }: { component: () => React.ReactNode }) => <Component />,
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
  tabScreenOptions: () => ({ headerShown: false }),
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
    immersiveOffers: false,
    openAddOffer: jest.fn(),
    openTab: jest.fn(),
    overlayRoute: null,
    palette: {
      accent: '#b85c38',
      background: '#f4efe6',
      border: '#d7c9b5',
      card: '#fffdf8',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      panel: '#fff9f0',
    },
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/AppFooterBar', () => ({ AppFooterBar: () => null }));
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
});
