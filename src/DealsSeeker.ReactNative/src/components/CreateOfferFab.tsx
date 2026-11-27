import { Pressable, StyleSheet } from 'react-native';
import type { Palette } from '../utils/theme';
import { NavIcon } from './NavIcon';

export function CreateOfferFab({
  label,
  onPress,
  palette,
  visible = true,
}: {
  label: string;
  onPress: () => void;
  palette: Palette;
  visible?: boolean;
}) {
  if (!visible) {
    return null;
  }

  return (
    <Pressable
      android_ripple={{ color: palette.onAccent }}
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.fab, { backgroundColor: palette.accent, shadowColor: palette.shadow }]}
    >
      <NavIcon color={palette.onAccent} name="create" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    alignItems: 'center',
    borderRadius: 999,
    elevation: 8,
    height: 56,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    width: 56,
  },
});
