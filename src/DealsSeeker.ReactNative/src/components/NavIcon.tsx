import { Circle, Path, Svg } from 'react-native-svg';
import { decorativeProps } from '../utils/decorativeProps';

export type NavIconName = 'account' | 'suggestions' | 'reports' | 'offers' | 'create' | 'search' | 'help';

function IconShape({ name }: { name: NavIconName }) {
  if (name === 'account') {
    return (
      <>
        <Circle cx="12" cy="8" r="3.2" />
        <Path d="M5.5 19c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      </>
    );
  }

  if (name === 'suggestions') {
    return (
      <>
        <Path d="M4 20l4.2-1 10-10a2.1 2.1 0 0 0-3-3L5.2 16 4 20z" />
        <Path d="M14.5 6.5l3 3" />
      </>
    );
  }

  if (name === 'reports') {
    return (
      <>
        <Path d="M6 21V4" />
        <Path d="M6 5h10l-2 3.5L16 12H6" />
      </>
    );
  }

  if (name === 'offers') {
    return (
      <>
        <Path d="M12 21s6.5-6.1 6.5-11a6.5 6.5 0 1 0-13 0C5.5 14.9 12 21 12 21z" />
        <Circle cx="12" cy="10" r="2.2" />
      </>
    );
  }

  if (name === 'create') {
    return (
      <>
        <Circle cx="12" cy="12" r="8.5" />
        <Path d="M12 8v8M8 12h8" />
      </>
    );
  }

  if (name === 'search') {
    return (
      <>
        <Circle cx="11" cy="11" r="6.5" />
        <Path d="M16 16l4.5 4.5" />
      </>
    );
  }

  return (
    <>
      <Circle cx="12" cy="12" r="8.5" />
      <Path d="M9.6 9.3a2.6 2.6 0 1 1 4.1 2.1c-.9.7-1.7 1.2-1.7 2.6" />
      <Path d="M12 17.4h.01" />
    </>
  );
}

export function NavIcon({ name, color, size = 18 }: { name: NavIconName; color: string; size?: number }) {
  return (
    <Svg
      {...decorativeProps}
      color={color}
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      width={size}
    >
      <IconShape name={name} />
    </Svg>
  );
}
