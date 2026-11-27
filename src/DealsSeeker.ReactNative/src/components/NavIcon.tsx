import { PlatformTabIcon, type PlatformTabIconName } from './PlatformTabIcon';

export type NavIconName = PlatformTabIconName;

/** Backwards-compatible name for the single platform symbol vocabulary. */
export function NavIcon({ name, color, size = 18 }: { name: NavIconName; color: string; size?: number }) {
  return <PlatformTabIcon color={color} name={name} size={size} />;
}
