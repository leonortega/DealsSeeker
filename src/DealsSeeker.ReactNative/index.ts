import { registerRootComponent } from 'expo';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import App from './App';

// @gorhom/bottom-sheet passes web-only dependency arrays to Reanimated hooks.
// On native those arrays are intentionally ignored, so keep errors but drop the
// warning noise. Remove this once the library stops passing them.
configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

registerRootComponent(App);