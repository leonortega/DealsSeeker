import { type RefObject, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { OfferCommentDto, OfferItemDto } from '../api/types';
import { useApp } from '../hooks/useApp';
import { platformTouchFloor } from '../utils/layout';
import { restoreFocus } from '../utils/focusReturn';
import { NativeBottomSheet } from './NativeBottomSheet';
import { avatarEmoji } from '../utils/avatars';

const bodyMaxLength = 120;

interface OfferCommentsModalProps {
  offer: OfferItemDto | null;
  visible: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<unknown>;
}

function formatCommentDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

export function OfferCommentsModal({ offer, visible, onClose, returnFocusRef }: OfferCommentsModalProps) {
  const { api, t } = useApp();
  const theme = useTheme();

  function close() {
    onClose();
    restoreFocus(returnFocusRef);
  }
  const [comments, setComments] = useState<OfferCommentDto[]>([]);
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const apiRef = useRef(api);
  const tRef = useRef(t);
  apiRef.current = api;
  tRef.current = t;

  const offerId = offer?.offerId ?? null;

  useEffect(() => {
    if (!visible || !offerId) {
      return;
    }

    let cancelled = false;
    setBody('');
    setStatus(null);
    setLoading(true);
    setNextCursor(null);
    setHasMore(false);

    void (async () => {
      try {
        const response = await apiRef.current.getOfferComments(offerId);
        if (!cancelled) {
          setComments(response?.comments ?? []);
          setHasMore(Boolean(response?.hasMore));
          setNextCursor(response?.nextCursor ?? null);
        }
      } catch {
        if (!cancelled) {
          setStatus(tRef.current('comments.loadFailed'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, offerId]);

  async function loadMore() {
    if (!offerId || !nextCursor || loadingMore) {
      return;
    }

    setLoadingMore(true);

    try {
      const response = await apiRef.current.getOfferComments(offerId, undefined, nextCursor);
      setComments((current) => [...current, ...(response?.comments ?? [])]);
      setHasMore(Boolean(response?.hasMore));
      setNextCursor(response?.nextCursor ?? null);
    } catch {
      setStatus(tRef.current('comments.loadFailed'));
    } finally {
      setLoadingMore(false);
    }
  }

  async function publish() {
    if (!offerId) {
      return;
    }

    const trimmed = body.trim();
    if (trimmed.length === 0) {
      setStatus(tRef.current('comments.bodyRequired'));
      return;
    }

    setStatus(null);
    try {
      const created = await apiRef.current.createOfferComment(offerId, { body: trimmed });
      setComments((current) => [...current, created]);
      setBody('');
    } catch {
      setStatus(tRef.current('comments.publishFailed'));
    }
  }

  if (!offer) {
    return null;
  }

  return (
    <NativeBottomSheet visible={visible} onClose={close}>
      <View
        accessibilityViewIsModal
        style={[styles.sheet, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
      >
        <View style={styles.header}>
          <Text numberOfLines={2} style={styles.title} variant="headlineSmall">
            {t('comments.title')}
          </Text>
        </View>

        <Text style={{ color: theme.colors.onSurfaceVariant }} variant="titleSmall">
          {offer.businessName}
        </Text>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.empty} variant="bodyMedium">
              {t('comments.loading')}
            </Text>
          </View>
        ) : null}

        {comments.length === 0 && !loading ? (
          <Text style={styles.empty} variant="bodyMedium">
            {t('comments.empty')}
          </Text>
        ) : null}

        <FlatList
          data={comments}
          keyExtractor={(comment) => comment.commentId}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            hasMore ? (
              <Button
                accessibilityLabel={t('comments.loadMore')}
                accessibilityRole="button"
                loading={loadingMore}
                mode="text"
                onPress={() => void loadMore()}
                style={[styles.loadMoreButton, { borderColor: theme.colors.outline }]}
              >
                {t('comments.loadMore')}
              </Button>
            ) : undefined
          }
          renderItem={({ item }: { item: OfferCommentDto }) => (
            <View
              style={[
                styles.comment,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.outlineVariant,
                },
              ]}
            >
              <Avatar.Text label={avatarEmoji(item.avatarId)} size={40} style={styles.avatar} />
              <View style={styles.commentBody}>
                <Text variant="labelLarge">{item.displayName}</Text>
                <Text style={{ color: theme.colors.onSurfaceVariant }} variant="bodySmall">
                  {formatCommentDate(item.createdAtUtc)}
                </Text>
                <Text variant="bodyMedium">{item.body}</Text>
              </View>
            </View>
          )}
        />

        <TextInput
          label={t('comments.placeholder')}
          maxLength={bodyMaxLength}
          multiline
          onChangeText={(value) => setBody(value.slice(0, bodyMaxLength))}
          placeholder={t('comments.placeholder')}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          style={styles.input}
          testID="comments-input"
          value={body}
        />
        <HelperText style={styles.counter} testID="comments-counter" type="info">
          {`${body.length}/${bodyMaxLength}`}
        </HelperText>

        {status ? (
          <HelperText accessibilityLiveRegion="polite" testID="comments-status" type="error">
            {status}
          </HelperText>
        ) : null}

        <Button
          accessibilityLabel={t('comments.publish')}
          accessibilityRole="button"
          mode="contained"
          onPress={() => void publish()}
          style={[styles.publishButton, { backgroundColor: theme.colors.primary }]}
        >
          {t('comments.publish')}
        </Button>
      </View>
    </NativeBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    flex: 1,
    gap: 12,
    padding: 20,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    marginRight: 12,
  },
  empty: {
    paddingVertical: 8,
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 10,
    paddingVertical: 4,
  },
  loadMoreButton: {
    borderRadius: 12,
    borderWidth: 1,
    minHeight: platformTouchFloor,
  },
  comment: {
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  avatar: {
    alignSelf: 'center',
  },
  commentBody: {
    flex: 1,
    gap: 2,
  },
  input: {
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  counter: {
    textAlign: 'right',
  },
  publishButton: {
    borderRadius: 16,
    minHeight: platformTouchFloor,
  },
});
