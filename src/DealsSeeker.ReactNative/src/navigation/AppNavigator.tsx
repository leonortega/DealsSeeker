import { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AppFooterBar, type FooterItem } from '../components/AppFooterBar';
import { CreateOfferFab } from '../components/CreateOfferFab';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { NavIcon, type NavIconName } from '../components/NavIcon';
import { useApp } from '../hooks/useApp';
import { AccountScreen } from '../screens/AccountScreen';
import { AddOfferScreen } from '../screens/AddOfferScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { OffersScreen } from '../screens/OffersScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { SuggestionsScreen } from '../screens/SuggestionsScreen';
import { modalScreenOptions, stackScreenOptions } from './shellOptions';

export type RootStackParamList = {
  Main: undefined;
  AddOffer: { offerId?: string } | undefined;
  Favorites: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function MainView() {
  const { activeTab, closeImmersiveOffers, immersiveOffers, openAddOffer, openTab, palette, t } = useApp();
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

  function footerItem(key: string, icon: NavIconName, label: string, tab: 'account' | 'suggestions' | 'reports' | 'offers'): FooterItem {
    const active = activeTab === tab;
    return {
      key,
      icon: <NavIcon color={active ? '#f08f62' : '#c6d0c9'} name={icon} />,
      label,
      onPress: () => openTab(tab),
      active,
    };
  }

  return (
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <View style={[styles.content, immersiveFeedVisible && styles.immersiveContent]}>
        <OffersScreen />
        <SuggestionsScreen />
        <ReportsScreen />
        <AccountScreen />
      </View>
      <AppFooterBar
        items={[
          footerItem('account', 'account', t('nav.account'), 'account'),
          footerItem('suggestions', 'suggestions', t('nav.suggestions'), 'suggestions'),
          footerItem('reports', 'reports', t('nav.reports'), 'reports'),
          footerItem('offers', 'offers', t('nav.offers'), 'offers'),
        ]}
      />
      <CreateOfferFab label={t('nav.createOffer')} onPress={openAddOffer} palette={palette} />
      <LoadingOverlay />
    </View>
  );
}

function DismissSync({ onDismiss }: { onDismiss: () => void }) {
  const navigation = useNavigation();
  const handled = useRef(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (handled.current) {
        return;
      }
      handled.current = true;
      onDismiss();
    });
    return unsubscribe;
  }, [navigation, onDismiss]);

  return null;
}

export function AppNavigator() {
  const { closeOverlay, overlayRoute } = useApp();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const lastOverlay = useRef<string | null>(null);

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
              <DismissSync onDismiss={syncDismiss} />
              <AddOfferScreen />
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
