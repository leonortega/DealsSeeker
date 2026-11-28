import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BackNavigationHandler } from './src/components/BackNavigationHandler';
import { LoadingOverlay } from './src/components/LoadingOverlay';
import { AppProvider } from './src/context/AppContext';
import { useMemo, type ReactNode } from 'react';
import { PaperProvider } from 'react-native-paper';
import { useApp } from './src/hooks/useApp';
import { resolvePaperTheme, resolveRouteChrome } from './src/utils/theme';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { SplashScreen } from './src/screens/SplashScreen';

function AppStatusBar() {
  const { activeTab, bootstrapped, guestMode, immersiveOffers, isAuthenticated, palette } = useApp();
  const surface =
    !bootstrapped
      ? 'splash'
      : !isAuthenticated && !guestMode
        ? 'auth'
        : immersiveOffers && activeTab === 'offers'
          ? 'immersive'
          : 'standard';
  const chrome = resolveRouteChrome(surface, palette);

  const barStyle = chrome.statusBarStyle === 'light' ? 'light-content' : 'dark-content';

  return <StatusBar barStyle={barStyle} />;
}

function AuthRoot() {
  const { authScreen, palette } = useApp();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]}>
      {authScreen === 'register' ? <RegisterScreen /> : <LoginScreen />}
      <LoadingOverlay />
    </SafeAreaView>
  );
}

function AppRoot() {
  const { bootstrapped, guestMode, isAuthenticated } = useApp();

  if (!bootstrapped) {
    return <SplashScreen />;
  }

  return isAuthenticated || guestMode ? <AppNavigator /> : <AuthRoot />;
}


/** Bridges the authored palette worlds into React Native Paper's MD3 theme. */
function AppPaperProvider({ children }: { children: ReactNode }) {
  const { preferences } = useApp();
  const systemScheme = useColorScheme();
  const theme = useMemo(
    () => resolvePaperTheme(preferences.themeMode, systemScheme, preferences.themeWorld),
    [preferences.themeMode, preferences.themeWorld, systemScheme]
  );
  return <PaperProvider theme={theme}>{children}</PaperProvider>;
}
export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppProvider>
          <AppPaperProvider>
            <AppStatusBar />
            <BackNavigationHandler />
            <AppRoot />
          </AppPaperProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
