import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { OfferCommentDto, OfferItemDto } from '../api/types';
import { useApp } from '../hooks/useApp';
import { avatarEmoji } from '../utils/avatars';

interface OfferCommentsModalProps {
  offer: OfferItemDto | null;
  visible: boolean;
  onClose: () => void;
}

function formatCommentDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

export function OfferCommentsModal({ offer, visible, onClose }: OfferCommentsModalProps) {
  const { api, palette, t } = useApp();
  const [comments, setComments] = useState<OfferCommentDto[]>([]);
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    void (async () => {
      try {
        const response = await apiRef.current.getOfferComments(offerId);
        if (!cancelled) {
          setComments(response?.comments ?? []);
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
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: palette.overlay }]}>
        <View style={[styles.sheet, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.header}>
            <Text numberOfLines={2} style={[styles.title, { color: palette.ink }]}>
              {t('comments.title')}
            </Text>
            <Pressable hitSlop={8} onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.close, { color: palette.ink }]}>{t('offers.close')}</Text>
            </Pressable>
          </View>

          <Text style={[styles.offerName, { color: palette.inkMuted }]}>{offer.businessName}</Text>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={palette.accent} />
              <Text style={[styles.empty, { color: palette.inkMuted }]}>{t('comments.loading')}</Text>
            </View>
          ) : null}

          {comments.length === 0 && !loading ? (
            <Text style={[styles.empty, { color: palette.inkMuted }]}>{t('comments.empty')}</Text>
          ) : null}

          <FlatList
            data={comments}
            keyExtractor={(comment) => comment.commentId}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }: { item: OfferCommentDto }) => (
              <View style={[styles.comment, { backgroundColor: palette.panel, borderColor: palette.border }]}>
                <Text style={styles.avatar}>{avatarEmoji(item.avatarId)}</Text>
                <View style={styles.commentBody}>
                  <Text style={[styles.author, { color: palette.ink }]}>{item.displayName}</Text>
                  <Text style={[styles.meta, { color: palette.inkMuted }]}>{formatCommentDate(item.createdAtUtc)}</Text>
                  <Text style={[styles.commentText, { color: palette.ink }]}>{item.body}</Text>
                </View>
              </View>
            )}
          />

          <TextInput
            multiline
            onChangeText={setBody}
            placeholder={t('comments.placeholder')}
            placeholderTextColor={palette.inkMuted}
            style={[styles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
            value={body}
          />

          {status ? <Text style={[styles.status, { color: palette.danger }]}>{status}</Text> : null}

          <Pressable style={[styles.publishButton, { backgroundColor: palette.accent }]} onPress={() => void publish()}>
            <Text style={styles.publishLabel}>{t('comments.publish')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    gap: 12,
    maxHeight: '86%',
    padding: 20,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '700',
    marginRight: 12,
  },
  closeButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  close: {
    fontSize: 14,
    fontWeight: '700',
  },
  offerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    fontSize: 14,
    paddingVertical: 8,
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  list: {
    flexGrow: 0,
    maxHeight: 320,
  },
  listContent: {
    gap: 10,
    paddingVertical: 4,
  },
  comment: {
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  avatar: {
    fontSize: 22,
  },
  commentBody: {
    flex: 1,
    gap: 2,
  },
  author: {
    fontSize: 15,
    fontWeight: '800',
  },
  meta: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 15,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  status: {
    fontSize: 13,
    fontWeight: '700',
  },
  publishButton: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  publishLabel: {
    color: '#fff',
    fontWeight: '800',
    textAlign: 'center',
  },
});
