import { fireEvent, render, screen } from '@testing-library/react-native';
import { HelpSheet } from '../../../src/DealsSeeker.ReactNative/src/components/HelpSheet';

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    openSheet: jest.fn(),
    closeSheet: jest.fn(),
    palette: {
      accent: '#b85c38',
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
});
