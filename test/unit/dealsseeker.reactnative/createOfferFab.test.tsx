import fs from 'fs';
import path from 'path';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { CreateOfferFab } from '../../../src/DealsSeeker.ReactNative/src/components/CreateOfferFab';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const glyph = (prefix: string) => ({ name, ...props }: { name: string }) =>
    React.createElement(Text, { ...props, testID: `${prefix}-${name}` });
  return { Ionicons: glyph('ionicon'), MaterialIcons: glyph('materialicon'), MaterialCommunityIcons: glyph('materialcommunityicon') };
});

function setPlatform(os: 'ios' | 'android') {
  (Platform as unknown as { OS: string }).OS = os;
}

describe('CreateOfferFab', () => {
  beforeEach(() => setPlatform('ios'));

  it('opens Add Offer when pressed', async () => {
    const onPress = jest.fn();
    await render(<CreateOfferFab label="Create" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Create' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is not rendered while an overlay sheet is open', async () => {
    await render(<CreateOfferFab label="Create" onPress={jest.fn()} visible={false} />);

    expect(screen.queryByRole('button', { name: 'Create' })).toBeNull();
  });

  it('uses the platform create symbol on iOS', async () => {
    await render(<CreateOfferFab label="Create" onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Create' })).toBeTruthy();
    expect(JSON.stringify(screen.toJSON())).not.toContain('RNSVGSvgView');
  });

  it('uses the platform create symbol on Android', async () => {
    setPlatform('android');
    await render(<CreateOfferFab label="Create" onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Create' })).toBeTruthy();
    expect(JSON.stringify(screen.toJSON())).not.toContain('RNSVGSvgView');
  });

  it('uses Material 3 FAB defaults with no authored color, shape or elevation (APP.PLATFORM.CHROME.001-R19)', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../../src/DealsSeeker.ReactNative/src/components/CreateOfferFab.tsx'),
      'utf8'
    );
    expect(source).not.toMatch(/customSize/);
    expect(source).not.toMatch(/style=/);
    expect(source).not.toMatch(/palette/);
    expect(source).not.toMatch(/shadowOpacity|shadowRadius|elevation|borderRadius/);
  });
});
