import { Image, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../hooks/useApp';

export function SplashScreen() {
  const { palette, t } = useApp();

  return (
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <Image
        source={require('../../assets/brand/logo-stacked.png')}
        style={styles.brandLogo}
        testID="brand-mark"
      />
      <Text style={[styles.subtitle, { color: '#000000' }]}>{t('app.subtitle')}</Text>
      <Text style={[styles.cta, { color: '#000000' }]}>{t('splash.cta')}</Text>
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
  brandLogo: {
    height: 152,
    marginBottom: 18,
    resizeMode: 'contain',
    width: 240,
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
