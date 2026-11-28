import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { Button, IconButton, MD3LightTheme, TouchableRipple } from 'react-native-paper';
import { OfferDetailModal } from '../../../src/DealsSeeker.ReactNative/src/components/OfferDetailModal';
import { platformTouchFloor } from '../../../src/DealsSeeker.ReactNative/src/utils/layout';

function hasComponent(node: any, component: unknown): boolean {
  const visit = (fiber: any): boolean => {
    if (!fiber) {
      return false;
    }
    if (fiber.type === component) {
      return true;
    }
    return visit(fiber.child) || visit(fiber.sibling);
  };
  let top = node.unstable_fiber;
  while (top?.return) {
    top = top.return;
  }
  return visit(top);
}

const mockOnClose = jest.fn();
const mockOnFavorite = jest.fn();
const mockOnDirections = jest.fn();
const mockOnComments = jest.fn();
const mockOpenSheet = jest.fn();
const mockCloseSheet = jest.fn();
const mockRestoreFocus = jest.fn();

jest.mock('../../../src/DealsSeeker.ReactNative/src/utils/focusReturn', () => ({
  restoreFocus: (...args: unknown[]) => mockRestoreFocus(...args),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/PlatformTabIcon', () => {
  const { Text } = require('react-native');
  return {
    PlatformTabIcon: ({ name }: { name: string }) =>
      require('react').createElement(Text, { testID: `platform-glyph-${name}` }, name),
  };
});

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    openSheet: mockOpenSheet,
    closeSheet: mockCloseSheet,
    palette: {
      accent: '#b85c38',
      accentMuted: '#e9c9b8',
      border: '#d7c9b5',
      card: '#fffdf8',
      danger: '#8d2f2f',
      highlight: '#0d7a5f',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      onDanger: '#ffffff',
      onHighlight: '#ffffff',
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
  isFavorite: false,
  isPromoted: false,
  isReported: false,
} as never;

function hasAncestor(instance: any, component: unknown): boolean {
  let fiber = instance?.unstable_fiber;
  while (fiber) {
    if (fiber.type === component) {
      return true;
    }
    fiber = fiber.return;
  }
  return false;
}

function hasVariant(instance: any, variant: keyof typeof MD3LightTheme.fonts): boolean {
  return StyleSheet.flatten(instance.props.style).fontSize === MD3LightTheme.fonts[variant].fontSize;
}

function hostTypes(node: unknown): string[] {
  if (!node || typeof node !== 'object') {
    return [];
  }
  const entry = node as { type?: unknown; children?: unknown[] };
  return [
    ...(typeof entry.type === 'string' ? [entry.type] : []),
    ...(entry.children ?? []).flatMap(hostTypes),
  ];
}

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

  it('does not duplicate the native dismissal with a close button', async () => {
    await renderModal();
    expect(screen.queryByRole('button', { name: 'offers.close' })).toBeNull();
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

  it('renders the detail sheet actions with Material 3 buttons (OFFERS.ACTIONS.LABELS.001-R14)', async () => {
    const view = await renderModal();

    expect(hasComponent(view.root, Button)).toBe(true);
  });

  it('announces the canonical names, roles and states in canonical order (OFFERS.ACTIONS.LABELS.001-R11)', async () => {
    await renderModal();

    const directions = screen.getByTestId('offer-detail-action-directions');
    const favorite = screen.getByTestId('offer-detail-action-favorite');
    const comments = screen.getByTestId('offer-detail-action-comments');
    expect(directions.props.accessibilityLabel).toBe('offers.action.directions');
    expect(favorite.props.accessibilityLabel).toBe('offers.action.favorite');
    expect(comments.props.accessibilityLabel).toBe('offers.action.comments');
    for (const control of [directions, favorite, comments]) {
      expect(control.props.accessibilityRole).toBe('button');
    }
    expect(favorite.props.accessibilityState).toMatchObject({ selected: false });
    const order = [directions, favorite, comments].map((node) => node.props.testID);
    expect(order).toEqual([
      'offer-detail-action-directions',
      'offer-detail-action-favorite',
      'offer-detail-action-comments',
    ]);
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

  it('mirrors promoted and reported badges plus the reported warning (OFFERS.DETAIL.ACTIONS.001-R7)', async () => {
    await render(
      <OfferDetailModal
        offer={{ ...offer, isPromoted: true, isReported: true }}
        onClose={mockOnClose}
        onDirections={mockOnDirections}
        onFavorite={mockOnFavorite}
        onComments={mockOnComments}
        visible
      />
    );

    expect(screen.getByTestId('offer-detail-badges')).toBeTruthy();
    expect(screen.getByText('offers.promoted')).toBeTruthy();
    expect(screen.getByText('offers.reported')).toBeTruthy();
    expect(screen.getByText('offers.reportedWarning')).toBeTruthy();
  });

  it('keeps the sheet open after an inline action until an explicit dismissal', async () => {
    await renderModal();
    await fireEvent.press(screen.getByText('offers.favorite'));

    expect(screen.getByTestId('offer-detail-sheet')).toBeTruthy();
    expect(mockOnClose).not.toHaveBeenCalled();
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

  it('uses platform glyphs for gallery navigation with unchanged labels and touch floors', async () => {
    await renderModal();

    expect(screen.queryByText('‹')).toBeNull();
    expect(screen.queryByText('›')).toBeNull();

    expect(within(screen.getByLabelText('offers.previousImage')).getByTestId('platform-glyph-chevronBackward')).toBeTruthy();
    expect(within(screen.getByLabelText('offers.nextImage')).getByTestId('platform-glyph-chevronForward')).toBeTruthy();

    for (const label of ['offers.previousImage', 'offers.nextImage']) {
      const button = screen.getByLabelText(label);
      expect(button.props.accessibilityRole).toBe('button');
      expect(StyleSheet.flatten(button.props.style).height).toBeGreaterThanOrEqual(platformTouchFloor);
    }
  });

  it('opens the image viewer in the same sheet system and restores focus on dismissal', async () => {
    const view = await renderModal();
    expect(screen.getAllByTestId('native-bottom-sheet')).toHaveLength(1);

    await fireEvent.press(view.getAllByTestId('offer-gallery-slide')[0]);

    expect(screen.getAllByTestId('native-bottom-sheet')).toHaveLength(2);
    expect(screen.getByTestId('offer-fullscreen-sheet')).toBeTruthy();
    expect(hostTypes(screen.toJSON())).not.toContain('Modal');

    await fireEvent(screen.getAllByTestId('native-bottom-sheet')[1], 'close');

    expect(screen.getAllByTestId('native-bottom-sheet')).toHaveLength(1);
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(mockRestoreFocus).toHaveBeenCalledTimes(1);
  });

  it('dismisses the image viewer through the same path from its labelled close action', async () => {
    const view = await renderModal();
    await fireEvent.press(view.getAllByTestId('offer-gallery-slide')[0]);

    await fireEvent.press(screen.getByRole('button', { name: 'offers.fullscreenClose' }));

    expect(screen.getAllByTestId('native-bottom-sheet')).toHaveLength(1);
    expect(mockRestoreFocus).toHaveBeenCalledTimes(1);
  });

  it('uses Material 3 icon buttons for gallery navigation and ripple surfaces for slides and actions (APP.PLATFORM.CHROME.001-R18)', async () => {
    await renderModal();

    expect(hasAncestor(screen.getByLabelText('offers.previousImage'), IconButton)).toBe(true);
    expect(hasAncestor(screen.getByLabelText('offers.nextImage'), IconButton)).toBe(true);
    expect(hasAncestor(screen.getAllByTestId('offer-gallery-slide')[0], TouchableRipple)).toBe(true);
    expect(hasAncestor(screen.getByTestId('offer-detail-action-directions'), TouchableRipple)).toBe(true);
  });

  it('uses a labelled Material 3 button to close the fullscreen viewer', async () => {
    const view = await renderModal();
    await fireEvent.press(view.getAllByTestId('offer-gallery-slide')[0]);

    expect(screen.getByRole('button', { name: 'offers.fullscreenClose' })).toBeTruthy();
    expect(hasAncestor(screen.getByTestId('offer-fullscreen-close'), Button)).toBe(true);
  });

  it('renders detail copy with Material 3 type roles (APP.TYPOGRAPHY.001-R7)', async () => {
    await renderModal();

    expect(hasVariant(screen.getAllByText('Main Street Cafe')[0], 'headlineSmall')).toBe(true);
    expect(hasVariant(screen.getByText('Coffee and snacks'), 'bodyMedium')).toBe(true);
  });

  it('tracks both stacked sheets in the shared sheet accounting', async () => {
    const view = await renderModal();
    expect(mockOpenSheet).toHaveBeenCalledTimes(1);

    await fireEvent.press(view.getAllByTestId('offer-gallery-slide')[0]);
    expect(mockOpenSheet).toHaveBeenCalledTimes(2);

    await view.unmount();
    expect(mockCloseSheet).toHaveBeenCalledTimes(2);
  });
});
