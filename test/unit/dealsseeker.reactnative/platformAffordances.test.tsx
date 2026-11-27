import { fireEvent, render, screen } from '@testing-library/react-native';
import fs from 'fs';
import path from 'path';
import { Platform, StyleSheet, View } from 'react-native';
import { CreateOfferFab } from '../../../src/DealsSeeker.ReactNative/src/components/CreateOfferFab';
import { ImmersiveOfferFeed } from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed';
import { OfferTopBar } from '../../../src/DealsSeeker.ReactNative/src/components/OfferTopBar';
import { PresentationModeSwitch } from '../../../src/DealsSeeker.ReactNative/src/components/PresentationModeSwitch';
import { platformTouchFloor, touchFloor } from '../../../src/DealsSeeker.ReactNative/src/utils/layout';
import type { Palette } from '../../../src/DealsSeeker.ReactNative/src/utils/theme';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const glyph = (prefix: string) => ({ name, ...props }: { name: string }) =>
    React.createElement(Text, { ...props, testID: `${prefix}-${name}` });
  return { Ionicons: glyph('ionicon'), MaterialIcons: glyph('materialicon') };
});

const ReactNative = jest.requireActual<typeof import('react-native')>('react-native');
jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({
  width: 900,
  height: 700,
  fontScale: 1,
  scale: 2,
} as never);

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
    },
    t: (key: string) => key,
  }),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useOfferImageUri', () => ({
  useOfferImageUri: () => null,
}));

const palette = { accent: '#ce4719', border: '#8b857e', ink: '#18181b', onAccent: '#ffffff', panel: '#ffffff' } as Palette;

const galleryOffer = {
  offerId: 'o1',
  businessName: 'Cafe',
  description: 'Coffee',
  tags: [],
  imageUrl: '',
  imageUrls: ['https://example.com/one.png', 'https://example.com/two.png'],
  isPromoted: false,
  isReported: false,
  isFavorite: false,
  distanceMeters: 100,
  hasCurrentUserVoted: false,
  positiveAvailabilityCount: 2,
  negativeAvailabilityCount: 1,
  location: { lat: 40.7, lng: -74 },
} as never;

function setPlatform(os: 'ios' | 'android') {
  (Platform as unknown as { OS: string }).OS = os;
}

function glyph(id: string) {
  return screen.getByTestId(id, { includeHiddenElements: true });
}

function renderGallery() {
  return render(
    <ImmersiveOfferFeed
      offers={[galleryOffer]}
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

describe('platform-native touch affordances (APP.SHELL.002-R11)', () => {
  beforeEach(() => setPlatform('ios'));

  it('uses the larger touch floor on Android and the standard floor on iOS', () => {
    expect(touchFloor('android')).toBe(48);
    expect(touchFloor('ios')).toBe(44);
  });

  it('uses native press feedback on the presentation switch', async () => {
    await render(
      <PresentationModeSwitch feedLabel="Feed" mapLabel="Map" onChange={jest.fn()} palette={palette} value="feed" />
    );

    expect(screen.getByRole('tab', { name: 'Feed' })).toBeTruthy();
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../../src/DealsSeeker.ReactNative/src/components/PresentationModeSwitch.tsx'),
      'utf8'
    );
    expect(source).toMatch(/android_ripple/);
  });

  it('uses the one platform vocabulary for the Create action', async () => {
    await render(<CreateOfferFab label="Create" onPress={jest.fn()} palette={palette} />);
    expect(glyph('ionicon-add-circle-outline')).toBeTruthy();

    setPlatform('android');
    await render(<CreateOfferFab label="Create" onPress={jest.fn()} palette={palette} />);
    expect(glyph('materialicon-add-circle-outline')).toBeTruthy();
  });

  it('uses the one platform vocabulary for top-bar search without changing its action', async () => {
    const onSearch = jest.fn();
    await render(
      <OfferTopBar
        headerControl={<View />}
        helpControl={<View />}
        isNarrow={false}
        onSearch={onSearch}
        palette={{ ...palette, ink: '#18181b', panel: '#ffffff' } as Palette}
        searchLabel="Search"
        title="Offers"
        titleColor="#ffffff"
      />
    );
    expect(glyph('ionicon-search-outline')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Search' }));
    expect(onSearch).toHaveBeenCalledTimes(1);

    setPlatform('android');
    await render(
      <OfferTopBar
        headerControl={<View />}
        helpControl={<View />}
        isNarrow={false}
        onSearch={onSearch}
        palette={{ ...palette, ink: '#18181b', panel: '#ffffff' } as Palette}
        searchLabel="Search"
        title="Offers"
        titleColor="#ffffff"
      />
    );
    expect(glyph('materialicon-search')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Search' }));
    expect(onSearch).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['ios', 'ionicon-chevron-back-outline', 'ionicon-chevron-forward-outline'],
    ['android', 'materialicon-chevron-left', 'materialicon-chevron-right'],
  ] as const)('uses %s gallery glyphs with labels and the touch floor intact', async (os, previous, next) => {
    setPlatform(os);
    await renderGallery();

    const previousButton = screen.getByRole('button', { name: 'offers.previousImage' });
    const nextButton = screen.getByRole('button', { name: 'offers.nextImage' });
    expect(glyph(previous)).toBeTruthy();
    expect(glyph(next)).toBeTruthy();
    expect(screen.queryByText('‹')).toBeNull();
    expect(screen.queryByText('›')).toBeNull();
    expect(StyleSheet.flatten(previousButton.props.style).height).toBe(platformTouchFloor);
    expect(StyleSheet.flatten(nextButton.props.style).width).toBe(platformTouchFloor);
  });
});
