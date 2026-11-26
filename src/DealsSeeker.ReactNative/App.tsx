import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BackNavigationHandler } from './src/components/BackNavigationHandler';
import { LoadingOverlay } from './src/components/LoadingOverlay';
import { AppProvider } from './src/context/AppContext';
import { useApp } from './src/hooks/useApp';
import { resolveShellChrome } from './src/utils/theme';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { SplashScreen } from './src/screens/SplashScreen';

function AppStatusBar() {
  const { immersiveOffers, palette } = useApp();
  const chrome = resolveShellChrome(immersiveOffers, palette);

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
  const { bootstrapped, isAuthenticated } = useApp();

  if (!bootstrapped) {
    return <SplashScreen />;
  }

  return isAuthenticated ? <AppNavigator /> : <AuthRoot />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppProvider>
          <AppStatusBar />
          <BackNavigationHandler />
          <AppRoot />
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
