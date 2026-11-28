import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { platformTouchFloor } from '../utils/layout';
import type { Palette } from '../utils/theme';

export type PresentationMode = 'feed' | 'map';

export interface PresentationModeSwitchProps {
  value: PresentationMode;
  feedLabel: string;
  mapLabel: string;
  onChange: (mode: PresentationMode) => void;
  palette: Palette;
}

export function PresentationModeSwitch({ feedLabel, mapLabel, onChange, value }: PresentationModeSwitchProps) {
  const theme = useTheme();
  const options: { key: PresentationMode; label: string }[] = [
    { key: 'feed', label: feedLabel },
    { key: 'map', label: mapLabel },
  ];

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
    >
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <TouchableRipple
            accessibilityLabel={option.label}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={option.key}
            onPress={() => onChange(option.key)}
            rippleColor={theme.colors.primary}
            style={[
              styles.segment,
              { backgroundColor: selected ? theme.colors.secondaryContainer : theme.colors.surface },
            ]}
          >
            <Text
              style={{ color: selected ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant }}
              variant="labelLarge"
            >
              {option.label}
            </Text>
          </TouchableRipple>
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
    flexShrink: 1,
    justifyContent: 'center',
    minHeight: platformTouchFloor,
    minWidth: 66,
    paddingHorizontal: 12,
  },
});
