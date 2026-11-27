import type { RefObject } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { platformTouchFloor } from '../utils/layout';
import { landmarkFontFamily } from '../utils/typography';
import { useApp } from '../hooks/useApp';
import { restoreFocus } from '../utils/focusReturn';
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
  const { palette, t } = useApp();

  function close() {
    onDismiss();
    restoreFocus(returnFocusRef);
  }

  return (
    <NativeBottomSheet visible={visible} onClose={close}>
      <View
        accessibilityViewIsModal
        testID="first-run-sheet"
        style={[styles.sheet, { backgroundColor: palette.card, borderColor: palette.border }]}
      >
        <Text style={[styles.title, { color: palette.ink }]}>{t('onboarding.title')}</Text>
        <Text style={[styles.body, { color: palette.inkMuted }]}>{t('onboarding.body')}</Text>
        <Pressable
          accessibilityLabel={t('onboarding.gotIt')}
          accessibilityRole="button"
          onPress={close}
          style={[styles.action, { backgroundColor: palette.accent }]}
        >
          <Text style={[styles.actionLabel, { color: palette.onAccent }]}>{t('onboarding.gotIt')}</Text>
        </Pressable>
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
    fontFamily: landmarkFontFamily(),
    fontSize: 22,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
  },
  action: {
    alignItems: 'center',
    borderRadius: 28,
    justifyContent: 'center',
    minHeight: platformTouchFloor,
    paddingHorizontal: 20,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
});
