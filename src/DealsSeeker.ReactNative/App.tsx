import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppMenu } from './src/components/AppMenu';
import { BottomTabs } from './src/components/BottomTabs';
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
  const { activeTab, bootstrapped, isAuthenticated, overlayRoute, palette, t } = useApp();
  const [menuVisible, setMenuVisible] = useState(false);

  if (!bootstrapped) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return <AuthRoot />;
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
      <StatusBar style={palette.mode === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.header, { backgroundColor: palette.backgroundRaised, borderBottomColor: palette.border }]}>
        <View>
          <Text style={[styles.brand, { color: palette.ink }]}>{t('app.title')}</Text>
          <Text style={{ color: palette.inkMuted }}>
            {overlayRoute?.name === 'add-offer'
              ? t('nav.addOffer')
              : overlayRoute?.name === 'favorites'
                ? t('nav.favorites')
                : activeTab === 'account'
                  ? t('nav.account')
                  : activeTab === 'suggestions'
                    ? t('nav.suggestions')
                    : activeTab === 'reports'
                      ? t('nav.reports')
                      : t('nav.offers')}
          </Text>
        </View>
        <Pressable style={[styles.menuButton, { backgroundColor: palette.panel }]} onPress={() => setMenuVisible(true)}>
          <Text style={{ color: palette.ink, fontWeight: '800' }}>{t('nav.menu')}</Text>
        </Pressable>
      </View>

      <View style={styles.screenContent}>
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

      {!overlayRoute ? <BottomTabs /> : null}
      <AppMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
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
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  brand: {
    fontFamily: 'Georgia',
    fontSize: 28,
    fontWeight: '700',
  },
  menuButton: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  screenContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
