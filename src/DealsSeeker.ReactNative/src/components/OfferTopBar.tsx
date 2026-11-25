import type { ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Palette } from '../utils/theme';
import { NavIcon } from './NavIcon';

export interface OfferTopBarProps {
  headerControl: ReactNode;
  helpControl: ReactNode;
  isNarrow: boolean;
  onSearch?: () => void;
  palette: Palette;
  searchLabel: string;
  surfaceColor?: string;
  title: string;
  titleColor: string;
}

export function OfferTopBar({
  headerControl,
  helpControl,
  isNarrow,
  onSearch,
  palette,
  searchLabel,
  surfaceColor,
  title,
  titleColor,
}: OfferTopBarProps) {
  return (
    <View
      pointerEvents="box-none"
      style={[styles.content, surfaceColor ? { backgroundColor: surfaceColor } : null]}
      testID="offer-top-bar"
    >
      <Image
        source={require('../../assets/brand/logo-icon.png')}
        style={[styles.logo, { backgroundColor: palette.panel }]}
        testID="brand-mark"
      />
      {isNarrow ? null : <Text style={[styles.title, { color: titleColor }]}>{title}</Text>}
      <View pointerEvents="box-none" style={styles.modeSlot}>{headerControl}</View>
      <View pointerEvents="box-none" style={styles.actions}>
        {onSearch ? (
          <Pressable
            accessibilityLabel={searchLabel}
            accessibilityRole="button"
            onPress={onSearch}
            style={[styles.iconButton, { backgroundColor: palette.panel, borderColor: palette.border }]}
          >
            <NavIcon color={palette.ink} name="search" size={20} />
          </Pressable>
        ) : (
          <View style={styles.searchSlot} />
        )}
        {helpControl}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logo: {
    borderRadius: 999,
    height: 40,
    resizeMode: 'contain',
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  modeSlot: {
    maxWidth: 360,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  searchSlot: {
    height: 44,
    width: 44,
  },
});
