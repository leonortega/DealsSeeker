import { fireEvent, render, screen } from '@testing-library/react-native';
import { OfferDetailModal } from '../../../src/DealsSeeker.ReactNative/src/components/OfferDetailModal';

const mockOnClose = jest.fn();
const mockOnFavorite = jest.fn();
const mockOnDirections = jest.fn();
const mockOnComments = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    openSheet: jest.fn(),
    closeSheet: jest.fn(),
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
    expect(screen.getByTestId('native-bottom-sheet')).toBeTruthy();
    expect(screen.getByText('Coffee and snacks')).toBeTruthy();
    expect(screen.getByText('offers.distance: 500 m')).toBeTruthy();
    expect(screen.getByText('coffee')).toBeTruthy();
    expect(screen.getByText('snacks')).toBeTruthy();
  });

  it('closes when the sheet is dismissed', async () => {
    const view = await renderModal();
    await fireEvent(view.getByTestId('native-bottom-sheet'), 'close');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
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

  it('supports pinch zoom, pan and reset on the photo', async () => {
    const view = await renderModal();
    await fireEvent.press(view.getAllByTestId('offer-gallery-slide')[0]);
    const surface = view.getByTestId('offer-zoom-surface');
    const touches = (first: [number, number], second?: [number, number]) => ({
      nativeEvent: {
        touches: second
          ? [{ pageX: first[0], pageY: first[1] }, { pageX: second[0], pageY: second[1] }]
          : [{ pageX: first[0], pageY: first[1] }],
        pageX: first[0],
        pageY: first[1],
      },
    });

    await fireEvent(surface, 'layout', {
      nativeEvent: { layout: { width: 300, height: 300, x: 0, y: 0 } },
    });
    await fireEvent(surface, 'responderGrant', touches([0, 0], [100, 0]));
    await fireEvent(surface, 'responderMove', touches([0, 0], [200, 0]));
    await fireEvent(surface, 'responderRelease', touches([0, 0]));
    await fireEvent(surface, 'responderGrant', touches([50, 50]));
    await fireEvent(surface, 'responderMove', touches([90, 90]));
    await fireEvent(surface, 'responderTerminate', touches([90, 90]));

    expect(screen.getAllByText('1 / 2').length).toBeGreaterThan(0);
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
