import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { BackHandler } from 'react-native';

const listeners: Record<string, Array<(event: { preventDefault: () => void }) => void>> = {};
const mockCloseImmersiveOffers = jest.fn();
const mockCloseOverlay = jest.fn();
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockEmit = jest.fn(() => ({ defaultPrevented: false }));
const mockDispatch = jest.fn();
const mockInsets = { top: 0, right: 0, bottom: 24, left: 0 };
let mockActiveTab = 'offers';
let mockSheetCount = 0;
let mockImmersiveOffers = false;
let mockOverlayRoute: { name: string; offerId?: string } | null = null;
let mockTabScreenOptions: Record<string, { title?: string; headerShown?: boolean }> = {};

type BarRoute = { key: string; name: string; title?: string };

type BarProps = {
  navigationState: { key?: string; index: number; routes: BarRoute[] };
  safeAreaInsets: typeof mockInsets;
  onTabPress: (event: { route: BarRoute; preventDefault: () => void }) => void;
  renderIcon?: (args: { route: BarRoute; focused: boolean; color: string }) => React.ReactNode;
  getLabelText?: (args: { route: BarRoute }) => string | undefined;
  getAccessibilityLabel?: (args: { route: BarRoute }) => string | undefined;
};

const mockBarProps: { current: BarProps | null } = { current: null };
const mockState = {
  key: 'MainTabs',
  index: 2,
  routes: [
    { key: 'account-key', name: 'account' },
    { key: 'suggestions-key', name: 'suggestions' },
    { key: 'offers-key', name: 'offers' },
  ] as BarRoute[],
};
const mockTabBarIcon = jest.fn(() => 'tab-icon');
const mockDescriptors: Record<string, { options: Record<string, unknown> }> = {
  'account-key': { options: { title: 'nav.account', tabBarLabel: 'nav.account', tabBarIcon: mockTabBarIcon } },
  'suggestions-key': { options: { title: 'nav.suggestions', tabBarLabel: 'nav.suggestions', tabBarIcon: mockTabBarIcon } },
  'offers-key': { options: { title: 'nav.offers', tabBarLabel: 'nav.offers', tabBarIcon: mockTabBarIcon } },
};

jest.mock('@react-navigation/native', () => ({
  CommonActions: {
    navigate: (name: string, params: unknown) => ({ type: 'NAVIGATE', name, params }),
  },
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  useNavigation: () => ({
    navigate: mockNavigate,
    emit: mockEmit,
    dispatch: mockDispatch,
    addListener: (event: string, handler: (event: { preventDefault: () => void }) => void) => {
      listeners[event] = [...(listeners[event] ?? []), handler];
      return () => undefined;
    },
  }),
  useNavigationContainerRef: () => ({
    isReady: () => true,
    navigate: jest.fn(),
    goBack: mockGoBack,
  }),
  useNavigationState: (selector: (state: { routes: Array<{ name: string }>; index: number }) => string) =>
    selector({ routes: [{ name: 'offers' }], index: 0 }),
}));

let tabNavigatorProps: {
  initialRouteName?: string;
  screenOptions?: { headerShown?: boolean; tabBarPosition?: string };
  tabBar?: (args: {
    state: typeof mockState;
    descriptors: typeof mockDescriptors;
    navigation: { emit: typeof mockEmit; dispatch: typeof mockDispatch };
    insets: typeof mockInsets;
  }) => React.ReactNode;
} = {};

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: (props: {
      children: React.ReactNode;
      initialRouteName?: string;
      screenOptions?: { headerShown?: boolean; tabBarPosition?: string };
      tabBar?: (args: {
        state: typeof mockState;
        descriptors: typeof mockDescriptors;
        navigation: { emit: typeof mockEmit; dispatch: typeof mockDispatch };
        insets: typeof mockInsets;
      }) => React.ReactNode;
    }) => {
      tabNavigatorProps = props;
      return (
        <>
          {props.children}
          {props.tabBar?.({
            state: mockState,
            descriptors: mockDescriptors,
            navigation: { emit: mockEmit, dispatch: mockDispatch },
            insets: mockInsets,
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
      options: { title?: string; headerShown?: boolean };
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

jest.mock('react-native-paper', () => {
  const actual = jest.requireActual('react-native-paper');
  const React = require('react');
  const { View } = require('react-native');
  return {
    ...actual,
    BottomNavigation: {
      Bar: (props: BarProps) => {
        mockBarProps.current = props;
        return React.createElement(
          View,
          { testID: 'rnp-bottom-bar' },
          props.navigationState.routes.map((route) =>
            React.createElement(View, {
              key: route.key,
              testID: `rnp-tab-${route.key}`,
              accessibilityLabel: props.getAccessibilityLabel?.({ route }),
            })
          )
        );
      },
    },
  };
});

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    activeTab: mockActiveTab,
    closeImmersiveOffers: mockCloseImmersiveOffers,
    closeOverlay: mockCloseOverlay,
    immersiveOffers: mockImmersiveOffers,
    openAddOffer: jest.fn(),
    openTab: jest.fn(),
    overlayRoute: mockOverlayRoute,
    sheetCount: mockSheetCount,
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

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/CreateOfferFab', () => {
  const { View: MockView } = require('react-native');
  return { CreateOfferFab: () => <MockView testID="create-offer-fab" /> };
});
jest.mock('../../../src/DealsSeeker.ReactNative/src/components/LoadingOverlay', () => ({ LoadingOverlay: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/AccountScreen', () => ({ AccountScreen: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/AddOfferScreen', () => ({ AddOfferScreen: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/FavoritesScreen', () => ({ FavoritesScreen: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/OffersScreen', () => ({ OffersScreen: () => null }));
jest.mock('../../../src/DealsSeeker.ReactNative/src/screens/SuggestionsScreen', () => ({ SuggestionsScreen: () => null }));

const { AppNavigator } = require('../../../src/DealsSeeker.ReactNative/src/navigation/AppNavigator');

describe('native shell Back handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEmit.mockReturnValue({ defaultPrevented: false });
    mockActiveTab = 'offers';
    mockSheetCount = 0;
    mockImmersiveOffers = false;
    mockOverlayRoute = null;
    tabNavigatorProps = {};
    mockTabScreenOptions = {};
    mockBarProps.current = null;
    Object.keys(mockDescriptors).forEach((key) => {
      mockDescriptors[key].options = {
        title: `nav.${key.replace('-key', '')}`,
        tabBarLabel: `nav.${key.replace('-key', '')}`,
        tabBarIcon: mockTabBarIcon,
      };
    });
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

  it('renders one Material 3 BottomNavigation.Bar from the navigator tabBar prop', async () => {
    await render(<AppNavigator />);
    expect(typeof tabNavigatorProps.tabBar).toBe('function');
    expect(screen.getByTestId('rnp-bottom-bar')).toBeTruthy();
    expect(screen.getAllByTestId(/^rnp-tab-/)).toHaveLength(3);
  });

  it('wires the navigation state and safe-area insets into the bar', async () => {
    await render(<AppNavigator />);
    expect(mockBarProps.current?.navigationState).toEqual(mockState);
    expect(mockBarProps.current?.safeAreaInsets).toEqual(mockInsets);
  });

  it('renders icons from the descriptors tabBarIcon', async () => {
    await render(<AppNavigator />);
    const route = mockState.routes[1];
    const icon = mockBarProps.current?.renderIcon?.({ route, focused: true, color: '#ff0000' });
    expect(mockTabBarIcon).toHaveBeenCalledWith({ focused: true, color: '#ff0000', size: 24 });
    expect(icon).toBe('tab-icon');
  });

  it('resolves bar labels from tabBarLabel, title, then the route name', async () => {
    mockDescriptors['account-key'].options = { tabBarLabel: 'Label', title: 'Title' };
    mockDescriptors['suggestions-key'].options = { title: 'Title' };
    mockDescriptors['offers-key'].options = {};
    await render(<AppNavigator />);

    expect(mockBarProps.current?.getLabelText?.({ route: mockState.routes[0] })).toBe('Label');
    expect(mockBarProps.current?.getLabelText?.({ route: mockState.routes[1] })).toBe('Title');
    expect(mockBarProps.current?.getLabelText?.({ route: mockState.routes[2] })).toBe('offers');
  });

  it('keeps accessible destination names on the bar tabs', async () => {
    await render(<AppNavigator />);
    expect(screen.getByTestId('rnp-tab-offers-key').props.accessibilityLabel).toBe('nav.offers');
  });

  it('emits tabPress and navigates with CommonActions when a tab is pressed', async () => {
    await render(<AppNavigator />);
    const preventDefault = jest.fn();

    mockBarProps.current?.onTabPress({ route: mockState.routes[1], preventDefault });

    expect(mockEmit).toHaveBeenCalledWith({
      type: 'tabPress',
      target: 'suggestions-key',
      canPreventDefault: true,
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'suggestions', target: 'MainTabs' })
    );
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('honours a prevented tabPress without navigating', async () => {
    mockEmit.mockReturnValue({ defaultPrevented: true });
    await render(<AppNavigator />);
    const preventDefault = jest.fn();

    mockBarProps.current?.onTabPress({ route: mockState.routes[0], preventDefault });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('closes the immersive feed on system Back instead of leaving the app', async () => {
    mockImmersiveOffers = true;
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

  it('resolves overlay dismissal through native navigation, not a hardware Back handler', async () => {
    const addEventListener = jest
      .spyOn(BackHandler, 'addEventListener')
      .mockImplementation(() => ({ remove: jest.fn() }));

    await render(<AppNavigator />);
    expect(addEventListener).not.toHaveBeenCalled();

    const preventDefault = jest.fn();
    await act(async () => {
      listeners.beforeRemove.forEach((handler) => handler({ preventDefault }));
    });
    expect(mockCloseOverlay).toHaveBeenCalledTimes(2);

    addEventListener.mockRestore();
  });

  it.each(['account', 'suggestions', 'offers'] as const)(
    'names the standard %s destination in a Material 3 app bar with native headers off',
    async (tab) => {
      mockActiveTab = tab;
      await render(<AppNavigator />);

      expect(tabNavigatorProps.screenOptions?.headerShown).toBe(false);
      expect(mockTabScreenOptions[tab].title).toBe(`nav.${tab}`);
      expect(mockTabScreenOptions[tab].headerShown).toBeUndefined();
      expect(screen.getByText(`nav.${tab}`)).toBeTruthy();
    }
  );

  it('keeps the immersive presentation headerless', async () => {
    mockImmersiveOffers = true;
    await render(<AppNavigator />);

    expect(screen.queryByText('nav.offers')).toBeNull();
    expect(screen.getByTestId('app-shell-content')).toBeTruthy();
  });

  it('keeps the overlay Material 3 app bar with a labelled back affordance', async () => {
    mockOverlayRoute = { name: 'add-offer' };
    await render(<AppNavigator />);

    expect(screen.getByText('add.title')).toBeTruthy();
    await fireEvent.press(screen.getAllByLabelText('common.back')[0]);
    expect(mockGoBack).toHaveBeenCalled();
  });
});
