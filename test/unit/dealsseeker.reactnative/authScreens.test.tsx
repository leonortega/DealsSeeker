import fs from 'fs';
import path from 'path';
import { Platform, StyleSheet } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Button as PaperButton, MD3LightTheme } from 'react-native-paper';
import { LoginScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/LoginScreen';
import { RegisterScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/RegisterScreen';

function hasAncestorComponent(node: any, component: unknown): boolean {
  let current = node?.unstable_fiber?.return ?? null;
  while (current) {
    if (current.type === component) {
      return true;
    }
    current = current.return;
  }
  return false;
}

const mockKeyboardAvoidanceBehavior = jest.fn((os: string) => (os === 'ios' ? 'padding' : 'height'));

jest.mock('../../../src/DealsSeeker.ReactNative/src/utils/layout', () => ({
  ...jest.requireActual('../../../src/DealsSeeker.ReactNative/src/utils/layout'),
  keyboardAvoidanceBehavior: (os: string) => mockKeyboardAvoidanceBehavior(os),
}));

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

  it('shows the authored brand mark beside the localized app name', async () => {
    await render(<LoginScreen />);

    expect(screen.getByTestId('brand-mark')).toBeTruthy();
    expect(screen.getByText('app.title')).toBeTruthy();
    expect(screen.queryByText('DS')).toBeNull();
  });

  it('gives the sign-in fields persistent Material 3 labels', async () => {
    await render(<LoginScreen />);

    expect(screen.getByLabelText('auth.email')).toBeTruthy();
    expect(screen.getByLabelText('auth.password')).toBeTruthy();
    expect(screen.getAllByText('auth.email').length).toBeGreaterThan(0);
    expect(screen.getAllByText('auth.password').length).toBeGreaterThan(0);
  });

  it('uses Material 3 surfaces and typography for the sign-in form', async () => {
    await render(<LoginScreen />);

    expect(StyleSheet.flatten(screen.getByText('app.title').props.style).fontFamily).not.toBe('Georgia');
    expect(StyleSheet.flatten(screen.getByTestId('login-form-card').props.style).backgroundColor).toBe(
      MD3LightTheme.colors.surface
    );
  });

  it('renders the Why help affordance with the Material 3 button component', async () => {
    await render(<LoginScreen />);

    const why = screen.getByRole('button', { name: 'common.why' });
    expect(hasAncestorComponent(why, PaperButton)).toBe(true);
  });

  it('uses the email keyboard and can reveal the masked password', async () => {
    await render(<LoginScreen />);

    expect(screen.getByPlaceholderText('auth.email').props.keyboardType).toBe('email-address');
    expect(screen.getByPlaceholderText('auth.password').props.secureTextEntry).toBe(true);

    await fireEvent.press(screen.getByRole('button', { name: 'auth.showPassword' }));
    expect(screen.getByPlaceholderText('auth.password').props.secureTextEntry).toBe(false);

    await fireEvent.press(screen.getByRole('button', { name: 'auth.hidePassword' }));
    expect(screen.getByPlaceholderText('auth.password').props.secureTextEntry).toBe(true);
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

describe('Authentication input caps (ACCOUNT.AUTH.INPUT.001)', () => {
  it('caps login email at 254 and password at 200 characters', async () => {
    await render(<LoginScreen />);

    const email = screen.getByPlaceholderText('auth.email');
    const password = screen.getByPlaceholderText('auth.password');
    await fireEvent.changeText(email, 'a'.repeat(300));
    await fireEvent.changeText(password, 'b'.repeat(250));

    expect(email.props.value).toHaveLength(254);
    expect(password.props.value).toHaveLength(200);
  });

  it('caps register display name at 80, email at 254 and password at 200 characters', async () => {
    await render(<RegisterScreen />);

    const displayName = screen.getByPlaceholderText('auth.displayName');
    const email = screen.getByPlaceholderText('auth.email');
    const password = screen.getByPlaceholderText('auth.password');
    await fireEvent.changeText(displayName, 'c'.repeat(120));
    await fireEvent.changeText(email, 'a'.repeat(300));
    await fireEvent.changeText(password, 'b'.repeat(250));

    expect(displayName.props.value).toHaveLength(80);
    expect(email.props.value).toHaveLength(254);
    expect(password.props.value).toHaveLength(200);
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

  it('uses the email keyboard and can reveal the masked password', async () => {
    await render(<RegisterScreen />);

    expect(screen.getByPlaceholderText('auth.email').props.keyboardType).toBe('email-address');
    expect(screen.getByPlaceholderText('auth.password').props.secureTextEntry).toBe(true);

    await fireEvent.press(screen.getByRole('button', { name: 'auth.showPassword' }));
    expect(screen.getByPlaceholderText('auth.password').props.secureTextEntry).toBe(false);

    await fireEvent.press(screen.getByRole('button', { name: 'auth.hidePassword' }));
    expect(screen.getByPlaceholderText('auth.password').props.secureTextEntry).toBe(true);
  });

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

describe('Material 3 controls on auth screens (APP.PLATFORM.CHROME.001-R14/R18/R19, APP.TYPOGRAPHY.001-R1/R7)', () => {
  const sourceRoot = path.resolve(__dirname, '../../../src/DealsSeeker.ReactNative/src/screens');

  it.each(['LoginScreen.tsx', 'RegisterScreen.tsx'])(
    'replaces raw Pressable and ad-hoc text sizing in %s',
    (file) => {
      const source = fs.readFileSync(path.join(sourceRoot, file), 'utf8');
      expect(source).not.toMatch(/\bPressable\b/);
      expect(source).not.toMatch(/font(Size|Weight):/u);
      expect(source).not.toMatch(/landmarkFontFamily/u);
    }
  );
});

describe('authentication forms keyboard avoidance', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    mockKeyboardAvoidanceBehavior.mockClear();
  });

  it('delegates Login to the platform keyboard strategy for iOS', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');

    await render(<LoginScreen />);

    expect(mockKeyboardAvoidanceBehavior).toHaveBeenCalledWith('ios');
  });

  it('delegates Create User to the platform keyboard strategy for iOS', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');

    await render(<RegisterScreen />);

    expect(mockKeyboardAvoidanceBehavior).toHaveBeenCalledWith('ios');
  });

  it('delegates Login to the platform keyboard strategy for Android', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');

    await render(<LoginScreen />);

    expect(mockKeyboardAvoidanceBehavior).toHaveBeenCalledWith('android');
  });

  it('delegates Create User to the platform keyboard strategy for Android', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');

    await render(<RegisterScreen />);

    expect(mockKeyboardAvoidanceBehavior).toHaveBeenCalledWith('android');
  });
});
