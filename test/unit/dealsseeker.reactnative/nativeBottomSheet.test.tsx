import { BackHandler, StyleSheet, Text } from 'react-native';
import { MD3LightTheme } from 'react-native-paper';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { NativeBottomSheet } from '../../../src/DealsSeeker.ReactNative/src/components/NativeBottomSheet';

const mockOpenSheet = jest.fn();
const mockCloseSheet = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    palette: { border: '#476258', card: '#293a35' },
    openSheet: mockOpenSheet,
    closeSheet: mockCloseSheet,
  }),
}));

describe('NativeBottomSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('registers an open sheet and releases it on unmount', async () => {
    const { unmount } = await render(
      <NativeBottomSheet visible onClose={jest.fn()}>
        <Text>Sheet content</Text>
      </NativeBottomSheet>
    );

    expect(mockOpenSheet).toHaveBeenCalledTimes(1);
    await act(async () => unmount());
    expect(mockCloseSheet).toHaveBeenCalledTimes(1);
  });

  it('uses native sheet behavior with two snap points and swipe dismissal', async () => {
    await render(
      <NativeBottomSheet visible onClose={jest.fn()}>
        <Text>Sheet content</Text>
      </NativeBottomSheet>
    );

    const sheet = screen.getByTestId('native-bottom-sheet');
    expect(sheet.props.snapPoints).toEqual(['65%', '90%']);
    expect(sheet.props.enablePanDownToClose).toBe(true);
    expect(StyleSheet.flatten(sheet.props.containerStyle).zIndex).toBeGreaterThan(5);
    expect(screen.getByText('Sheet content')).toBeTruthy();
  });

  it('uses the Material 3 surface role on the sheet', async () => {
    await render(
      <NativeBottomSheet visible onClose={jest.fn()}>
        <Text>Sheet content</Text>
      </NativeBottomSheet>
    );

    const sheet = screen.getByTestId('native-bottom-sheet');
    expect(StyleSheet.flatten(sheet.props.backgroundStyle).backgroundColor).toBe(MD3LightTheme.colors.surface);
  });

  it('leaves system Back to the native sheet lifecycle instead of a per-sheet handler', async () => {
    const addEventListener = jest.spyOn(BackHandler, 'addEventListener');
    const onClose = jest.fn();

    await render(
      <NativeBottomSheet visible onClose={onClose}>
        <Text>Sheet content</Text>
      </NativeBottomSheet>
    );

    expect(addEventListener).not.toHaveBeenCalled();
    await fireEvent(screen.getByTestId('native-bottom-sheet'), 'close');
    expect(onClose).toHaveBeenCalledTimes(1);
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
