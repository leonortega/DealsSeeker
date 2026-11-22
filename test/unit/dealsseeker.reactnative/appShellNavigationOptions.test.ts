import { modalScreenOptions, stackScreenOptions, tabScreenOptions } from '../../../src/DealsSeeker.ReactNative/src/navigation/shellOptions';

describe('native shell navigation options', () => {
  it('hides native chrome on all stack screens so the brand header is the only one', () => {
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
});
