import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { platformTouchFloor } from '../utils/layout';
import { useApp } from '../hooks/useApp';
import { AVATAR_OPTIONS } from '../utils/avatars';

interface AvatarPickerProps {
  selectedAvatarId: string;
  onSelect: (avatarId: string) => void;
}

export function AvatarPicker({ selectedAvatarId, onSelect }: AvatarPickerProps) {
  const { t } = useApp();
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {AVATAR_OPTIONS.map((option) => {
        const active = option.avatarId === selectedAvatarId;
        return (
          <TouchableRipple
            key={option.avatarId}
            accessibilityLabel={`${t('settings.avatar')} ${option.avatarId}`}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(option.avatarId)}
            rippleColor={theme.colors.primary}
            style={[
              styles.option,
              {
                backgroundColor: active ? theme.colors.secondaryContainer : theme.colors.surface,
                borderColor: active ? theme.colors.primary : theme.colors.outline,
              },
            ]}
          >
            <Text variant="bodyLarge" style={styles.emoji}>
              {option.emoji}
            </Text>
          </TouchableRipple>
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
    height: platformTouchFloor,
    justifyContent: 'center',
    width: platformTouchFloor,
  },
  emoji: {
    fontSize: 22,
  },
});
