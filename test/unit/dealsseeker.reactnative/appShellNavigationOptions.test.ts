import { modalScreenOptions, stackScreenOptions, tabScreenOptions } from '../../../src/DealsSeeker.ReactNative/src/navigation/shellOptions';

describe('native shell navigation options', () => {
  it('hides native chrome on all stack screens so no platform header is shown', () => {
    expect(stackScreenOptions()).toEqual({ headerShown: false });
  });

  it('hides native chrome on tab screens and keeps the brand footer as the tab bar', () => {
    expect(tabScreenOptions()).toEqual({ headerShown: false });
  });

  it('uses a native sheet on iOS and a full-screen modal on Android', () => {
    expect(modalScreenOptions('ios')).toEqual({
      headerShown: false,
      presentation: 'formSheet',
      gestureEnabled: true,
    });
    expect(modalScreenOptions('android')).toEqual({
      headerShown: false,
      presentation: 'modal',
      gestureEnabled: true,
    });
  });

  it('minimizes native stack transitions when Reduce Motion is enabled', () => {
    expect(stackScreenOptions(true)).toEqual({ headerShown: false, animation: 'fade' });
  });

  it('minimizes native modal transitions when Reduce Motion is enabled', () => {
    expect(modalScreenOptions('ios', true)).toEqual({
      headerShown: false,
      presentation: 'formSheet',
      gestureEnabled: true,
      animation: 'fade',
    });
    expect(modalScreenOptions('android', true)).toEqual({
      headerShown: false,
      presentation: 'modal',
      gestureEnabled: true,
      animation: 'fade',
    });
  });
});
