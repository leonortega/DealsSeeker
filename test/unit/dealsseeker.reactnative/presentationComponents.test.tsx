import { fireEvent, render, screen } from '@testing-library/react-native';
import { AvatarPicker } from '../../../src/DealsSeeker.ReactNative/src/components/AvatarPicker';
import { LoadingOverlay } from '../../../src/DealsSeeker.ReactNative/src/components/LoadingOverlay';
import { SplashScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/SplashScreen';
import { AVATAR_OPTIONS } from '../../../src/DealsSeeker.ReactNative/src/utils/avatars';

let mockLoadingCount = 0;

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    activeTab: 'offers',
    loadingCount: mockLoadingCount,
    overlayRoute: null,
    palette: {
      accent: '#b85c38',
      accentMuted: '#e9c9b8',
      background: '#f4efe6',
      backgroundRaised: '#efe5d8',
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

describe('AvatarPicker', () => {
  it('marks the selected avatar and reports a new selection', async () => {
    const onSelect = jest.fn();
    await render(<AvatarPicker onSelect={onSelect} selectedAvatarId={AVATAR_OPTIONS[0].avatarId} />);

    const options = screen.getAllByRole('button');
    expect(options).toHaveLength(AVATAR_OPTIONS.length);
    await fireEvent.press(options[1]);
    expect(onSelect).toHaveBeenCalledWith(AVATAR_OPTIONS[1].avatarId);
  });
});

describe('LoadingOverlay', () => {
  it('renders nothing when no operation is pending', async () => {
    mockLoadingCount = 0;
    await render(<LoadingOverlay />);
    expect(screen.queryByText('app.loading')).toBeNull();
  });

  it('shows the loading message while an operation is pending', async () => {
    mockLoadingCount = 1;
    await render(<LoadingOverlay />);
    expect(screen.getByText('app.loading')).toBeTruthy();
  });
});

describe('SplashScreen', () => {
  it('shows only the stacked lockup with no text lines', async () => {
    await render(<SplashScreen />);
    expect(screen.getByTestId('brand-mark')).toBeTruthy();
    expect(screen.queryByTestId('splash-icon')).toBeNull();
    expect(screen.queryByText('app.title')).toBeNull();
    expect(screen.queryByText('app.subtitle')).toBeNull();
    expect(screen.queryByText('splash.cta')).toBeNull();
  });
});
