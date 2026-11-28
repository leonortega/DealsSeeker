import React from 'react';
import { render } from '@testing-library/react-native';
import { Text as PaperText, TouchableRipple } from 'react-native-paper';
import { AvatarPicker } from '../../../src/DealsSeeker.ReactNative/src/components/AvatarPicker';
import {
  AVATAR_OPTIONS,
  DEFAULT_AVATAR_ID,
  avatarEmoji,
} from '../../../src/DealsSeeker.ReactNative/src/utils/avatars';

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    palette: {
      accent: '#b85c38',
      accentMuted: '#e9c9b8',
      border: '#d7c9b5',
      card: '#fffdf8',
    },
    t: (key: string) => key,
  }),
}));

function hasComponent(node: any, component: unknown): boolean {
  const visit = (fiber: any): boolean => {
    if (!fiber) {
      return false;
    }
    if (fiber.type === component) {
      return true;
    }
    return visit(fiber.child) || visit(fiber.sibling);
  };
  let top = node.unstable_fiber;
  while (top?.return) {
    top = top.return;
  }
  return visit(top);
}

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

  it('renders avatar options with Material 3 ripple and text primitives', async () => {
    const view = await render(
      React.createElement(AvatarPicker, {
        onSelect: jest.fn(),
        selectedAvatarId: AVATAR_OPTIONS[0].avatarId,
      })
    );
    expect(hasComponent(view.root, TouchableRipple)).toBe(true);
    expect(hasComponent(view.root, PaperText)).toBe(true);
  });
});
