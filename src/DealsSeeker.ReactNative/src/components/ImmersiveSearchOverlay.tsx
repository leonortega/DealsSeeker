import { keyboardAvoidanceBehavior, platformTouchFloor } from '../utils/layout';
import type { RefObject } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useApp } from '../hooks/useApp';
import { CoverageDistanceControl } from './CoverageDistanceControl';
import { restoreFocus } from '../utils/focusReturn';
import { NativeBottomSheet } from './NativeBottomSheet';

const queryMaxLength = 200;

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
      <KeyboardAvoidingView
        behavior={keyboardAvoidanceBehavior(Platform.OS)}
        style={styles.keyboardView}
        testID="immersive-search-keyboard-view"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          testID="immersive-search-scroll"
        >
          <View
            accessibilityViewIsModal
            style={[styles.sheet, { backgroundColor: palette.panel, borderColor: palette.border }]}
          >
            <Text style={[styles.title, { color: palette.ink }]}>{t('offers.searchOffers')}</Text>

            <TextInput
              accessibilityLabel={t('offers.searchPlaceholder')}
              maxLength={queryMaxLength}
              onChangeText={onChangeQuery}
              onSubmitEditing={onSearch}
              placeholder={t('offers.searchPlaceholder')}
              placeholderTextColor={palette.inkMuted}
              returnKeyType="search"
              style={[styles.input, { backgroundColor: palette.card, borderColor: palette.border, color: palette.ink }]}
              value={query}
            />

            <CoverageDistanceControl
              onChange={onChangeRadius}
              palette={palette}
              radiusMeters={radiusMeters}
              t={t}
            />

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
                <Text style={{ color: palette.onAccent, fontWeight: '800' }}>{t('common.search')}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </NativeBottomSheet>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
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
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    minHeight: platformTouchFloor,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
