export interface AvatarOption {
  avatarId: string;
  emoji: string;
}

export const DEFAULT_AVATAR_ID = 'smile';

export const AVATAR_OPTIONS: readonly AvatarOption[] = [
  { avatarId: 'smile', emoji: '🙂' },
  { avatarId: 'cat', emoji: '🐱' },
  { avatarId: 'dog', emoji: '🐶' },
  { avatarId: 'fox', emoji: '🦊' },
  { avatarId: 'panda', emoji: '🐼' },
  { avatarId: 'rocket', emoji: '🚀' },
  { avatarId: 'star', emoji: '⭐' },
  { avatarId: 'robot', emoji: '🤖' },
  { avatarId: 'alien', emoji: '👽' },
  { avatarId: 'ghost', emoji: '👻' },
];

export function avatarEmoji(avatarId?: string | null): string {
  const match = AVATAR_OPTIONS.find((option) => option.avatarId === avatarId);
  return match ? match.emoji : AVATAR_OPTIONS[0].emoji;
}
