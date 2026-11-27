import { modalScreenOptions, stackScreenOptions, tabScreenOptions } from '../../../src/DealsSeeker.ReactNative/src/navigation/shellOptions';

describe('native shell navigation options', () => {
  it('shows the native stack header for overlay destinations', () => {
    expect(stackScreenOptions()).toEqual({ headerShown: true });
  });

  it('shows a platform-native header on standard tab screens', () => {
    expect(tabScreenOptions()).toEqual({ headerShown: true });
  });

  it('uses a native sheet on iOS and a full-screen modal on Android', () => {
    expect(modalScreenOptions('ios')).toEqual({
      headerShown: true,
      presentation: 'formSheet',
      gestureEnabled: true,
    });
    expect(modalScreenOptions('android')).toEqual({
      headerShown: true,
      presentation: 'modal',
      gestureEnabled: true,
    });
  });

  it('minimizes native stack transitions when Reduce Motion is enabled', () => {
    expect(stackScreenOptions(true)).toEqual({ headerShown: true, animation: 'fade' });
  });

  it('minimizes native modal transitions when Reduce Motion is enabled', () => {
    expect(modalScreenOptions('ios', true)).toEqual({
      headerShown: true,
      presentation: 'formSheet',
      gestureEnabled: true,
      animation: 'fade',
    });
    expect(modalScreenOptions('android', true)).toEqual({
      headerShown: true,
      presentation: 'modal',
      gestureEnabled: true,
      animation: 'fade',
    });
  });
});
