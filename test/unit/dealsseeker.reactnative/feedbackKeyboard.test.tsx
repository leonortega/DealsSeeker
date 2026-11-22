import { render, screen } from '@testing-library/react-native';
import { SuggestionsScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/SuggestionsScreen';
import { ReportsScreen } from '../../../src/DealsSeeker.ReactNative/src/screens/ReportsScreen';

let mockActiveTab = 'suggestions';
const mockApi = {
  submitSuggestion: jest.fn().mockResolvedValue({ success: true }),
  submitReport: jest.fn().mockResolvedValue({ success: true }),
};

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    activeTab: mockActiveTab,
    api: mockApi,
    clearReportDraft: jest.fn(),
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

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/StandardHeader', () => ({ StandardHeader: () => null }));

describe('feedback forms keyboard access', () => {
  beforeEach(() => {
    mockActiveTab = 'suggestions';
  });

  it('wraps the suggestion form in a keyboard-avoiding view', async () => {
    await render(<SuggestionsScreen />);

    expect(screen.getByTestId('suggestions-keyboard-view')).toBeTruthy();
  });

  it('wraps the report form in a keyboard-avoiding view', async () => {
    mockActiveTab = 'reports';
    await render(<ReportsScreen />);

    expect(screen.getByTestId('reports-keyboard-view')).toBeTruthy();
  });
});
