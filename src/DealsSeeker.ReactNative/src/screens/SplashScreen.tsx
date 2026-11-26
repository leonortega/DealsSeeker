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
});
