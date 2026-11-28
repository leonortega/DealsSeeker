import { type RefObject, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Searchbar, Surface, Text } from 'react-native-paper';
import { useApp } from '../hooks/useApp';
import { announceStatus } from '../utils/announce';
import { platformTouchFloor } from '../utils/layout';
import { NativeBottomSheet } from './NativeBottomSheet';
import { PlatformTabIcon } from './PlatformTabIcon';
import { restoreFocus } from '../utils/focusReturn';

const TOPICS = [
  'help.find',
  'help.mode',
  'help.contribute',
  'help.report',
  'help.favorites',
] as const;

export type HelpTopic = (typeof TOPICS)[number];

export function HelpSheet({
  visible,
  onClose,
  returnFocusRef,
  topic,
}: {
  visible: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<unknown>;
  topic?: HelpTopic;
}) {
  const { t } = useApp();
  const [query, setQuery] = useState('');
  const orderedTopics: readonly HelpTopic[] = topic
    ? [topic, ...TOPICS.filter((item) => item !== topic)]
    : TOPICS;
  const term = query.trim().toLowerCase();
  const matches = (item: HelpTopic) =>
    `${t(`${item}.title`)} ${t(`${item}.body`)}`.toLowerCase().includes(term);
  const visibleTopics = term ? orderedTopics.filter(matches) : orderedTopics;

  useEffect(() => {
    if (!visible) {
      setQuery('');
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || !term) {
      return;
    }
    announceStatus(visibleTopics.length ? t(`${visibleTopics[0]}.title`) : t('help.noResults'));
  }, [query, visible, term, t, visibleTopics.length]);

  function close() {
    onClose();
    restoreFocus(returnFocusRef);
  }

  return (
    <NativeBottomSheet visible={visible} onClose={close}>
      <Surface
        accessibilityViewIsModal
        elevation={1}
        style={styles.sheet}
        testID="help-sheet"
      >
        <Text variant="headlineSmall">{t('help.title')}</Text>
        <Searchbar
          accessibilityLabel={t('help.searchPlaceholder')}
          icon={({ size, color }) => (
            <PlatformTabIcon color={color} name="search" size={size} />
          )}
          onChangeText={setQuery}
          placeholder={t('help.searchPlaceholder')}
          style={styles.search}
          testID="help-search"
          value={query}
        />
        {term && visibleTopics.length === 0 ? (
          <View style={styles.noResults}>
            <Text variant="bodyMedium" accessibilityLiveRegion="polite">
              {t('help.noResults')}
            </Text>
            <Button
              accessibilityLabel={t('help.clearSearch')}
              mode="text"
              onPress={() => setQuery('')}
              style={styles.clearAction}
              testID="help-clear-search"
            >
              {t('help.clearSearch')}
            </Button>
          </View>
        ) : null}
        <ScrollView style={styles.list}>
          {visibleTopics.map((item) => (
            <View key={item} style={styles.topic} testID="help-topic">
              <Text variant="titleMedium">{t(`${item}.title`)}</Text>
              <Text variant="bodyMedium">{t(`${item}.body`)}</Text>
            </View>
          ))}
        </ScrollView>
      </Surface>
    </NativeBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    gap: 12,
    padding: 20,
    width: '100%',
  },
  search: {
    marginBottom: 4,
  },
  noResults: {
    gap: 4,
    marginBottom: 8,
  },
  clearAction: {
    alignSelf: 'flex-start',
    minHeight: platformTouchFloor,
  },
  list: {
    flex: 1,
  },
  topic: {
    gap: 4,
    marginBottom: 14,
  },
});
