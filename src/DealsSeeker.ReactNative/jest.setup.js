// Silence the React Native WebView / expo mocks noise in unit tests.
jest.setTimeout(10000);

// Screens read safe-area insets; tests render them without a SafeAreaProvider.
jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});
