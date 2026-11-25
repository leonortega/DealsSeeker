import { NativeModule, requireNativeModule } from 'expo';

export interface PlatformPosition {
  latitude: number;
  longitude: number;
}

interface DealsSeekerLocationModule extends NativeModule {
  getCurrentPositionAsync(timeoutMs: number): Promise<PlatformPosition>;
}

const module = requireNativeModule<DealsSeekerLocationModule>('DealsSeekerLocation');

export function getCurrentPositionAsync(timeoutMs: number): Promise<PlatformPosition> {
  return module.getCurrentPositionAsync(timeoutMs);
}
