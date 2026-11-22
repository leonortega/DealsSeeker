import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppFooterBar } from './src/components/AppFooterBar';
import { CreateOfferFab } from './src/components/CreateOfferFab';
import { LoadingOverlay } from './src/components/LoadingOverlay';
import { NavIcon, type NavIconName } from './src/components/NavIcon';
import { resolveShellChrome } from './src/utils/theme';
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
  const { activeTab, bootstrapped, immersiveOffers, isAuthenticated, openAddOffer, openTab, overlayRoute, palette, t } = useApp();

  if (!bootstrapped) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return <AuthRoot />;
  }

  // The immersive feed is full-bleed; every other view keeps the standard content padding.
  const immersiveFeedVisible = immersiveOffers && !overlayRoute && activeTab === 'offers';
  const shellChrome = resolveShellChrome(immersiveFeedVisible, palette);

  function footerItem(key: string, icon: NavIconName, label: string, tab: 'account' | 'suggestions' | 'reports' | 'offers') {
    const active = !overlayRoute && activeTab === tab;
    return {
      key,
      icon: <NavIcon color={active ? '#f08f62' : '#c6d0c9'} name={icon} />,
      label,
      onPress: () => openTab(tab),
      active,
    };
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: shellChrome.background }]}>
      <StatusBar style={shellChrome.statusBarStyle} />
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

      <AppFooterBar
        items={[
          footerItem('account', 'account', t('nav.account'), 'account'),
          footerItem('suggestions', 'suggestions', t('nav.suggestions'), 'suggestions'),
          footerItem('reports', 'reports', t('nav.reports'), 'reports'),
          footerItem('offers', 'offers', t('nav.offers'), 'offers'),
        ]}
      />
      {!overlayRoute ? (
        <CreateOfferFab label={t('nav.createOffer')} onPress={openAddOffer} palette={palette} />
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
