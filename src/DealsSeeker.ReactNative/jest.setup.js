// Silence the React Native WebView / expo mocks noise in unit tests.
jest.setTimeout(10000);

// Screens read safe-area insets; tests render them without a SafeAreaProvider.
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, onPress, onRegionChangeComplete, initialRegion }) =>
      React.createElement(
        View,
        {
          testID: 'rn-map',
          onPress,
          onRegionChangeComplete,
          accessibilityLabel: initialRegion ? 'native-map-region' : undefined,
        },
        children
      ),
    Marker: ({ testID, title, onPress }) =>
      React.createElement(View, { testID, accessibilityLabel: title, onPress, accessible: true }),
    Circle: ({ testID, radius }) => React.createElement(View, { testID: testID ?? 'native-map-circle', accessibilityLabel: String(radius) }),
  };
});

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef(({ children, index, snapPoints, enablePanDownToClose, backgroundStyle, containerStyle, onClose }, ref) => {
      React.useImperativeHandle(ref, () => ({ expand() {}, close() {}, snapToIndex() {} }));
      if (index === -1) {
        return null;
      }
      return React.createElement(
        View,
        {
          testID: 'native-bottom-sheet',
          snapPoints,
          enablePanDownToClose,
          backgroundStyle,
          containerStyle,
          onClose,
        },
        children
      );
    }),
    BottomSheetView: ({ children }) => React.createElement(View, null, children),
    BottomSheetBackdrop: () => null,
  };
});

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});
