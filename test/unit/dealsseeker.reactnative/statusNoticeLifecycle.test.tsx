import { act, render } from '@testing-library/react-native';
import {
  ERROR_STATUS_DWELL_MS,
  STATUS_DWELL_MS,
  useStatusNotice,
} from '../../../src/DealsSeeker.ReactNative/src/hooks/useStatusNotice';

let notice: ReturnType<typeof useStatusNotice> | null = null;

function Probe() {
  notice = useStatusNotice();
  return null;
}

describe('useStatusNotice (APP.FEEDBACK.001)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    notice = null;
  });
  afterEach(() => jest.useRealTimers());

  it('clears success feedback after the short dwell', async () => {
    await render(<Probe />);

    await act(async () => notice?.reportStatus('Saved', 'success'));
    expect(notice?.status).toBe('Saved');

    await act(async () => jest.advanceTimersByTime(STATUS_DWELL_MS - 1));
    expect(notice?.status).toBe('Saved');

    await act(async () => jest.advanceTimersByTime(1));
    expect(notice?.status).toBeNull();
  });

  it('keeps an error through the short dwell and clears it after the long dwell', async () => {
    await render(<Probe />);

    await act(async () => notice?.reportStatus('Failed', 'error'));
    await act(async () => jest.advanceTimersByTime(STATUS_DWELL_MS));
    expect(notice?.status).toBe('Failed');

    await act(async () => jest.advanceTimersByTime(ERROR_STATUS_DWELL_MS - STATUS_DWELL_MS));
    expect(notice?.status).toBeNull();
  });

  it('restarts the dwell when a new message replaces the previous one', async () => {
    await render(<Probe />);

    await act(async () => notice?.reportStatus('First'));
    await act(async () => jest.advanceTimersByTime(STATUS_DWELL_MS - 100));
    await act(async () => notice?.reportStatus('Second'));

    await act(async () => jest.advanceTimersByTime(STATUS_DWELL_MS - 1));
    expect(notice?.status).toBe('Second');

    await act(async () => jest.advanceTimersByTime(1));
    expect(notice?.status).toBeNull();
  });

  it('cancels its timer when the view unmounts', async () => {
    const view = await render(<Probe />);

    await act(async () => notice?.reportStatus('Saved'));
    view.unmount();

    await act(async () => jest.advanceTimersByTime(STATUS_DWELL_MS + 1));
    expect(notice?.status).toBe('Saved');
  });
});
