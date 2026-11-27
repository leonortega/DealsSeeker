import { render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import {
  ImmersiveActionIconGlyph,
  type ImmersiveActionIcon,
} from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveActionGlyphs';
import { ImmersiveOfferFeed } from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed';

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    palette: {
      accent: '#b85c38',
      accentMuted: '#e9c9b8',
      accentText: '#8a5a00',
      backdrop: '#121417',
      border: '#d7c9b5',
      card: '#fffdf8',
      danger: '#8d2f2f',
      highlight: '#0d7a5f',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      onAccent: '#ffffff',
      onDanger: '#ffffff',
      onHighlight: '#ffffff',
      panel: '#fff9f0',
      panelAlt: '#e6f0e6',
      overlay: 'rgba(22,30,28,0.52)',
    },
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useOfferImageUri', () => ({
  useOfferImageUri: () => null,
}));

describe('ImmersiveActionIconGlyph', () => {
  it.each<ImmersiveActionIcon>([
    'comments',
    'favorite',
    'directions',
    'votePositive',
    'voteNegative',
    'report',
  ])('renders a drawn SVG icon for %s', async (kind) => {
    await render(<ImmersiveActionIconGlyph kind={kind} />);

    expect(screen.root.type).toBe('RNSVGSvgView');
  });

  it('uses the accent color for an active action', async () => {
    await render(<ImmersiveActionIconGlyph active kind="favorite" />);

    expect(screen.root.props.stroke).toBe('#8a5a00');
  });

  it('uses ink for an inactive action', async () => {
    await render(<ImmersiveActionIconGlyph kind="favorite" />);

    expect(screen.root.props.stroke).toBe('#1f3128');
  });

  it('keeps the glyph out of the screen-reader order', async () => {
    await render(<ImmersiveActionIconGlyph kind="comments" />);

    expect(screen.root.props.accessible).toBe(false);
  });

  it('keeps the canonical rail vocabulary on both platforms', async () => {
    (Platform as unknown as { OS: string }).OS = 'ios';
    await render(<ImmersiveActionIconGlyph kind="favorite" />);
    expect(screen.root.type).toMatch(/^RNSVGSvgView/u);

    (Platform as unknown as { OS: string }).OS = 'android';
    await render(<ImmersiveActionIconGlyph kind="report" />);
    expect(screen.root.type).toMatch(/^RNSVGSvgView/u);
    expect(JSON.stringify(screen.toJSON())).not.toContain('ionicon-');
    expect(JSON.stringify(screen.toJSON())).not.toContain('materialicon-');
  });
});

describe('immersive placeholder imagery (APP.SYMBOL.VOCABULARY.001-R4)', () => {
  const offer = {
    offerId: 'o1',
    businessName: 'Cafe',
    description: 'Coffee',
    tags: [],
    imageUrl: '',
    imageUrls: [],
    isPromoted: false,
    isReported: false,
    isFavorite: false,
    distanceMeters: 100,
    hasCurrentUserVoted: false,
    positiveAvailabilityCount: 2,
    negativeAvailabilityCount: 1,
    location: { lat: 40.7, lng: -74 },
  } as never;

  async function renderFeed() {
    return await render(
      <ImmersiveOfferFeed
        offers={[offer]}
        onRadiusChange={jest.fn()}
        radiusMeters={1500}
        query=""
        onFavorite={jest.fn()}
        onVote={jest.fn()}
        onReport={jest.fn()}
        onDirections={jest.fn()}
        onComments={jest.fn()}
        onSearch={jest.fn()}
        feedTab="viewAll"
        onFeedTabChange={jest.fn()}
      />
    );
  }

  it('renders a labelled neutral panel instead of placeholder art', async () => {
    await renderFeed();

    expect(screen.getByText('add.photoPlaceholder')).toBeTruthy();
    expect(screen.queryByText('▤')).toBeNull();
    expect(screen.queryByText('▣')).toBeNull();
  });

  it('preserves the action rail, disclosure and gallery controls', async () => {
    await renderFeed();

    expect(screen.getByTestId('rail-action-directions')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'offers.action.more' })).toBeTruthy();
    expect(screen.queryByTestId('immersive-empty-state')).toBeNull();
  });
});
