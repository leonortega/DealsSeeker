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

    act(() => {
      jest.advanceTimersByTime(STATUS_DWELL_MS + 1);
    });
    expect(notice?.status).toBe('Saved');
  });

  it('shows a pending indication until exactly one terminal outcome replaces it (APP.FEEDBACK.001-R10/R11)', async () => {
    await render(<Probe />);

    await act(async () => notice?.reportPending('common.saving'));
    expect(notice?.pending).toBe(true);
    expect(notice?.pendingLabel).toBe('common.saving');
    expect(notice?.status).toBeNull();

    await act(async () => notice?.reportStatus('Saved', 'success'));
    expect(notice?.pending).toBe(false);
    expect(notice?.status).toBe('Saved');
    expect(notice?.statusTone).toBe('success');

    await act(async () => jest.advanceTimersByTime(STATUS_DWELL_MS + 1));
    expect(notice?.status).toBeNull();
  });

  it('retires a previous undo action when a new message arrives (APP.FEEDBACK.001-R3)', async () => {
    await render(<Probe />);
    const firstUndo = jest.fn();

    await act(async () => notice?.reportStatus('First', 'neutral', { label: 'Undo', onPress: firstUndo }));
    expect(notice?.statusAction?.label).toBe('Undo');

    await act(async () => notice?.reportStatus('Second'));
    expect(notice?.status).toBe('Second');
    expect(notice?.statusAction).toBeNull();
  });

  it('keeps a persistent message through both dwells until it is dismissed (APP.FEEDBACK.001-R12)', async () => {
    await render(<Probe />);

    await act(async () => notice?.reportStatus('Keep me', 'neutral', null, { persistent: true }));
    expect(notice?.persistentStatus).toBe('Keep me');
    expect(notice?.statusPersistent).toBe(true);

    await act(async () => jest.advanceTimersByTime(ERROR_STATUS_DWELL_MS + 1));
    expect(notice?.persistentStatus).toBe('Keep me');

    await act(async () => notice?.dismissStatus());
    expect(notice?.persistentStatus).toBeNull();
    expect(notice?.statusPersistent).toBe(false);
  });

  it('does not let a transient message remove a persistent message (APP.FEEDBACK.001-R13)', async () => {
    await render(<Probe />);

    await act(async () => notice?.reportStatus('Persistent', 'neutral', null, { persistent: true }));
    await act(async () => notice?.reportStatus('Transient', 'success'));

    expect(notice?.persistentStatus).toBe('Persistent');
    expect(notice?.status).toBe('Transient');

    await act(async () => jest.advanceTimersByTime(STATUS_DWELL_MS + 1));
    expect(notice?.status).toBeNull();
    expect(notice?.persistentStatus).toBe('Persistent');
  });

  it('clears pending and every message when the view is left (APP.FEEDBACK.001-R4)', async () => {
    await render(<Probe />);

    await act(async () => notice?.reportStatus('Persistent', 'neutral', null, { persistent: true }));
    await act(async () => notice?.reportPending('common.saving'));
    await act(async () => notice?.clearStatus());

    expect(notice?.pending).toBe(false);
    expect(notice?.status).toBeNull();
    expect(notice?.persistentStatus).toBeNull();
    expect(notice?.statusAction).toBeNull();
  });
});
