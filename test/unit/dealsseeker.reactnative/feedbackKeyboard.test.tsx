import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { OfferReportSheet } from '../../../src/DealsSeeker.ReactNative/src/components/OfferReportSheet';
import { SuggestionsScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/SuggestionsScreen';

let mockActiveTab = 'suggestions';
let mockOverlayRoute: { name: string } | null = null;
const mockOpenTab = jest.fn();
const mockClearReportDraft = jest.fn();
const mockApi = {
  submitSuggestion: jest.fn().mockResolvedValue({ success: true }),
  submitReport: jest.fn().mockResolvedValue({ success: true }),
};

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    activeTab: mockActiveTab,
    api: mockApi,
    clearReportDraft: mockClearReportDraft,
    closeOverlay: jest.fn(),
    closeSheet: jest.fn(),
    openSheet: jest.fn(),
    overlayRoute: mockOverlayRoute,
    openTab: mockOpenTab,
    palette: {
      accent: '#b85c38',
      border: '#d7c9b5',
      card: '#fffdf8',
      danger: '#8d2f2f',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      panel: '#fff9f0',
      panelAlt: '#e6f0e6',
    },
    reportDraft: null,
    session: { userId: 'u1' },
    t: (key: string) => key,
  }),
}));

describe('feedback forms keyboard access', () => {
  beforeEach(() => {
    mockActiveTab = 'suggestions';
    mockOverlayRoute = null;
    jest.clearAllMocks();
    mockApi.submitSuggestion.mockResolvedValue({ success: true });
    mockApi.submitReport.mockResolvedValue({ success: true });
  });

  it('wraps the suggestion form in a keyboard-avoiding view', async () => {
    await render(<SuggestionsScreen />);

    expect(screen.getByTestId('suggestions-keyboard-view')).toBeTruthy();
  });

  it('uses labelled Material fields with a live helper counter', async () => {
    await render(<SuggestionsScreen />);

    expect(screen.getByTestId('suggestions-message-counter')).toBeTruthy();
    expect(screen.getByLabelText('suggestions.message').props.value).toBe('');
    expect(screen.getByLabelText('suggestions.contact').props.value).toBe('');
  });

  it('presents the form on a Material 3 card with no authored pill shape', async () => {
    await render(<SuggestionsScreen />);

    const cardStyle = StyleSheet.flatten(screen.getByTestId('suggestions-card').props.style);
    expect(cardStyle.borderRadius).not.toBe(28);
    expect(cardStyle.borderColor).toBeUndefined();
    expect(cardStyle.borderWidth).toBeUndefined();
  });

  it('keeps suggestion success visible until the explicit Done control (APP.SHELL.001-R7)', async () => {
    jest.useFakeTimers();
    await render(<SuggestionsScreen />);
    await fireEvent.changeText(screen.getByPlaceholderText('suggestions.message'), 'More deals');
    await fireEvent.press(screen.getByText('suggestions.submit'));
    await screen.findByText('suggestions.success');

    await act(async () => {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    });

    expect(screen.getByText('suggestions.success')).toBeTruthy();
    expect(mockOpenTab).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('suggestions-done'));
    expect(mockOpenTab).toHaveBeenCalledWith('offers');
    jest.useRealTimers();
  });

  it('keeps report success visible until the explicit Done control (REPORTS.SUBMIT.001-R7)', async () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    const draft = {
      offer: { offerId: 'o9', businessName: 'Draft Cafe', description: 'Draft offer' },
      userId: 'u1',
      reportedAtUtc: '2026-01-01T00:00:00.000Z',
      initialMessage: 'Report draft for o9',
    };

    await render(<OfferReportSheet draft={draft as never} onClose={onClose} visible />);
    await fireEvent.press(screen.getByRole('radio', { name: 'reports.reason.closed' }));
    await fireEvent.press(screen.getByRole('button', { name: 'reports.submit' }));
    await act(async () => {
      jest.advanceTimersByTime(250);
    });
    await fireEvent.press(
      await screen.findByRole('button', { name: 'reports.confirmSend', includeHiddenElements: true })
    );
    await screen.findByText('reports.success');

    await act(async () => {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    });

    expect(screen.getByText('reports.success')).toBeTruthy();
    expect(mockOpenTab).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('report-done'));
    expect(mockOpenTab).toHaveBeenCalledWith('offers');
    expect(onClose).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
