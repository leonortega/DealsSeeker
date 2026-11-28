import { keyboardAvoidanceBehavior, platformTouchFloor } from '../utils/layout';
import type { RefObject } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
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
  const theme = useTheme();

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
            style={[styles.sheet, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
          >
            <Text style={{ color: theme.colors.onSurface }} variant="titleLarge">
              {t('offers.searchOffers')}
            </Text>

            <TextInput
              accessibilityLabel={t('offers.searchPlaceholder')}
              contentStyle={styles.input}
              label={t('offers.searchPlaceholder')}
              maxLength={queryMaxLength}
              onChangeText={onChangeQuery}
              onSubmitEditing={onSearch}
              placeholder={t('offers.searchPlaceholder')}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              returnKeyType="search"
              testID="immersive-search-input"
              value={query}
            />

            <CoverageDistanceControl
              onChange={onChangeRadius}
              palette={palette}
              radiusMeters={radiusMeters}
              t={t}
            />

            <View style={styles.actions}>
              <Button
                accessibilityLabel={t('common.cancel')}
                accessibilityRole="button"
                mode="outlined"
                onPress={close}
                style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
              >
                {t('common.cancel')}
              </Button>
              <Button
                accessibilityLabel={t('common.search')}
                accessibilityRole="button"
                mode="contained"
                onPress={onSearch}
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              >
                {t('common.search')}
              </Button>
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
    minHeight: platformTouchFloor,
  },
});
