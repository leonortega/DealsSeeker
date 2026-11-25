import { fireEvent, render, screen } from '@testing-library/react-native';
import { AvatarPicker } from '../../../src/DealsSeeker.ReactNative/src/components/AvatarPicker';
import { LoadingOverlay } from '../../../src/DealsSeeker.ReactNative/src/components/LoadingOverlay';
import { StandardHeader } from '../../../src/DealsSeeker.ReactNative/src/components/StandardHeader';
import { SplashScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/SplashScreen';
import { AVATAR_OPTIONS } from '../../../src/DealsSeeker.ReactNative/src/utils/avatars';

let mockActiveTab = 'offers';
let mockOverlayRoute: { name: string } | null = null;
let mockLoadingCount = 0;

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    activeTab: mockActiveTab,
    loadingCount: mockLoadingCount,
    overlayRoute: mockOverlayRoute,
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

describe('StandardHeader', () => {
  beforeEach(() => {
    mockActiveTab = 'offers';
    mockOverlayRoute = null;
  });

  it.each([
    ['offers', null, 'nav.offers'],
    ['account', null, 'nav.account'],
    ['suggestions', null, 'nav.suggestions'],
    ['offers', { name: 'favorites' }, 'nav.favorites'],
    ['offers', { name: 'add-offer' }, 'nav.addOffer'],
  ])('shows the label for tab %s and overlay %p', async (tab, overlay, expected) => {
    mockActiveTab = tab;
    mockOverlayRoute = overlay;
    await render(<StandardHeader />);
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it('always shows the application title', async () => {
    await render(<StandardHeader />);
    expect(screen.getByText('app.title')).toBeTruthy();
  });
});

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
  it('shows the brand mark, title and call to action', async () => {
    await render(<SplashScreen />);
    expect(screen.getByText('DS')).toBeTruthy();
    expect(screen.getByText('app.title')).toBeTruthy();
    expect(screen.getByText('splash.cta')).toBeTruthy();
  });
});
