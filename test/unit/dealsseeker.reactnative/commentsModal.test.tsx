import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { OfferCommentsModal } from '../../../src/DealsSeeker.ReactNative/src/components/OfferCommentsModal';

const mockGetOfferComments = jest.fn();
const mockCreateOfferComment = jest.fn();
const mockOnClose = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    api: { getOfferComments: mockGetOfferComments, createOfferComment: mockCreateOfferComment },
    palette: {
      accent: '#b85c38',
      card: '#fffdf8',
      danger: '#8d2f2f',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      overlay: 'rgba(22,30,28,0.52)',
      panel: '#fff9f0',
      border: '#d7c9b5',
    },
    t: (key: string) => key,
  }),
}));

const offer = { offerId: 'o1', businessName: 'Main Street Cafe' } as never;
const comment = {
  commentId: 'c1',
  displayName: 'Alice',
  avatarId: 'avatar-1',
  body: 'Great deal!',
  createdAtUtc: '2026-01-01T12:00:00.000Z',
} as never;

async function renderModal() {
  return await render(<OfferCommentsModal offer={offer} onClose={mockOnClose} visible />);
}

describe('OfferCommentsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetOfferComments.mockResolvedValue({ comments: [comment], hasMore: false, nextCursor: null });
    mockCreateOfferComment.mockResolvedValue({ ...comment, commentId: 'c2', body: 'New comment' });
  });

  it('renders nothing without an offer', async () => {
    await render(<OfferCommentsModal offer={null} onClose={mockOnClose} visible />);
    expect(screen.queryByText('comments.title')).toBeNull();
  });

  it('loads and displays comments for the offer', async () => {
    await renderModal();
    expect(await screen.findByText('Great deal!')).toBeTruthy();
    expect(screen.getByTestId('native-bottom-sheet')).toBeTruthy();
    expect(mockGetOfferComments).toHaveBeenCalledWith('o1');
    expect(screen.getByText('Main Street Cafe')).toBeTruthy();
  });

  it('shows an empty state when there are no comments', async () => {
    mockGetOfferComments.mockResolvedValue({ comments: [], hasMore: false, nextCursor: null });
    await renderModal();
    expect(await screen.findByText('comments.empty')).toBeTruthy();
  });

  it('requires a non-empty body before publishing', async () => {
    await renderModal();
    await screen.findByText('Great deal!');
    await fireEvent.press(screen.getByText('comments.publish'));
    expect(screen.getByText('comments.bodyRequired')).toBeTruthy();
    expect(mockCreateOfferComment).not.toHaveBeenCalled();
  });

  it('publishes a trimmed comment and clears the input', async () => {
    await renderModal();
    await screen.findByText('Great deal!');
    await fireEvent.changeText(screen.getByPlaceholderText('comments.placeholder'), '  New comment  ');
    await fireEvent.press(screen.getByText('comments.publish'));

    await waitFor(() =>
      expect(mockCreateOfferComment).toHaveBeenCalledWith('o1', { body: 'New comment' })
    );
    expect(screen.getByText('New comment')).toBeTruthy();
    expect(screen.getByPlaceholderText('comments.placeholder').props.value).toBe('');
  });

  it('reports a publish failure', async () => {
    mockCreateOfferComment.mockRejectedValue(new Error('offline'));
    await renderModal();
    await screen.findByText('Great deal!');
    await fireEvent.changeText(screen.getByPlaceholderText('comments.placeholder'), 'New comment');
    await fireEvent.press(screen.getByText('comments.publish'));

    expect(await screen.findByText('comments.publishFailed')).toBeTruthy();
  });

  it('loads a further page when more comments are available', async () => {
    mockGetOfferComments
      .mockResolvedValueOnce({ comments: [comment], hasMore: true, nextCursor: 'cursor-1' })
      .mockResolvedValueOnce({ comments: [{ ...comment, commentId: 'c3', body: 'Older comment' }], hasMore: false, nextCursor: null });
    await renderModal();
    await screen.findByText('Great deal!');

    await fireEvent.press(screen.getByText('comments.loadMore'));

    expect(await screen.findByText('Older comment')).toBeTruthy();
    expect(mockGetOfferComments).toHaveBeenCalledWith('o1', undefined, 'cursor-1');
  });

  it('reports a load failure', async () => {
    mockGetOfferComments.mockRejectedValue(new Error('offline'));
    await renderModal();
    expect(await screen.findByText('comments.loadFailed')).toBeTruthy();
  });

  it('closes from the header control', async () => {
    await renderModal();
    await screen.findByText('Great deal!');
    await fireEvent.press(screen.getByText('offers.close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
