import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../hooks/useApp';

interface AppMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function AppMenu({ visible, onClose }: AppMenuProps) {
  const { openFavorites, palette, preferences, setLanguage, setNavigationMode, setThemeMode, t } = useApp();

  const isDark = palette.mode === 'dark';

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: palette.overlay }]} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: palette.panel, borderColor: palette.border }]} onPress={() => {}}>
          <Text style={[styles.title, { color: palette.ink }]}>{t('nav.menu')}</Text>

          <Pressable style={[styles.quickLink, { backgroundColor: palette.card }]} onPress={() => {
            openFavorites();
            onClose();
          }}>
            <Text style={[styles.quickLinkLabel, { color: palette.ink }]}>{t('nav.favorites')}</Text>
          </Pressable>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.inkMuted }]}>{t('nav.language')}</Text>
            <View style={styles.row}>
              {(['en', 'es'] as const).map((language) => {
                const active = preferences.language === language;
                return (
                  <Pressable
                    key={language}
                    onPress={() => void setLanguage(language)}
                    style={[
                      styles.choice,
                      {
                        backgroundColor: active ? palette.accentMuted : palette.card,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text style={{ color: active ? palette.accent : palette.ink }}>{language.toUpperCase()}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.inkMuted }]}>{t('nav.theme')}</Text>
            <View style={styles.row}>
              <Pressable
                style={[styles.choiceWide, { backgroundColor: palette.card, borderColor: palette.border }]}
                onPress={() => void setThemeMode('system')}
              >
                <Text style={{ color: palette.ink }}>{t('nav.systemTheme')}</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.choice,
                  {
                    backgroundColor: isDark ? palette.accentMuted : palette.card,
                    borderColor: palette.border,
                  },
                ]}
                onPress={() => void setThemeMode(isDark ? 'light' : 'dark')}
              >
                <Text style={{ color: isDark ? palette.accent : palette.ink }}>
                  {isDark ? t('nav.darkTheme') : t('nav.lightTheme')}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: palette.inkMuted }]}>{t('nav.navigation')}</Text>
            <View style={styles.row}>
              {([
                ['pedestrian', t('nav.pedestrian')],
                ['car', t('nav.car')],
              ] as const).map(([mode, label]) => {
                const active = preferences.navigationMode === mode;
                return (
                  <Pressable
                    key={mode}
                    onPress={() => void setNavigationMode(mode)}
                    style={[
                      styles.choice,
                      {
                        backgroundColor: active ? palette.accentMuted : palette.card,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text style={{ color: active ? palette.accent : palette.ink }}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 72,
  },
  sheet: {
    alignSelf: 'stretch',
    borderRadius: 28,
    borderWidth: 1,
    gap: 18,
    padding: 20,
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '700',
  },
  quickLink: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  quickLinkLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choice: {
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 92,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  choiceWide: {
    borderRadius: 16,
    borderWidth: 1,
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
