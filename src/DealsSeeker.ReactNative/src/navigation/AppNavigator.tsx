import { useEffect, useRef, type ComponentRef } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer, useNavigation, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CreateOfferFab } from '../components/CreateOfferFab';
import { footerBarAppearance } from '../components/AppFooterBar';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { PlatformTabIcon, type PlatformTabIconName } from '../components/PlatformTabIcon';
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

function MainView() {
  const {
    activeTab,
    closeImmersiveOffers,
    immersiveOffers,
    openAddOffer,
    openTab,
    overlayRoute,
    palette,
    t,
  } = useApp();
  const { sheetCount } = useAppStatus();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const footer = footerBarAppearance(palette);
  const navigation = useNavigation();
  const containerRef = useRef<ComponentRef<typeof View>>(null);
  useDestinationFocus(containerRef, activeTab, overlayRoute, t);
  const immersiveFeedVisible = immersiveOffers && activeTab === 'offers';

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
      style={[styles.root, { backgroundColor: palette.background, paddingTop: insets.top }]}
    >
      <View
        style={[
          styles.content,
          activeTab === 'offers' && styles.offersContent,
          immersiveFeedVisible && styles.immersiveContent,
        ]}
      >
        <Tabs.Navigator
          initialRouteName="offers"
          screenOptions={{
            ...tabScreenOptions(),
            tabBarPosition: resolveTabBarPosition(width),
            tabBarStyle: {
              backgroundColor: footer.backgroundColor,
              borderColor: footer.borderColor,
            },
            tabBarActiveTintColor: footer.activeTintColor,
            tabBarInactiveTintColor: footer.inactiveTintColor,
            headerStyle: { backgroundColor: palette.background },
            headerTintColor: palette.ink,
          }}
        >
          {MAIN_TAB_DESTINATIONS.map((destination) => (
            <Tabs.Screen
              key={destination.name}
              listeners={{ tabPress: () => openTab(destination.name) }}
              name={destination.name}
              component={destination.name === 'account' ? AccountScreen : destination.name === 'suggestions' ? SuggestionsScreen : OffersScreen}
              options={{
                title: t(destination.labelKey),
                tabBarLabel: t(destination.labelKey),
                tabBarIcon: ({ color, size }) => (
                  <PlatformTabIcon color={color} name={destination.name as PlatformTabIconName} size={size} />
                ),
                headerShown: destination.name === 'offers' ? !immersiveFeedVisible : undefined,
              }}
            />
          ))}
        </Tabs.Navigator>
      </View>
      {sheetCount === 0 ? (
        <View style={[styles.createSlot, { bottom: insets.bottom + 76 }]}>
          <CreateOfferFab label={t('nav.createOffer')} onPress={() => openAddOffer()} palette={palette} />
        </View>
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
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const lastOverlay = useRef<string | null>(null);
  const dismissGuard = useRef<() => boolean>(() => true);

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
          options={{ ...modalScreenOptions(Platform.OS, reduceMotion), title: t('add.title') }}
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
          options={{ ...stackScreenOptions(reduceMotion), title: t('favorites.title') }}
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
