import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Palette } from '../utils/theme';

export type PresentationMode = 'feed' | 'map';

export interface PresentationModeSwitchProps {
  value: PresentationMode;
  feedLabel: string;
  mapLabel: string;
  onChange: (mode: PresentationMode) => void;
  palette: Palette;
}

export function PresentationModeSwitch({ feedLabel, mapLabel, onChange, palette, value }: PresentationModeSwitchProps) {
  const options: { key: PresentationMode; label: string }[] = [
    { key: 'feed', label: feedLabel },
    { key: 'map', label: mapLabel },
  ];

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.container, { backgroundColor: palette.panel, borderColor: palette.border }]}
    >
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <Pressable
            key={option.key}
            accessibilityLabel={option.label}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.key)}
            style={[styles.segment, { backgroundColor: selected ? palette.accent : palette.panel }]}
          >
            <Text style={[styles.label, { color: selected ? '#ffffff' : palette.ink }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 2,
    padding: 2,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 66,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
  },
});
