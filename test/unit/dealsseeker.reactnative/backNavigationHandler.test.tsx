import { Alert, BackHandler } from 'react-native';
import { render } from '@testing-library/react-native';
import { BackNavigationHandler } from '../../../src/DealsSeeker.ReactNative/src/components/BackNavigationHandler';

let mockState = {
  activeTab: 'offers' as 'offers' | 'suggestions' | 'account',
  immersiveOffers: false,
  isAuthenticated: true,
  overlayRoute: null as { name: string } | null,
  reportDraft: null as object | null,
};

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => mockState,
}));

describe('BackNavigationHandler (APP.SHELL.002-R13 / APP.PLATFORM.CHROME.001-R6)', () => {
  let addEventListener: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockState = {
      activeTab: 'offers',
      immersiveOffers: false,
      isAuthenticated: true,
      overlayRoute: null,
      reportDraft: null,
    };
    addEventListener = jest.spyOn(BackHandler, 'addEventListener').mockImplementation(() => ({
      remove: jest.fn(),
    }));
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('leaves the hardware Back gesture to native navigation', async () => {
    await render(<BackNavigationHandler />);

    expect(addEventListener).not.toHaveBeenCalledWith('hardwareBackPress', expect.any(Function));
    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('does not show an in-app exit confirmation', async () => {
    await render(<BackNavigationHandler />);

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(BackHandler.exitApp).not.toHaveBeenCalled();
  });

  it('does not hijack Back when an overlay or draft is present', async () => {
    mockState.overlayRoute = { name: 'add-offer' };
    mockState.reportDraft = { offerId: 'o1' };
    mockState.immersiveOffers = true;
    mockState.activeTab = 'suggestions';

    await render(<BackNavigationHandler />);

    expect(addEventListener).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('renders no competing chrome', async () => {
    const view = await render(<BackNavigationHandler />);
    expect(view.toJSON()).toBeNull();
  });
});
