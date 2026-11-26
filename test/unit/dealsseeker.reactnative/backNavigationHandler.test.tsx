import { Alert, BackHandler } from 'react-native';
import { render } from '@testing-library/react-native';
import { BackNavigationHandler } from '../../../src/DealsSeeker.ReactNative/src/components/BackNavigationHandler';

let backHandler: (() => boolean) | undefined;

const mockCloseOverlay = jest.fn();
const mockClearReportDraft = jest.fn();
const mockCloseImmersiveOffers = jest.fn();
const mockOpenTab = jest.fn();

let mockState = {
  activeTab: 'offers' as 'offers' | 'suggestions' | 'account',
  clearReportDraft: mockClearReportDraft,
  closeImmersiveOffers: mockCloseImmersiveOffers,
  closeOverlay: mockCloseOverlay,
  immersiveOffers: false,
  isAuthenticated: true,
  openTab: mockOpenTab,
  overlayRoute: null as { name: string } | null,
  reportDraft: null as object | null,
  t: (key: string) => key,
};

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => mockState,
}));

describe('BackNavigationHandler (APP.SHELL.001-R17/R18)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    backHandler = undefined;
    mockState = {
      activeTab: 'offers',
      clearReportDraft: mockClearReportDraft,
      closeImmersiveOffers: mockCloseImmersiveOffers,
      closeOverlay: mockCloseOverlay,
      immersiveOffers: false,
      isAuthenticated: true,
      openTab: mockOpenTab,
      overlayRoute: null,
      reportDraft: null,
      t: (key: string) => key,
    };
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
      backHandler = handler as () => boolean;
      return { remove: jest.fn() };
    });
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('closes an overlay before navigating or asking to exit', async () => {
    mockState.overlayRoute = { name: 'add-offer' };
    await render(<BackNavigationHandler />);

    expect(backHandler?.()).toBe(true);
    expect(mockCloseOverlay).toHaveBeenCalledTimes(1);
    expect(mockOpenTab).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('closes the report sheet before navigating or asking to exit', async () => {
    mockState.reportDraft = { offerId: 'o1' };
    await render(<BackNavigationHandler />);

    expect(backHandler?.()).toBe(true);
    expect(mockClearReportDraft).toHaveBeenCalledTimes(1);
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('closes the immersive feed before asking to exit', async () => {
    mockState.immersiveOffers = true;
    await render(<BackNavigationHandler />);

    expect(backHandler?.()).toBe(true);
    expect(mockCloseImmersiveOffers).toHaveBeenCalledTimes(1);
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('returns to Offers from another view', async () => {
    mockState.activeTab = 'suggestions';
    await render(<BackNavigationHandler />);

    expect(backHandler?.()).toBe(true);
    expect(mockOpenTab).toHaveBeenCalledWith('offers');
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('asks for confirmation on Offers and stays open on cancel', async () => {
    await render(<BackNavigationHandler />);

    expect(backHandler?.()).toBe(true);
    expect(Alert.alert).toHaveBeenCalledWith(
      'app.exitTitle',
      'app.exitBody',
      expect.arrayContaining([expect.objectContaining({ text: 'app.exit' })])
    );
    expect(BackHandler.exitApp).not.toHaveBeenCalled();
  });

  it('exits only after the user confirms', async () => {
    await render(<BackNavigationHandler />);
    backHandler?.();
    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const exitButton = buttons.find((button: { text: string }) => button.text === 'app.exit');

    exitButton.onPress();

    expect(BackHandler.exitApp).toHaveBeenCalledTimes(1);
  });
});
