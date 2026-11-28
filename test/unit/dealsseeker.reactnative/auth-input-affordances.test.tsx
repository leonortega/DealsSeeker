import { fireEvent, render, screen } from '@testing-library/react-native';
import { LoginScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/LoginScreen';

const mockLogin = jest.fn();
const mockSetSession = jest.fn();
const mockShowRegister = jest.fn();
const mockEnterGuestMode = jest.fn();
const mockHelpSheet = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/HelpSheet', () => ({
  HelpSheet: (props: unknown) => {
    mockHelpSheet(props);
    return null;
  },
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    api: { login: mockLogin },
    enterGuestMode: mockEnterGuestMode,
    palette: {
      accent: '#b85c38',
      accentText: '#8d2f2f',
      background: '#f4efe6',
      border: '#d7c9b5',
      card: '#fffdf8',
      danger: '#8d2f2f',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      onAccent: '#fffdf8',
      panel: '#fff9f0',
      panelAlt: '#e6f0e6',
    },
    sessionNotice: null,
    setSession: mockSetSession,
    showRegister: mockShowRegister,
    t: (key: string) => key,
  }),
}));

describe('Sign-in guard contextual help (APP.HELP.CONTEXTUAL.001)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens the shared help surface with the contribution topic first without touching the form', async () => {
    await render(<LoginScreen />);

    const email = screen.getByPlaceholderText('auth.email');
    const password = screen.getByPlaceholderText('auth.password');
    await fireEvent.changeText(email, 'user@example.com');
    await fireEvent.changeText(password, 'correct horse');
    const helpProps = () => mockHelpSheet.mock.calls.at(-1)?.[0] as { visible?: boolean; topic?: string };
    expect(helpProps().visible).toBe(false);

    await fireEvent.press(screen.getByRole('button', { name: 'common.why' }));

    expect(helpProps().visible).toBe(true);
    expect(helpProps().topic).toBe('help.contribute');

    expect(email.props.value).toBe('user@example.com');
    expect(password.props.value).toBe('correct horse');
    expect(screen.getByRole('button', { name: 'auth.browseGuest' })).toBeTruthy();
    expect(mockShowRegister).not.toHaveBeenCalled();
    expect(mockSetSession).not.toHaveBeenCalled();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('hands the Why affordance to the help surface so focus returns on dismissal', async () => {
    await render(<LoginScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'common.why' }));

    const { returnFocusRef } = mockHelpSheet.mock.calls.at(-1)?.[0] as {
      returnFocusRef: { current: { props: { accessibilityLabel?: string } } | null };
    };
    expect(returnFocusRef.current?.props.accessibilityLabel).toBe('common.why');
  });
});
