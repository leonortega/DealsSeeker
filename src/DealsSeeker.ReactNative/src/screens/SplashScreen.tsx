import { StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { useApp } from '../hooks/useApp';

export function SplashScreen() {
  const { t } = useApp();
  const theme = useTheme();

  return (
    <Surface
      elevation={0}
      style={[styles.root, { backgroundColor: theme.colors.surface }]}
      testID="splash-surface"
    >
      <Text
        accessibilityRole="header"
        style={{ color: theme.colors.onSurface }}
        testID="brand-mark"
        variant="displaySmall"
      >
        {t('app.title')}
      </Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
});
