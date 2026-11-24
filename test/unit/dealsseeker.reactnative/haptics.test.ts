const mockSelectionAsync = jest.fn().mockResolvedValue(undefined);
const mockNotificationAsync = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-haptics', () => ({
  selectionAsync: (...args: unknown[]) => mockSelectionAsync(...args),
  notificationAsync: (...args: unknown[]) => mockNotificationAsync(...args),
  NotificationFeedbackType: { Success: 'success' },
}));

import { selectionFeedback, successFeedback } from '../../../src/DealsSeeker.ReactNative/src/utils/haptics';

describe('haptic feedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectionAsync.mockResolvedValue(undefined);
    mockNotificationAsync.mockResolvedValue(undefined);
  });

  it('emits one selection pulse for a favorite toggle', () => {
    selectionFeedback();

    expect(mockSelectionAsync).toHaveBeenCalledTimes(1);
  });

  it('emits one success notification for a vote or submission', () => {
    successFeedback();

    expect(mockNotificationAsync).toHaveBeenCalledWith('success');
    expect(mockNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it('degrades silently when the platform reports no haptic support', () => {
    mockNotificationAsync.mockRejectedValueOnce(new Error('unsupported'));

    expect(() => successFeedback()).not.toThrow();
  });
});
