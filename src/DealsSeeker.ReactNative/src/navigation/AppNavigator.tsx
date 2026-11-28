import { useEffect, useRef, type ComponentRef } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Appbar, BottomNavigation, Surface, Text, useTheme, type MD3Theme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CommonActions,
  NavigationContainer,
  useNavigation,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CreateOfferFab } from '../components/CreateOfferFab';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { PlatformTabIcon } from '../components/PlatformTabIcon';
import { useApp } from '../hooks/useApp';
import { useAppStatus } from '../hooks/useAppStatus';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { useDestinationFocus } from '../hooks/useDestinationFocus';
import { resolveTabBarPosition } from '../utils/layout';
import type { MainTab } from '../api/types';
import { AccountScreen } from '../screens/AccountScreen';
import { AddOfferScreen } from '../screens/AddOfferScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { OffersScreen } from '../screens/OffersScreen';
import { SuggestionsScreen } from '../screens/SuggestionsScreen';
import { modalScreenOptions, stackScreenOptions, tabScreenOptions } from './shellOptions';
import { MAIN_TAB_DESTINATIONS } from './tabs';

export type RootStackParamList = {
  Main: undefined;
  AddOffer: { offerId?: string } | undefined;
  Favorites: undefined;
};

type MainTabParamList = Record<MainTab, undefined>;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function routeAppBarTitle(title: string, theme: MD3Theme) {
  return (
    <Text
      accessibilityRole="header"
      style={[{ color: theme.colors.onSurface, flexShrink: 1 }, theme.fonts.titleLarge]}
      variant="titleLarge"
    >
      {title}
    </Text>
  );
}

function StandardAppbar({ title, theme }: { title: string; theme: MD3Theme }) {
  return (
    <Appbar.Header mode="medium" style={{ backgroundColor: theme.colors.surface }}>
      <Appbar.Content title={routeAppBarTitle(title, theme)} />
    </Appbar.Header>
  );
}

function MainView() {
  const {
    activeTab,
    closeImmersiveOffers,
    immersiveOffers,
    openAddOffer,
    openTab,
    overlayRoute,
    t,
  } = useApp();
  const { sheetCount } = useAppStatus();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const navigation = useNavigation();
  const containerRef = useRef<ComponentRef<typeof View>>(null);
  useDestinationFocus(containerRef, activeTab, overlayRoute, t);
  const immersiveFeedVisible = immersiveOffers && activeTab === 'offers';
  const surfaceColor =
    immersiveFeedVisible && !theme.dark ? theme.colors.inverseSurface : theme.colors.surface;
  const destination = MAIN_TAB_DESTINATIONS.find((item) => item.name === activeTab);

  const lastActiveTab = useRef<MainTab | null>(null);

  useEffect(() => {
    if (activeTab && lastActiveTab.current && activeTab !== lastActiveTab.current) {
      (navigation.navigate as (...args: unknown[]) => void)('Main', { screen: activeTab });
    }
    lastActiveTab.current = activeTab;
  }, [activeTab, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (!immersiveFeedVisible) {
        return;
      }
      event.preventDefault();
      closeImmersiveOffers();
    });
    return unsubscribe;
  }, [closeImmersiveOffers, immersiveFeedVisible, navigation]);

  return (
    <View
      ref={containerRef}
      testID="app-shell-root"
      style={[styles.root, { backgroundColor: surfaceColor, paddingTop: insets.top }]}
    >
      {!immersiveFeedVisible && destination ? (
        <StandardAppbar theme={theme} title={t(destination.labelKey)} />
      ) : null}
      <View
        testID="app-shell-content"
        style={[
          styles.content,
          activeTab === 'offers' && styles.offersContent,
          immersiveFeedVisible && styles.immersiveContent,
          { paddingBottom: insets.bottom },
        ]}
      >
        <Tabs.Navigator
          initialRouteName="offers"
          screenOptions={{
            ...tabScreenOptions(),
            tabBarPosition: resolveTabBarPosition(width),
          }}
          tabBar={({ navigation, state, descriptors, insets }) => {
            const labelForRoute = (route: (typeof state.routes)[number]) => {
              const { options } = descriptors[route.key];
              return typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : typeof options.title === 'string'
                  ? options.title
                  : route.name;
            };

            return (
              <BottomNavigation.Bar
                navigationState={state}
                safeAreaInsets={insets}
                onTabPress={({ route, preventDefault }) => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (event.defaultPrevented) {
                    preventDefault();
                  } else {
                    navigation.dispatch({
                      ...CommonActions.navigate(route.name, route.params),
                      target: state.key,
                    });
                  }
                }}
                renderIcon={({ route, focused, color }) =>
                  descriptors[route.key].options.tabBarIcon?.({ focused, color, size: 24 }) ?? null
                }
                getLabelText={({ route }) => labelForRoute(route)}
                getAccessibilityLabel={({ route }) => labelForRoute(route)}
              />
            );
          }}
        >
          {MAIN_TAB_DESTINATIONS.map((item) => (
            <Tabs.Screen
              key={item.name}
              listeners={{ tabPress: () => openTab(item.name) }}
              name={item.name}
              component={
                item.name === 'account'
                  ? AccountScreen
                  : item.name === 'suggestions'
                    ? SuggestionsScreen
                    : OffersScreen
              }
              options={{
                title: t(item.labelKey),
                tabBarLabel: t(item.labelKey),
                tabBarIcon: ({ color, size }) => (
                  <PlatformTabIcon color={color} name={item.icon} size={size} />
                ),
              }}
            />
          ))}
        </Tabs.Navigator>
      </View>
      {sheetCount === 0 ? (
        <Surface elevation={0} style={[styles.createSlot, { bottom: insets.bottom + 76 }]}>
          <CreateOfferFab label={t('nav.createOffer')} onPress={() => openAddOffer()} />
        </Surface>
      ) : null}
      <LoadingOverlay />
    </View>
  );
}

function DismissSync({
  onDismiss,
  canDismiss = () => true,
}: {
  onDismiss: () => void;
  canDismiss?: () => boolean;
}) {
  const navigation = useNavigation();
  const handled = useRef(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (handled.current) {
        return;
      }
      if (!canDismiss()) {
        event.preventDefault();
        return;
      }
      handled.current = true;
      onDismiss();
    });
    return unsubscribe;
  }, [canDismiss, navigation, onDismiss]);

  return null;
}

export function AppNavigator() {
  const { closeOverlay, overlayRoute, t } = useApp();
  const reduceMotion = useReduceMotion();
  const theme = useTheme();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const lastOverlay = useRef<string | null>(null);
  const dismissGuard = useRef<() => boolean>(() => true);

  function overlayHeader(title: string) {
    return (
      <Appbar.Header mode="small" style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.Action
          accessibilityLabel={t('common.back')}
          icon={({ size }) => (
            <PlatformTabIcon color={theme.colors.onSurface} name="chevronBackward" size={size} />
          )}
          onPress={() => navigationRef.goBack()}
        />
        <Appbar.Content title={routeAppBarTitle(title, theme)} />
      </Appbar.Header>
    );
  }

  useEffect(() => {
    if (!navigationRef.isReady()) {
      return;
    }

    const key = overlayRoute?.name ?? null;
    if (key === lastOverlay.current) {
      return;
    }
    lastOverlay.current = key;

    if (key === 'add-offer') {
      navigationRef.navigate('AddOffer', {
        offerId: overlayRoute?.name === 'add-offer' ? overlayRoute.offerId : undefined,
      });
    } else if (key === 'favorites') {
      navigationRef.navigate('Favorites');
    } else {
      navigationRef.goBack();
    }
  }, [navigationRef, overlayRoute]);

  function syncDismiss() {
    lastOverlay.current = null;
    closeOverlay();
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={stackScreenOptions(reduceMotion)}>
        <Stack.Screen name="Main" component={MainView} options={{ headerShown: false }} />
        <Stack.Screen
          name="AddOffer"
          options={{
            ...modalScreenOptions(Platform.OS, reduceMotion),
            header: () => overlayHeader(t('add.title')),
            title: t('add.title'),
          }}
        >
          {() => (
            <>
              <DismissSync onDismiss={syncDismiss} canDismiss={() => dismissGuard.current()} />
              <AddOfferScreen
                onDismissGuard={(guard) => {
                  dismissGuard.current = guard;
                }}
              />
            </>
          )}
        </Stack.Screen>
        <Stack.Screen
          name="Favorites"
          options={{
            ...stackScreenOptions(reduceMotion),
            header: () => overlayHeader(t('favorites.title')),
            title: t('favorites.title'),
          }}
        >
          {() => (
            <>
              <DismissSync onDismiss={syncDismiss} />
              <FavoritesScreen />
            </>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  immersiveContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  offersContent: {
    paddingHorizontal: 0,
  },
  createSlot: {
    alignItems: 'flex-end',
    position: 'absolute',
    right: 16,
  },
});
