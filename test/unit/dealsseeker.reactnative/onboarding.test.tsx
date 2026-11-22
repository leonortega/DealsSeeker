import { fireEvent, render, screen } from '@testing-library/react-native';
import { FirstRunSheet } from '../../../src/DealsSeeker.ReactNative/src/components/FirstRunSheet';

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    palette: {
      accent: '#b85c38',
      border: '#d7c9b5',
      card: '#fffdf8',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      overlay: 'rgba(22,30,28,0.52)',
    },
    t: (key: string) => key,
  }),
}));

describe('first-run guidance (APP.ONBOARD.001)', () => {
  it('presents brief, skippable guidance with a labelled dismiss action', async () => {
    const onDismiss = jest.fn();
    await render(<FirstRunSheet onDismiss={onDismiss} visible />);

    expect(screen.getByText('onboarding.title')).toBeTruthy();
    expect(screen.getByText('onboarding.body')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'onboarding.gotIt' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when guidance is not visible', async () => {
    await render(<FirstRunSheet onDismiss={jest.fn()} visible={false} />);
    expect(screen.queryByText('onboarding.title')).toBeNull();
  });
});
