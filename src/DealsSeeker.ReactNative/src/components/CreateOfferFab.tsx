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
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.fab, { backgroundColor: palette.accent, shadowColor: palette.shadow }]}
    >
      <NavIcon color="#ffffff" name="create" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    alignItems: 'center',
    bottom: 96,
    borderRadius: 999,
    elevation: 3,
    height: 56,
    justifyContent: 'center',
    left: '50%',
    marginLeft: -28,
    position: 'absolute',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    width: 56,
  },
});
