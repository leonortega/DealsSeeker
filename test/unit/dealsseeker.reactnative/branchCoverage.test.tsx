import { AccessibilityInfo } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useReduceMotion } from '../../../src/DealsSeeker.ReactNative/src/hooks/useReduceMotion';
import { useApp } from '../../../src/DealsSeeker.ReactNative/src/hooks/useApp';
import { focusHandle, restoreFocus } from '../../../src/DealsSeeker.ReactNative/src/utils/focusReturn';
import { keyboardAvoidanceBehavior } from '../../../src/DealsSeeker.ReactNative/src/utils/layout';

describe('useReduceMotion', () => {
  afterEach(() => jest.restoreAllMocks());

  it('reads the initial OS preference and follows later changes', async () => {
    let listener: ((enabled: boolean) => void) | undefined;
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((_event, handler) => {
      listener = handler as (enabled: boolean) => void;
      return { remove: jest.fn() } as never;
    });

    const { result } = await renderHook(() => useReduceMotion());
    await waitFor(() => expect(result.current).toBe(true));

    await act(async () => listener?.(false));
    expect(result.current).toBe(false);
  });

  it('ignores a failed preference lookup', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockRejectedValue(new Error('unavailable'));
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue({ remove: jest.fn() } as never);

    const { result } = await renderHook(() => useReduceMotion());
    expect(result.current).toBe(false);
  });
});

describe('focus helpers', () => {
  it('only sets focus for a real handle', () => {
    const setFocus = jest.spyOn(AccessibilityInfo, 'setAccessibilityFocus').mockImplementation(() => undefined);

    focusHandle(null);
    expect(setFocus).not.toHaveBeenCalled();

    focusHandle(42);
    expect(setFocus).toHaveBeenCalledWith(42);
    setFocus.mockRestore();
  });

  it('ignores a missing return target', () => {
    const setFocus = jest.spyOn(AccessibilityInfo, 'setAccessibilityFocus').mockImplementation(() => undefined);

    restoreFocus(undefined);
    restoreFocus(null);

    expect(setFocus).not.toHaveBeenCalled();
    setFocus.mockRestore();
  });
});

describe('keyboard avoidance by platform', () => {
  it('pads on iOS and resizes content height on Android', () => {
    expect(keyboardAvoidanceBehavior('ios')).toBe('padding');
    expect(keyboardAvoidanceBehavior('android')).toBe('height');
  });
});

describe('useApp guard', () => {
  it('throws outside the provider', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderHook(() => useApp())).rejects.toThrow('useApp must be used within AppProvider.');
    error.mockRestore();
  });
});
