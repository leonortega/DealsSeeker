import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';
import { CreateOfferFab } from '../../../src/DealsSeeker.ReactNative/src/components/CreateOfferFab';
import type { Palette } from '../../../src/DealsSeeker.ReactNative/src/utils/theme';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const glyph = (prefix: string) => ({ name, ...props }: { name: string }) =>
    React.createElement(Text, { ...props, testID: `${prefix}-${name}` });
  return { Ionicons: glyph('ionicon'), MaterialIcons: glyph('materialicon') };
});

const palette = { accent: '#b85c38', onAccent: '#ffffff', shadow: 'rgba(0, 0, 0, 0.3)' } as Palette;

function setPlatform(os: 'ios' | 'android') {
  (Platform as unknown as { OS: string }).OS = os;
}

function glyph(id: string) {
  return screen.getByTestId(id, { includeHiddenElements: true });
}

describe('CreateOfferFab', () => {
  beforeEach(() => setPlatform('ios'));

  it('opens Add Offer when pressed', async () => {
    const onPress = jest.fn();
    await render(<CreateOfferFab label="Create" onPress={onPress} palette={palette} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Create' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is not rendered while an overlay sheet is open', async () => {
    await render(<CreateOfferFab label="Create" onPress={jest.fn()} palette={palette} visible={false} />);

    expect(screen.queryByRole('button', { name: 'Create' })).toBeNull();
  });

  it('uses a docked slot instead of floating over content', async () => {
    await render(<CreateOfferFab label="Create" onPress={jest.fn()} palette={palette} />);

    const style = StyleSheet.flatten(screen.getByRole('button', { name: 'Create' }).props.style);
    expect(style.position).toBeUndefined();
    expect(style.left).toBeUndefined();
    expect(style.bottom).toBeUndefined();
    expect(style.width).toBe(56);
    expect(style.height).toBe(56);
  });

  it('uses the platform create symbol on iOS', async () => {
    await render(<CreateOfferFab label="Create" onPress={jest.fn()} palette={palette} />);

    expect(glyph('ionicon-add-circle-outline')).toBeTruthy();
    expect(JSON.stringify(screen.toJSON())).not.toContain('RNSVGSvgView');
  });

  it('uses the platform create symbol on Android', async () => {
    setPlatform('android');
    await render(<CreateOfferFab label="Create" onPress={jest.fn()} palette={palette} />);

    expect(glyph('materialicon-add-circle-outline')).toBeTruthy();
    expect(JSON.stringify(screen.toJSON())).not.toContain('RNSVGSvgView');
  });
});
