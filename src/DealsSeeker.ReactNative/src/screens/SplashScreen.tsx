import { Image, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../hooks/useApp';

export function SplashScreen() {
  const { palette, t } = useApp();

  return (
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <View style={[styles.mark, { backgroundColor: palette.accentMuted, borderColor: palette.border }]}>
        <Image
          source={require('../../assets/brand/logo-icon.png')}
          style={styles.markImage}
          testID="brand-mark"
        />
      </View>
      <Text style={[styles.title, { color: palette.ink }]}>{t('app.title')}</Text>
      <Text style={[styles.subtitle, { color: palette.inkMuted }]}>{t('app.subtitle')}</Text>
      <Text style={[styles.cta, { color: palette.accentText }]}>{t('splash.cta')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  mark: {
    alignItems: 'center',
    borderRadius: 36,
    borderWidth: 1,
    height: 112,
    justifyContent: 'center',
    marginBottom: 18,
    width: 112,
  },
  markImage: {
    height: 72,
    resizeMode: 'contain',
    width: 72,
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 34,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  cta: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 22,
    textTransform: 'uppercase',
  },
});
