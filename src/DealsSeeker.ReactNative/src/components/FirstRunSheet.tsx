import type { RefObject } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { platformTouchFloor } from '../utils/layout';
import { useApp } from '../hooks/useApp';
import { restoreFocus } from '../utils/focusReturn';
import { materialTypeScale } from '../utils/theme';
import { NativeBottomSheet } from './NativeBottomSheet';

export function FirstRunSheet({
  visible,
  onDismiss,
  returnFocusRef,
}: {
  visible: boolean;
  onDismiss: () => void;
  returnFocusRef?: RefObject<unknown>;
}) {
  const { t } = useApp();
  const theme = useTheme();

  function close() {
    onDismiss();
    restoreFocus(returnFocusRef);
  }

  return (
    <NativeBottomSheet visible={visible} onClose={close}>
      <View
        accessibilityViewIsModal
        testID="first-run-sheet"
        style={[styles.sheet, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
      >
        <Text variant="headlineSmall" style={styles.title}>
          {t('onboarding.title')}
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.body, { color: theme.colors.onSurfaceVariant }]}
        >
          {t('onboarding.body')}
        </Text>
        <Button
          accessibilityLabel={t('onboarding.gotIt')}
          accessibilityRole="button"
          buttonColor={theme.colors.primary}
          labelStyle={styles.actionLabel}
          mode="contained"
          onPress={close}
          style={styles.action}
          testID="first-run-action"
          textColor={theme.colors.onPrimary}
        >
          {t('onboarding.gotIt')}
        </Button>
      </View>
    </NativeBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    maxWidth: 420,
    padding: 20,
    width: '100%',
  },
  title: {
    ...materialTypeScale.headlineSmall,
  },
  body: {
    ...materialTypeScale.bodyMedium,
  },
  action: {
    alignItems: 'center',
    borderRadius: 28,
    justifyContent: 'center',
    minHeight: platformTouchFloor,
    minWidth: platformTouchFloor,
    paddingHorizontal: 20,
  },
  actionLabel: {
    ...materialTypeScale.labelLarge,
  },
});
