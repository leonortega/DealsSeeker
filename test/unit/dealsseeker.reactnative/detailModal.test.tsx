import { fireEvent, render, screen } from '@testing-library/react-native';
import { OfferDetailModal } from '../../../src/DealsSeeker.ReactNative/src/components/OfferDetailModal';

const mockOnClose = jest.fn();
const mockOnFavorite = jest.fn();
const mockOnDirections = jest.fn();
const mockOnComments = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    palette: {
      accent: '#b85c38',
      accentMuted: '#e9c9b8',
      border: '#d7c9b5',
      card: '#fffdf8',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      overlay: 'rgba(22,30,28,0.52)',
      panel: '#fff9f0',
    },
    preferences: { navigationMode: 'pedestrian' },
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useOfferImageUri', () => ({
  useOfferImageUri: (url?: string | null) => url ?? null,
}));

const offer = {
  offerId: 'o1',
  businessName: 'Main Street Cafe',
  description: 'Coffee and snacks',
  tags: ['coffee', 'snacks'],
  imageUrl: 'https://example.test/a.png',
  imageUrls: ['https://example.test/a.png', 'https://example.test/b.png'],
  distanceMeters: 500,
} as never;

async function renderModal() {
  return await render(
    <OfferDetailModal
      offer={offer}
      onClose={mockOnClose}
      onDirections={mockOnDirections}
      onFavorite={mockOnFavorite}
      onComments={mockOnComments}
      visible
    />
  );
}

describe('OfferDetailModal', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders nothing without an offer', async () => {
    await render(
      <OfferDetailModal
        offer={null}
        onClose={mockOnClose}
        onDirections={mockOnDirections}
        onFavorite={mockOnFavorite}
        onComments={mockOnComments}
        visible
      />
    );
    expect(screen.queryByText('Main Street Cafe')).toBeNull();
  });

  it('shows the offer name, description, distance and tags', async () => {
    await renderModal();
    expect(screen.getAllByText('Main Street Cafe').length).toBeGreaterThan(0);
    expect(screen.getByText('Coffee and snacks')).toBeTruthy();
    expect(screen.getByText('offers.distance: 500 m')).toBeTruthy();
    expect(screen.getByText('coffee')).toBeTruthy();
    expect(screen.getByText('snacks')).toBeTruthy();
  });

  it('closes from the header control', async () => {
    await renderModal();
    await fireEvent.press(screen.getByText('offers.close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('invokes favorite, directions and comments actions', async () => {
    await renderModal();
    await fireEvent.press(screen.getByText('offers.favorite'));
    await fireEvent.press(screen.getByText('offers.directions.walk'));
    await fireEvent.press(screen.getByText('offers.action.comments'));
    expect(mockOnFavorite).toHaveBeenCalledWith(expect.objectContaining({ offerId: 'o1' }));
    expect(mockOnDirections).toHaveBeenCalledTimes(1);
    expect(mockOnComments).toHaveBeenCalledTimes(1);
  });

  it('shows a photo counter and navigates between photos', async () => {
    await renderModal();
    expect(screen.getByText('1 / 2')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('offers.nextImage'));
    expect(screen.getByText('2 / 2')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('offers.previousImage'));
    expect(screen.getByText('1 / 2')).toBeTruthy();
  });

  it('disables photo navigation for a single-image offer', async () => {
    await render(
      <OfferDetailModal
        offer={{ ...offer, imageUrls: [] }}
        onClose={mockOnClose}
        onDirections={mockOnDirections}
        onFavorite={mockOnFavorite}
        onComments={mockOnComments}
        visible
      />
    );
    expect(screen.getByLabelText('offers.nextImage').props.accessibilityState.disabled).toBe(true);
  });
});
