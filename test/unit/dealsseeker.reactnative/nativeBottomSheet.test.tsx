import { StyleSheet, Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { NativeBottomSheet } from '../../../src/DealsSeeker.ReactNative/src/components/NativeBottomSheet';

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    palette: { border: '#476258', card: '#293a35' },
  }),
}));

describe('NativeBottomSheet', () => {
  it('uses native sheet behavior with two snap points and swipe dismissal', async () => {
    await render(
      <NativeBottomSheet visible onClose={jest.fn()}>
        <Text>Sheet content</Text>
      </NativeBottomSheet>
    );

    const sheet = screen.getByTestId('native-bottom-sheet');
    expect(sheet.props.snapPoints).toEqual(['65%', '90%']);
    expect(sheet.props.enablePanDownToClose).toBe(true);
    expect(screen.getByText('Sheet content')).toBeTruthy();
  });

  it('keeps the brand card surface on the sheet', async () => {
    await render(
      <NativeBottomSheet visible onClose={jest.fn()}>
        <Text>Sheet content</Text>
      </NativeBottomSheet>
    );

    const sheet = screen.getByTestId('native-bottom-sheet');
    expect(StyleSheet.flatten(sheet.props.backgroundStyle).backgroundColor).toBe('#293a35');
  });

  it('renders nothing while hidden', async () => {
    await render(
      <NativeBottomSheet visible={false} onClose={jest.fn()}>
        <Text>Sheet content</Text>
      </NativeBottomSheet>
    );

    expect(screen.queryByTestId('native-bottom-sheet')).toBeNull();
  });
});
