import { act, renderHook } from '@testing-library/react-native';
import { useAbortableRequest } from '../../../src/DealsSeeker.ReactNative/src/hooks/useAbortableRequest';
import { useDebouncedCallback } from '../../../src/DealsSeeker.ReactNative/src/hooks/useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('runs the latest arguments once after the idle delay', async () => {
    const callback = jest.fn();
    const { result } = await renderHook(() => useDebouncedCallback(callback, 100));

    await act(() => {
      result.current('first');
      result.current('second');
    });
    expect(callback).not.toHaveBeenCalled();

    await act(() => jest.advanceTimersByTime(99));
    expect(callback).not.toHaveBeenCalled();

    await act(() => jest.advanceTimersByTime(1));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('second');
  });

  it('cancels a pending call on unmount', async () => {
    const callback = jest.fn();
    const { result, unmount } = await renderHook(() => useDebouncedCallback(callback, 50));

    await act(() => result.current());
    await unmount();
    await act(() => jest.advanceTimersByTime(100));

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('useAbortableRequest', () => {
  it('aborts the previous request when a new one begins', async () => {
    const { result } = await renderHook(() => useAbortableRequest());
    let first: AbortSignal = undefined!;
    let second: AbortSignal = undefined!;

    await act(() => {
      first = result.current.begin();
    });
    expect(first.aborted).toBe(false);

    await act(() => {
      second = result.current.begin();
    });
    expect(first.aborted).toBe(true);
    expect(second.aborted).toBe(false);
    expect(result.current.begin).toBeInstanceOf(Function);
  });

  it('aborts the current request explicitly', async () => {
    const { result } = await renderHook(() => useAbortableRequest());
    let signal: AbortSignal = undefined!;

    await act(() => {
      signal = result.current.begin();
    });
    await act(() => result.current.abort());

    expect(signal.aborted).toBe(true);
  });

  it('aborts on unmount', async () => {
    const { result, unmount } = await renderHook(() => useAbortableRequest());
    let signal: AbortSignal = undefined!;

    await act(() => {
      signal = result.current.begin();
    });
    await unmount();

    expect(signal.aborted).toBe(true);
  });
});
