import { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  NavigationContainer,
  useNavigation,
  useNavigationContainerRef,
  useNavigationState,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { AppFooterBar } from '../components/AppFooterBar';
import { CreateOfferFab } from '../components/CreateOfferFab';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { NavIcon } from '../components/NavIcon';
import { useApp } from '../hooks/useApp';
import type { MainTab } from '../api/types';
import { AccountScreen } from '../screens/AccountScreen';
import { AddOfferScreen } from '../screens/AddOfferScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { OffersScreen } from '../screens/OffersScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { SuggestionsScreen } from '../screens/SuggestionsScreen';
import { modalScreenOptions, stackScreenOptions, tabScreenOptions } from './shellOptions';
import { MAIN_TAB_DESTINATIONS, resolveTabFromRoute } from './tabs';

export type RootStackParamList = {
  Main: undefined;
  AddOffer: { offerId?: string } | undefined;
  Favorites: undefined;
};

type MainTabParamList = Record<MainTab, undefined>;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function BrandedTabBar({ navigation }: BottomTabBarProps) {
  const { activeTab, openTab, t } = useApp();
  const routeName = useNavigationState((state) => String(state.routes[state.index]?.name ?? ''));
  const selectedTab = resolveTabFromRoute(routeName);

  useEffect(() => {
    if (selectedTab && selectedTab !== activeTab) {
      openTab(selectedTab);
    }
  }, [activeTab, openTab, selectedTab]);

  return (
    <AppFooterBar
      items={MAIN_TAB_DESTINATIONS.map((destination) => {
        const active = activeTab === destination.name;
        return {
          key: destination.name,
          icon: <NavIcon color={active ? '#f08f62' : '#c6d0c9'} name={destination.icon} />,
          label: t(destination.labelKey),
          onPress: () => {
            openTab(destination.name);
            navigation.navigate(destination.name);
          },
          active,
        };
      })}
    />
  );
}

function MainView() {
  const { activeTab, closeImmersiveOffers, immersiveOffers, openAddOffer, palette, t } = useApp();
  const navigation = useNavigation();
  const immersiveFeedVisible = immersiveOffers && activeTab === 'offers';

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
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <View style={[styles.content, immersiveFeedVisible && styles.immersiveContent]}>
        <Tabs.Navigator tabBar={BrandedTabBar} screenOptions={tabScreenOptions()}>
          <Tabs.Screen name="account" component={AccountScreen} />
          <Tabs.Screen name="suggestions" component={SuggestionsScreen} />
          <Tabs.Screen name="reports" component={ReportsScreen} />
          <Tabs.Screen name="offers" component={OffersScreen} />
        </Tabs.Navigator>
      </View>
      <CreateOfferFab label={t('nav.createOffer')} onPress={openAddOffer} palette={palette} />
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
  const { closeOverlay, overlayRoute } = useApp();
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
      <Stack.Navigator screenOptions={stackScreenOptions()}>
        <Stack.Screen name="Main" component={MainView} />
        <Stack.Screen name="AddOffer" options={modalScreenOptions(Platform.OS)}>
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
        <Stack.Screen name="Favorites" options={stackScreenOptions()}>
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
});
