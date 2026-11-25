import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { CreateOfferFab } from '../../../src/DealsSeeker.ReactNative/src/components/CreateOfferFab';
import type { Palette } from '../../../src/DealsSeeker.ReactNative/src/utils/theme';

const palette = { accent: '#b85c38', shadow: 'rgba(0, 0, 0, 0.3)' } as Palette;

describe('CreateOfferFab', () => {
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
});
