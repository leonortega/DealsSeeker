import {
  AVATAR_OPTIONS,
  DEFAULT_AVATAR_ID,
  avatarEmoji,
} from '../../../src/DealsSeeker.ReactNative/src/utils/avatars';

describe('avatar utilities', () => {
  it('exposes ten unique avatars including the default', () => {
    expect(AVATAR_OPTIONS).toHaveLength(10);
    expect(AVATAR_OPTIONS[0].avatarId).toBe(DEFAULT_AVATAR_ID);
    expect(new Set(AVATAR_OPTIONS.map((option) => option.avatarId)).size).toBe(10);
  });

  it('returns the emoji of a known avatar', () => {
    expect(avatarEmoji('cat')).toBe('🐱');
  });

  it.each([undefined, null, '', 'unknown'])(
    'falls back to the default emoji for %p',
    (avatarId) => {
      expect(avatarEmoji(avatarId)).toBe(AVATAR_OPTIONS[0].emoji);
    }
  );
});
