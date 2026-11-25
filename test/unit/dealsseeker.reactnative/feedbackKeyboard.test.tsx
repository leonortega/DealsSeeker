import { render, screen } from '@testing-library/react-native';
import { SuggestionsScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/SuggestionsScreen';

let mockActiveTab = 'suggestions';
let mockOverlayRoute: { name: string } | null = null;
const mockApi = {
  submitSuggestion: jest.fn().mockResolvedValue({ success: true }),
  submitReport: jest.fn().mockResolvedValue({ success: true }),
};

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    activeTab: mockActiveTab,
    api: mockApi,
    clearReportDraft: jest.fn(),
    closeOverlay: jest.fn(),
    overlayRoute: mockOverlayRoute,
    openTab: jest.fn(),
    palette: {
      accent: '#b85c38',
      border: '#d7c9b5',
      card: '#fffdf8',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      panel: '#fff9f0',
      panelAlt: '#e6f0e6',
    },
    reportDraft: null,
    session: { userId: 'u1' },
    t: (key: string) => key,
  }),
}));

describe('feedback forms keyboard access', () => {
  beforeEach(() => {
    mockActiveTab = 'suggestions';
    mockOverlayRoute = null;
  });

  it('wraps the suggestion form in a keyboard-avoiding view', async () => {
    await render(<SuggestionsScreen />);

    expect(screen.getByTestId('suggestions-keyboard-view')).toBeTruthy();
  });

});
