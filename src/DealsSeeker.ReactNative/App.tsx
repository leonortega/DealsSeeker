import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppFooterBar } from './src/components/AppFooterBar';
import { LoadingOverlay } from './src/components/LoadingOverlay';
import { AppProvider } from './src/context/AppContext';
import { useApp } from './src/hooks/useApp';
import { AccountScreen } from './src/screens/AccountScreen';
import { AddOfferScreen } from './src/screens/AddOfferScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { OffersScreen } from './src/screens/OffersScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ReportsScreen } from './src/screens/ReportsScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { SuggestionsScreen } from './src/screens/SuggestionsScreen';

function AuthRoot() {
  const { authScreen, palette } = useApp();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
      {authScreen === 'register' ? <RegisterScreen /> : <LoginScreen />}
      <LoadingOverlay />
    </SafeAreaView>
  );
}

function AuthenticatedRoot() {
  const { activeTab, bootstrapped, closeImmersiveOffers, immersiveOffers, isAuthenticated, openAddOffer, openImmersiveOffers, openTab, overlayRoute, palette, t } = useApp();

  if (!bootstrapped) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return <AuthRoot />;
  }

  // The immersive feed is full-bleed; every other view keeps the standard content padding.
  const immersiveFeedVisible = immersiveOffers && !overlayRoute && activeTab === 'offers';

  function handleViewButton() {
    if (immersiveOffers) {
      closeImmersiveOffers();
      openTab('offers');
      return;
    }

    openImmersiveOffers();
    openTab('offers');
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
      <StatusBar style={palette.mode === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.screenContent, immersiveFeedVisible && styles.immersiveContent]}>
        {overlayRoute?.name === 'add-offer' ? <AddOfferScreen /> : null}
        {overlayRoute?.name === 'favorites' ? <FavoritesScreen /> : null}
        {!overlayRoute ? (
          <>
            <OffersScreen />
            <SuggestionsScreen />
            <ReportsScreen />
            <AccountScreen />
          </>
        ) : null}
      </View>

      {!immersiveFeedVisible ? (
        <AppFooterBar
          items={[
            { key: 'account', icon: '👤', label: t('nav.account'), onPress: () => openTab('account'), active: !overlayRoute && activeTab === 'account' },
            { key: 'suggestions', icon: '✏️', label: t('nav.suggestions'), onPress: () => openTab('suggestions'), active: !overlayRoute && activeTab === 'suggestions' },
            { key: 'create', icon: '➕', label: t('nav.createOffer'), onPress: () => openAddOffer(), active: overlayRoute?.name === 'add-offer' },
            { key: 'offers', icon: '💲', label: t('nav.offers'), onPress: () => openTab('offers'), active: !overlayRoute && activeTab === 'offers' },
            {
              key: 'view',
              icon: immersiveOffers ? '🗺️' : '⭐',
              label: immersiveOffers ? t('offers.mapMode') : t('offers.newView'),
              onPress: handleViewButton,
            },
          ]}
        />
      ) : null}
      <LoadingOverlay />
    </SafeAreaView>
  );
}

function AppRoot() {
  const { bootstrapped, isAuthenticated } = useApp();

  if (!bootstrapped) {
    return <SplashScreen />;
  }

  return isAuthenticated ? <AuthenticatedRoot /> : <AuthRoot />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppRoot />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  screenContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  immersiveContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
});
