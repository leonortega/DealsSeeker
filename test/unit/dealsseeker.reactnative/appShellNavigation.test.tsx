import { act, render, screen } from '@testing-library/react-native';

const listeners: Record<string, Array<(event: { preventDefault: () => void }) => void>> = {};
const mockCloseImmersiveOffers = jest.fn();
const mockNavigate = jest.fn();
let mockActiveTab = 'offers';
let mockSheetCount = 0;

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  useNavigation: () => ({
    navigate: mockNavigate,
    addListener: (event: string, handler: (event: { preventDefault: () => void }) => void) => {
      listeners[event] = [...(listeners[event] ?? []), handler];
      return () => undefined;
    },
  }),
  useNavigationContainerRef: () => ({
    isReady: () => true,
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useNavigationState: (selector: (state: { routes: Array<{ name: string }>; index: number }) => string) =>
    selector({ routes: [{ name: 'offers' }], index: 0 }),
}));

let tabNavigatorProps: { initialRouteName?: string } = {};

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: (props: {
      children: React.ReactNode;
      initialRouteName?: string;
      tabBar?: (args: {
        state: { routes: Array<{ name: string }>; index: number };
        navigation: { navigate: typeof mockNavigate };
      }) => React.ReactNode;
    }) => {
      tabNavigatorProps = props;
      return (
        <>
          {props.children}
          {props.tabBar?.({
            state: { routes: [{ name: 'offers' }], index: 0 },
            navigation: { navigate: mockNavigate },
          })}
        </>
      );
    },
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

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    activeTab: mockActiveTab,
    closeImmersiveOffers: mockCloseImmersiveOffers,
    closeOverlay: jest.fn(),
    immersiveOffers: true,
    openAddOffer: jest.fn(),
    openTab: jest.fn(),
    overlayRoute: null,
    sheetCount: mockSheetCount,
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

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/AppFooterBar', () => {
  const { View: MockView } = require('react-native');
  return { AppFooterBar: () => <MockView testID="app-footer-bar" /> };
});
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/CreateOfferFab', () => {
  const { View: MockView } = require('react-native');
  return { CreateOfferFab: () => <MockView testID="create-offer-fab" /> };
});
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/LoadingOverlay', () => ({ LoadingOverlay: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/NavIcon', () => ({ NavIcon: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/AccountScreen', () => ({ AccountScreen: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/AddOfferScreen', () => ({ AddOfferScreen: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/FavoritesScreen', () => ({ FavoritesScreen: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/OffersScreen', () => ({ OffersScreen: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/SuggestionsScreen', () => ({ SuggestionsScreen: () => null }));

const { AppNavigator } = require('../../../src/DealsSeeker.ReactNative/src/navigation/AppNavigator');

describe('native shell Back handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveTab = 'offers';
    mockSheetCount = 0;
    tabNavigatorProps = {};
    Object.keys(listeners).forEach((key) => delete listeners[key]);
  });

  it('follows an external tab change such as offer prefill', async () => {
    const view = await render(<AppNavigator />);
    mockActiveTab = 'reports';
    await act(async () => {
      view.rerender(<AppNavigator />);
    });

    expect(mockNavigate).toHaveBeenCalledWith('Main', { screen: 'reports' });
  });

  it('starts on the Offers feed', async () => {
    await render(<AppNavigator />);
    expect(tabNavigatorProps.initialRouteName).toBe('offers');
  });

  it('uses the platform-native tab bar instead of a custom footer', async () => {
    await render(<AppNavigator />);
    expect(tabNavigatorProps.tabBar).toBeUndefined();
  });

  it('closes the immersive feed on system Back instead of leaving the app', async () => {
    await render(<AppNavigator />);
    const preventDefault = jest.fn();

    await act(async () => {
      listeners.beforeRemove.forEach((handler) => handler({ preventDefault }));
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(mockCloseImmersiveOffers).toHaveBeenCalledTimes(1);
  });

  it('hides the Create action while a sheet is open (APP.PLATFORM.CHROME.001-R5)', async () => {
    const view = await render(<AppNavigator />);
    expect(screen.getByTestId('create-offer-fab')).toBeTruthy();

    mockSheetCount = 1;
    await act(async () => {
      view.rerender(<AppNavigator />);
    });

    expect(screen.queryByTestId('create-offer-fab')).toBeNull();
  });
});
