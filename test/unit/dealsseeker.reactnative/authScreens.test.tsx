import { Platform } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/LoginScreen';
import { RegisterScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/RegisterScreen';

const mockLogin = jest.fn();
const mockRegisterUser = jest.fn();
const mockSetSession = jest.fn();
const mockShowRegister = jest.fn();
const mockShowLogin = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    api: { login: mockLogin, registerUser: mockRegisterUser },
    palette: {
      accent: '#b85c38',
      background: '#f4efe6',
      border: '#d7c9b5',
      card: '#fffdf8',
      danger: '#8d2f2f',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      panel: '#fff9f0',
      panelAlt: '#e6f0e6',
    },
    setSession: mockSetSession,
    showLogin: mockShowLogin,
    showRegister: mockShowRegister,
    t: (key: string) => key,
  }),
}));

const session = { accessToken: 'tok' } as never;

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockResolvedValue(session);
    mockSetSession.mockResolvedValue(undefined);
  });

  it('logs in with a trimmed email and establishes the session', async () => {
    await render(<LoginScreen />);

    await fireEvent.changeText(screen.getByPlaceholderText('auth.email'), '  user@example.com  ');
    await fireEvent.changeText(screen.getByPlaceholderText('auth.password'), 'password1');
    await fireEvent.press(screen.getByText('auth.loginButton'));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith({ email: 'user@example.com', password: 'password1' }));
    expect(mockSetSession).toHaveBeenCalledWith(session);
  });

  it('shows an invalid-credentials message when login returns no session', async () => {
    mockLogin.mockResolvedValue(null);
    await render(<LoginScreen />);

    await fireEvent.press(screen.getByText('auth.loginButton'));

    expect(await screen.findByText('auth.invalidCredentials')).toBeTruthy();
  });

  it('shows a login-failed message when the request rejects', async () => {
    mockLogin.mockRejectedValue(new Error('offline'));
    await render(<LoginScreen />);

    await fireEvent.press(screen.getByText('auth.loginButton'));

    expect(await screen.findByText('auth.loginFailed')).toBeTruthy();
  });

  it('offers a link to registration', async () => {
    await render(<LoginScreen />);

    await fireEvent.press(screen.getByText('auth.createAccountLink'));

    expect(mockShowRegister).toHaveBeenCalledTimes(1);
  });
});

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRegisterUser.mockResolvedValue({ success: true });
    mockLogin.mockResolvedValue(session);
    mockSetSession.mockResolvedValue(undefined);
  });

  async function fillValidForm() {
    await fireEvent.changeText(screen.getByPlaceholderText('auth.displayName'), 'New User');
    await fireEvent.changeText(screen.getByPlaceholderText('auth.email'), 'user@example.com');
    await fireEvent.changeText(screen.getByPlaceholderText('auth.password'), 'password1');
  }

  it('rejects an empty display name', async () => {
    await render(<RegisterScreen />);
    await fireEvent.press(screen.getByText('auth.registerButton'));
    expect(screen.getByText('auth.nameRequired')).toBeTruthy();
  });

  it('rejects an invalid email', async () => {
    await render(<RegisterScreen />);
    await fireEvent.changeText(screen.getByPlaceholderText('auth.displayName'), 'New User');
    await fireEvent.changeText(screen.getByPlaceholderText('auth.email'), 'not-an-email');
    await fireEvent.press(screen.getByText('auth.registerButton'));
    expect(screen.getByText('auth.emailRequired')).toBeTruthy();
  });

  it('rejects a weak password', async () => {
    await render(<RegisterScreen />);
    await fireEvent.changeText(screen.getByPlaceholderText('auth.displayName'), 'New User');
    await fireEvent.changeText(screen.getByPlaceholderText('auth.email'), 'user@example.com');
    await fireEvent.changeText(screen.getByPlaceholderText('auth.password'), 'short');
    await fireEvent.press(screen.getByText('auth.registerButton'));
    expect(screen.getByText('auth.passwordRequired')).toBeTruthy();
  });

  it('registers, logs in and establishes the session', async () => {
    await render(<RegisterScreen />);
    await fillValidForm();

    await fireEvent.press(screen.getByText('auth.registerButton'));

    await waitFor(() =>
      expect(mockRegisterUser).toHaveBeenCalledWith({
        displayName: 'New User',
        email: 'user@example.com',
        password: 'password1',
      })
    );
    expect(mockSetSession).toHaveBeenCalledWith(session);
  });

  it('reports a failed registration', async () => {
    mockRegisterUser.mockResolvedValue({ success: false });
    await render(<RegisterScreen />);
    await fillValidForm();

    await fireEvent.press(screen.getByText('auth.registerButton'));

    expect(await screen.findByText('auth.registerFailed')).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('offers a link to login', async () => {
    await render(<RegisterScreen />);
    await fireEvent.press(screen.getByText('auth.loginLink'));
    expect(mockShowLogin).toHaveBeenCalledTimes(1);
  });
});

describe('authentication forms keyboard avoidance', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses the iOS keyboard strategy on both authentication forms', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');

    await render(<LoginScreen />);
    expect(screen.getByTestId('login-keyboard-view').props.behavior).toBe('padding');
    await render(<RegisterScreen />);
    expect(screen.getByTestId('register-keyboard-view').props.behavior).toBe('padding');
  });

  it('uses the Android keyboard strategy on both authentication forms', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');

    await render(<LoginScreen />);
    expect(screen.getByTestId('login-keyboard-view').props.behavior).toBe('height');
    await render(<RegisterScreen />);
    expect(screen.getByTestId('register-keyboard-view').props.behavior).toBe('height');
  });
});
