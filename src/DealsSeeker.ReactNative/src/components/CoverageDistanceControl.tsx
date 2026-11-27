import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Palette } from '../utils/theme';

export const COVERAGE_DISTANCE_OPTIONS = [500, 1000, 1500, 2500, 5000];

export function CoverageDistanceControl({
  radiusMeters,
  onChange,
  palette,
  t,
}: {
  radiusMeters: number;
  onChange: (radiusMeters: number) => void;
  palette: Palette;
  t: (key: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  function select(nextRadius: number) {
    onChange(nextRadius);
    setExpanded(false);
  }

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityLabel={`${t('offers.coverageDistance')}: ${radiusMeters} m`}
        accessibilityRole="button"
        onPress={() => setExpanded((current) => !current)}
        style={[styles.pill, { backgroundColor: palette.accentMuted, borderColor: palette.border }]}
        testID="coverage-distance-control"
      >
        <Text style={[styles.pillLabel, { color: palette.accentText }]}>
          {t('offers.distance')}: {radiusMeters} m
        </Text>
      </Pressable>
      {expanded ? (
        <View style={[styles.options, { backgroundColor: palette.card, borderColor: palette.border }]}>
          {COVERAGE_DISTANCE_OPTIONS.map((option) => {
            const selected = option === radiusMeters;
            return (
              <Pressable
                accessibilityLabel={`${option} m`}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={option}
                onPress={() => select(option)}
                style={[styles.option, { backgroundColor: selected ? palette.accentMuted : palette.panel }]}
              >
                <Text style={{ color: selected ? palette.accentText : palette.ink, fontWeight: '700' }}>
                  {option} m
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
    width: '100%',
  },
  pill: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  options: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 10,
  },
  option: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
