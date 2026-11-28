import { render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import {
  PlatformTabIcon,
  MATERIAL_SYMBOL_ICONS,
  type PlatformTabIconName,
} from '../../../src/DealsSeeker.ReactNative/src/components/PlatformTabIcon';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const glyph = (prefix: string) => ({ name, ...props }: { name: string }) =>
    React.createElement(Text, { ...props, testID: `${prefix}-${name}` });
  return {
    Ionicons: glyph('ionicon'),
    MaterialIcons: glyph('materialicon'),
    MaterialCommunityIcons: glyph('materialcommunityicon'),
  };
});

const chromeNames: PlatformTabIconName[] = [
  'account',
  'suggestions',
  'offers',
  'explore',
  'create',
  'search',
  'help',
  'favorites',
  'report',
  'chat',
  'thumbUp',
  'eventAvailable',
  'chevronForward',
  'chevronBackward',
];

function setPlatform(os: 'ios' | 'android') {
  (Platform as unknown as { OS: string }).OS = os;
}

function glyph(id: string) {
  return screen.getByTestId(id, { includeHiddenElements: true });
}

describe('one platform symbol vocabulary (APP.SYMBOL.VOCABULARY.001)', () => {
  beforeEach(() => setPlatform('ios'));

  it.each(chromeNames)('uses an iOS symbol for %s', async (name) => {
    await render(<PlatformTabIcon color="#ffffff" name={name} />);

    expect(screen.root.props.testID).toMatch(/^ionicon-/u);
  });

  it.each(chromeNames)('uses one Material Symbols vocabulary for %s on Android', async (name) => {
    setPlatform('android');
    await render(<PlatformTabIcon color="#ffffff" name={name} />);

    expect(screen.root.props.testID).toMatch(/^materialcommunityicon-/u);
    expect(screen.queryByTestId(/^materialicon-/u, { includeHiddenElements: true })).toBeNull();
    expect(screen.queryByTestId(/^ionicon-/u, { includeHiddenElements: true })).toBeNull();
  });

  it('maps chrome and gallery controls to distinct iOS glyph names', async () => {
    await render(<PlatformTabIcon color="#ffffff" name="create" />);
    expect(screen.root.props.testID).toBe('ionicon-add');

    await render(<PlatformTabIcon color="#ffffff" name="search" />);
    expect(glyph('ionicon-search')).toBeTruthy();

    await render(<PlatformTabIcon color="#ffffff" name="help" />);
    expect(glyph('ionicon-help')).toBeTruthy();

    await render(<PlatformTabIcon color="#ffffff" name="chevronForward" />);
    expect(glyph('ionicon-chevron-forward-outline')).toBeTruthy();

    await render(<PlatformTabIcon color="#ffffff" name="chevronBackward" />);
    expect(glyph('ionicon-chevron-back-outline')).toBeTruthy();
  });

  it('maps Android chrome roles to the verified Material Symbols vocabulary shared with Paper', async () => {
    expect(MATERIAL_SYMBOL_ICONS).toMatchObject({
      create: 'plus',
      search: 'magnify',
      help: 'help',
      explore: 'compass',
      nearby: 'near-me',
      favorite: 'heart',
      report: 'flag',
      chat: 'chat',
      thumbUp: 'thumb-up',
      eventAvailable: 'calendar-check',
    });

    setPlatform('android');
    await render(<PlatformTabIcon color="#ffffff" name="create" />);
    expect(screen.root.props.testID).toBe(`materialcommunityicon-${MATERIAL_SYMBOL_ICONS.create}`);

    await render(<PlatformTabIcon color="#ffffff" name="search" />);
    expect(glyph(`materialcommunityicon-${MATERIAL_SYMBOL_ICONS.search}`)).toBeTruthy();

    await render(<PlatformTabIcon color="#ffffff" name="help" />);
    expect(glyph(`materialcommunityicon-${MATERIAL_SYMBOL_ICONS.help}`)).toBeTruthy();

    await render(<PlatformTabIcon color="#ffffff" name="favorites" />);
    expect(glyph(`materialcommunityicon-${MATERIAL_SYMBOL_ICONS.favorite}`)).toBeTruthy();

    await render(<PlatformTabIcon color="#ffffff" name="report" />);
    expect(glyph(`materialcommunityicon-${MATERIAL_SYMBOL_ICONS.report}`)).toBeTruthy();

    await render(<PlatformTabIcon color="#ffffff" name="chat" />);
    expect(glyph(`materialcommunityicon-${MATERIAL_SYMBOL_ICONS.chat}`)).toBeTruthy();

    await render(<PlatformTabIcon color="#ffffff" name="thumbUp" />);
    expect(glyph(`materialcommunityicon-${MATERIAL_SYMBOL_ICONS.thumbUp}`)).toBeTruthy();

    await render(<PlatformTabIcon color="#ffffff" name="eventAvailable" />);
    expect(glyph(`materialcommunityicon-${MATERIAL_SYMBOL_ICONS.eventAvailable}`)).toBeTruthy();

    await render(<PlatformTabIcon color="#ffffff" name="offers" />);
    expect(glyph(`materialcommunityicon-${MATERIAL_SYMBOL_ICONS.nearby}`)).toBeTruthy();

    await render(<PlatformTabIcon color="#ffffff" name="explore" />);
    expect(glyph(`materialcommunityicon-${MATERIAL_SYMBOL_ICONS.explore}`)).toBeTruthy();
  });

  it('uses Paper\'s back glyph on Android overlays without a second vocabulary', async () => {
    setPlatform('android');
    await render(<PlatformTabIcon color="#ffffff" name="chevronBackward" />);

    expect(screen.root.props.testID).toBe('materialcommunityicon-arrow-left');
    await render(<PlatformTabIcon color="#ffffff" name="chevronForward" />);
    expect(glyph('materialcommunityicon-chevron-right')).toBeTruthy();
  });

  it('keeps decorative glyphs out of the screen-reader order', async () => {
    await render(<PlatformTabIcon color="#ffffff" name="help" />);

    expect(screen.root.props.accessible).toBe(false);
    expect(screen.root.props.accessibilityElementsHidden).toBe(true);
  });
});
