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

  it('sits centered above the footer instead of over the action rail', async () => {
    await render(<CreateOfferFab label="Create" onPress={jest.fn()} palette={palette} />);

    const style = StyleSheet.flatten(screen.getByRole('button', { name: 'Create' }).props.style);
    expect(style.left).toBe('50%');
    expect(style.right).toBeUndefined();
  });
});
