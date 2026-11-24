import type { RefObject } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../hooks/useApp';
import { restoreFocus } from '../utils/focusReturn';
import { NativeBottomSheet } from './NativeBottomSheet';

export const COVERAGE_DISTANCE_OPTIONS = [500, 1000, 1500, 2500, 5000];

export function ImmersiveSearchOverlay({
  visible,
  query,
  radiusMeters,
  onChangeQuery,
  onChangeRadius,
  onSearch,
  onClose,
  returnFocusRef,
}: {
  visible: boolean;
  query: string;
  radiusMeters: number;
  onChangeQuery: (query: string) => void;
  onChangeRadius: (radiusMeters: number) => void;
  onSearch: () => void;
  onClose: () => void;
  returnFocusRef?: RefObject<unknown>;
}) {
  const { palette, t } = useApp();

  function close() {
    onClose();
    restoreFocus(returnFocusRef);
  }

  return (
    <NativeBottomSheet visible={visible} onClose={close}>
        <View
          accessibilityViewIsModal
          style={[styles.sheet, { backgroundColor: palette.panel, borderColor: palette.border }]}
        >
          <Text style={[styles.title, { color: palette.ink }]}>{t('offers.searchOffers')}</Text>

          <TextInput
            accessibilityLabel={t('offers.searchPlaceholder')}
            onChangeText={onChangeQuery}
            onSubmitEditing={onSearch}
            placeholder={t('offers.searchPlaceholder')}
            placeholderTextColor={palette.inkMuted}
            returnKeyType="search"
            style={[styles.input, { backgroundColor: palette.card, borderColor: palette.border, color: palette.ink }]}
            value={query}
          />

          <Text style={[styles.sectionTitle, { color: palette.inkMuted }]}>{t('offers.coverageDistance')}</Text>
          <View style={styles.distanceRow}>
            {COVERAGE_DISTANCE_OPTIONS.map((option) => {
              const selected = option === radiusMeters;
              return (
                <Pressable
                  key={option}
                  accessibilityLabel={`${option} m`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => onChangeRadius(option)}
                  style={[
                    styles.distanceChip,
                    {
                      backgroundColor: selected ? palette.accent : palette.card,
                      borderColor: selected ? palette.accent : palette.border,
                    },
                  ]}
                >
                  <Text style={{ color: selected ? '#ffffff' : palette.ink, fontSize: 11, fontWeight: '700' }}>
                    {option} m
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={close}
              style={[styles.actionButton, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <Text style={{ color: palette.ink, fontWeight: '700' }}>{t('common.cancel')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onSearch}
              style={[styles.actionButton, { backgroundColor: palette.accent }]}
            >
              <Text style={{ color: '#ffffff', fontWeight: '800' }}>{t('common.search')}</Text>
            </Pressable>
          </View>
        </View>
    </NativeBottomSheet>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    maxWidth: 440,
    padding: 18,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  distanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  distanceChip: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
