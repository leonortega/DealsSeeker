// Ensure React Native installs its base globals before Expo boots.
require('react-native/Libraries/Core/InitializeCore');

// Delay Expo import until after the React Native globals are guaranteed.
const { registerRootComponent } = require('expo') as typeof import('expo');
const App = require('./App').default as typeof import('./App').default;

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
