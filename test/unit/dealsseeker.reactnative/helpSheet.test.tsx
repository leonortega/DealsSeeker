import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { AccessibilityInfo, StyleSheet } from 'react-native';
import { HelpSheet } from '../../../src/DealsSeeker.ReactNative/src/components/HelpSheet';

const mockRestoreFocus = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/utils/focusReturn', () => ({
  restoreFocus: (...args: unknown[]) => mockRestoreFocus(...args),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    openSheet: jest.fn(),
    closeSheet: jest.fn(),
    palette: {
      accent: '#b85c38',
      accentText: '#8a5a00',
      border: '#d7c9b5',
      card: '#fffdf8',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      overlay: 'rgba(22, 30, 28, 0.52)',
      panel: '#fff9f0',
    },
    t: (key: string) => key,
  }),
}));

describe('HelpSheet', () => {
  it('renders nothing while hidden', async () => {
    await render(<HelpSheet onClose={jest.fn()} visible={false} />);
    expect(screen.queryByText('help.title')).toBeNull();
  });

  it('lists only the five essential topics', async () => {
    await render(<HelpSheet onClose={jest.fn()} visible />);

    expect(screen.getByText('help.title')).toBeTruthy();
    expect(screen.getByText('help.find.title')).toBeTruthy();
    expect(screen.getByText('help.mode.title')).toBeTruthy();
    expect(screen.getByText('help.contribute.title')).toBeTruthy();
    expect(screen.getByText('help.report.title')).toBeTruthy();
    expect(screen.getByText('help.favorites.title')).toBeTruthy();
  });

  it('relies on native dismissal instead of a redundant close button', async () => {
    const onClose = jest.fn();
    await render(<HelpSheet onClose={onClose} visible />);

    expect(screen.queryByRole('button', { name: 'common.close' })).toBeNull();
    await fireEvent(screen.getByTestId('native-bottom-sheet'), 'close');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses the Material 3 searchbar pattern with a labelled search control', async () => {
    await render(<HelpSheet onClose={jest.fn()} visible />);

    const search = screen.getByTestId('help-search');
    expect(search.props.accessibilityRole).toBe('search');
    expect(search.props.accessibilityLabel).toBe('help.searchPlaceholder');
    expect(StyleSheet.flatten(search.props.style).borderRadius).not.toBe(999);
  });

  it('filters topics in place by task wording, case and partial matches', async () => {
    await render(<HelpSheet onClose={jest.fn()} visible />);
    const search = screen.getByTestId('help-search');

    await fireEvent.changeText(search, 'REPORT');

    expect(screen.getByText('help.report.title')).toBeTruthy();
    expect(screen.queryByText('help.find.title')).toBeNull();
    expect(screen.getByTestId('help-sheet')).toBeTruthy();

    await fireEvent.changeText(search, 'MODE');

    expect(screen.getByText('help.mode.title')).toBeTruthy();
    expect(screen.queryByText('help.report.title')).toBeNull();
  });

  it('offers a clear action when no topic matches and restores contextual order', async () => {
    await render(<HelpSheet onClose={jest.fn()} topic="help.contribute" visible />);
    const search = screen.getByTestId('help-search');

    await fireEvent.changeText(search, 'zzzznotatopic');

    expect(screen.getByText('help.noResults')).toBeTruthy();
    expect(screen.queryByText('help.find.title')).toBeNull();
    await fireEvent.press(screen.getByTestId('help-clear-search'));

    expect(search.props.value).toBe('');
    expect(within(screen.getAllByTestId('help-topic')[0]).getByText('help.contribute.title')).toBeTruthy();
    expect(screen.getAllByTestId('help-topic')).toHaveLength(5);
  });

  it('announces the search entry point and returns focus on dismissal', async () => {
    const onClose = jest.fn();
    const returnFocusRef = { current: null };
    await render(<HelpSheet onClose={onClose} returnFocusRef={returnFocusRef as never} visible />);

    expect(screen.getByTestId('help-search').props.accessibilityLabel).toBeTruthy();
    await fireEvent(screen.getByTestId('native-bottom-sheet'), 'close');
    expect(mockRestoreFocus).toHaveBeenCalledWith(returnFocusRef);
  });

  it('does not need an external lookup to show results', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    await render(<HelpSheet onClose={jest.fn()} visible />);

    await fireEvent.changeText(screen.getByTestId('help-search'), 'favorite');

    expect(screen.getByText('help.favorites.title')).toBeTruthy();
    expect(announceSpy).toHaveBeenCalled();
    announceSpy.mockRestore();
  });
});
