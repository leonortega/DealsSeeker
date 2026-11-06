// Stub for web platform where React Native's native ReactDevToolsSettingsManager
// (android/ios only) is unavailable. Keeps web dev bundling working.
export function setGlobalHookSettings() {}
export function getGlobalHookSettings() {
  return null;
}
module.exports = { setGlobalHookSettings, getGlobalHookSettings };