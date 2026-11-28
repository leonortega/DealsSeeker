import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RadioButton, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { platformTouchFloor } from '../utils/layout';
import { formatDistanceMeters } from '../utils/format';
import type { Palette } from '../utils/theme';

export const COVERAGE_DISTANCE_OPTIONS = [500, 1000, 1500, 2500, 5000];

function formatPlainCoverage(radiusMeters: number) {
  if (radiusMeters < 1000) {
    return formatDistanceMeters(radiusMeters);
  }
  const kilometers = radiusMeters / 1000;
  return `${Number.isInteger(kilometers) ? kilometers : kilometers.toFixed(1)} km`;
}

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
  const theme = useTheme();

  function select(nextRadius: number) {
    onChange(nextRadius);
    setExpanded(false);
  }

  return (
    <View style={styles.wrapper}>
      <TouchableRipple
        accessibilityLabel={`${t('offers.coverageDistance')}: ${formatDistanceMeters(radiusMeters)}`}
        accessibilityRole="button"
        onPress={() => setExpanded((current) => !current)}
        rippleColor={theme.colors.primary}
        style={[styles.pill, { backgroundColor: palette.accentMuted, borderColor: palette.border }]}
        testID="coverage-distance-control"
      >
        <View style={styles.pillContent}>
          <Text variant="labelLarge" style={[styles.pillLabel, { color: palette.accentText }]}>
            {t('offers.coverageDistance')}: {formatDistanceMeters(radiusMeters)}
          </Text>
          <Text
            variant="labelMedium"
            style={[styles.plainLabel, { color: palette.accentText }]}
            testID="coverage-distance-plain"
          >
            {t('offers.coverage')} ≈ {formatPlainCoverage(radiusMeters)}
          </Text>
        </View>
      </TouchableRipple>
      {expanded ? (
        <RadioButton.Group onValueChange={(value) => select(Number(value))} value={String(radiusMeters)}>
          <View
            accessibilityLabel={t('offers.radius')}
            accessibilityRole="radiogroup"
            style={[styles.options, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            {COVERAGE_DISTANCE_OPTIONS.map((option) => {
              const selected = option === radiusMeters;
              return (
                <TouchableRipple
                  accessibilityLabel={`${option} m`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  key={option}
                  onPress={() => select(option)}
                  rippleColor={theme.colors.primary}
                  style={[styles.option, { backgroundColor: selected ? palette.accentMuted : palette.panel }]}
                >
                  <View style={styles.optionContent}>
                    <View importantForAccessibility="no-hide-descendants" pointerEvents="none">
                      <RadioButton.Android
                        color={theme.colors.primary}
                        onPress={() => select(option)}
                        status={selected ? 'checked' : 'unchecked'}
                        value={String(option)}
                      />
                    </View>
                    <Text
                      variant="labelLarge"
                      style={{ color: selected ? palette.accentText : palette.ink, fontWeight: '700' }}
                    >
                      {option} m
                    </Text>
                  </View>
                </TouchableRipple>
              );
            })}
          </View>
        </RadioButton.Group>
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
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: platformTouchFloor,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pillContent: {
    alignItems: 'center',
    gap: 2,
    justifyContent: 'center',
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  plainLabel: {
    fontSize: 12,
    fontWeight: '700',
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
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: platformTouchFloor,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
