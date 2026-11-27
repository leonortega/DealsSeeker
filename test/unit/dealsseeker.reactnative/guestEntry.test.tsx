import { fireEvent, render, screen } from '@testing-library/react-native';
import { LoginScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/LoginScreen';

const mockEnterGuestMode = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    api: { login: jest.fn().mockResolvedValue(null) },
    enterGuestMode: mockEnterGuestMode,
    palette: {
      accent: '#b85c38',
      accentText: '#b85c38',
      background: '#fffdf8',
      border: '#d7c9b5',
      card: '#fffdf8',
      danger: '#b42318',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      onAccent: '#ffffff',
      panel: '#fff9f0',
    },
    sessionNotice: null,
    setSession: jest.fn(),
    showRegister: jest.fn(),
    t: (key: string) => key,
  }),
}));

describe('guest entry point (OFFERS.GUEST.001, ACCOUNT.AUTH.LOGIN.001)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('offers read-only browsing without an account', async () => {
    await render(<LoginScreen />);

    const guestButton = screen.getByRole('button', { name: 'auth.browseGuest' });
    expect(guestButton).toBeTruthy();
    await fireEvent.press(guestButton);
    expect(mockEnterGuestMode).toHaveBeenCalledTimes(1);
  });
});
