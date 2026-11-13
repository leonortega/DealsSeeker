import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../hooks/useApp';
import { AVATAR_OPTIONS } from '../utils/avatars';

interface AvatarPickerProps {
  selectedAvatarId: string;
  onSelect: (avatarId: string) => void;
}

export function AvatarPicker({ selectedAvatarId, onSelect }: AvatarPickerProps) {
  const { palette, t } = useApp();

  return (
    <View style={styles.row}>
      {AVATAR_OPTIONS.map((option) => {
        const active = option.avatarId === selectedAvatarId;
        return (
          <Pressable
            key={option.avatarId}
            accessibilityLabel={`${t('settings.avatar')} ${option.avatarId}`}
            accessibilityRole="button"
            onPress={() => onSelect(option.avatarId)}
            style={[
              styles.option,
              {
                backgroundColor: active ? palette.accentMuted : palette.card,
                borderColor: active ? palette.accent : palette.border,
              },
            ]}
          >
            <Text style={styles.emoji}>{option.emoji}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  emoji: {
    fontSize: 22,
  },
});
