import { render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { NavIcon } from '../../../src/DealsSeeker.ReactNative/src/components/NavIcon';
import {
  PlatformTabIcon,
  type PlatformTabIconName,
} from '../../../src/DealsSeeker.ReactNative/src/components/PlatformTabIcon';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const glyph = (prefix: string) => ({ name, ...props }: { name: string }) =>
    React.createElement(Text, { ...props, testID: `${prefix}-${name}` });
  return { Ionicons: glyph('ionicon'), MaterialIcons: glyph('materialicon') };
});

const chromeNames: PlatformTabIconName[] = [
  'account',
  'suggestions',
  'offers',
  'create',
  'search',
  'help',
  'favorites',
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

  it.each(chromeNames)('uses a Material symbol for %s', async (name) => {
    setPlatform('android');
    await render(<PlatformTabIcon color="#ffffff" name={name} />);

    expect(screen.root.props.testID).toMatch(/^materialicon-/u);
  });

  it('maps chrome and gallery controls to distinct platform glyph names', async () => {
    await render(<PlatformTabIcon color="#ffffff" name="create" />);
    expect(screen.root.props.testID).toBe('ionicon-add-circle-outline');

    await render(<PlatformTabIcon color="#ffffff" name="search" />);
    expect(glyph('ionicon-search-outline')).toBeTruthy();

    await render(<PlatformTabIcon color="#ffffff" name="help" />);
    expect(glyph('ionicon-help-circle-outline')).toBeTruthy();

    await render(<PlatformTabIcon color="#ffffff" name="chevronForward" />);
    expect(glyph('ionicon-chevron-forward-outline')).toBeTruthy();

    await render(<PlatformTabIcon color="#ffffff" name="chevronBackward" />);
    expect(glyph('ionicon-chevron-back-outline')).toBeTruthy();
  });

  it('maps Android chrome and gallery controls to Material glyph names', async () => {
    setPlatform('android');
    await render(<PlatformTabIcon color="#ffffff" name="search" />);
    expect(screen.root.props.testID).toBe('materialicon-search');

    await render(<PlatformTabIcon color="#ffffff" name="help" />);
    expect(glyph('materialicon-help-outline')).toBeTruthy();

    await render(<PlatformTabIcon color="#ffffff" name="chevronForward" />);
    expect(glyph('materialicon-chevron-right')).toBeTruthy();

    await render(<PlatformTabIcon color="#ffffff" name="chevronBackward" />);
    expect(glyph('materialicon-chevron-left')).toBeTruthy();
  });

  it('keeps decorative glyphs out of the screen-reader order', async () => {
    await render(<PlatformTabIcon color="#ffffff" name="help" />);

    expect(screen.root.props.accessible).toBe(false);
    expect(screen.root.props.accessibilityElementsHidden).toBe(true);
  });

  it('routes the legacy NavIcon help control through the same vocabulary', async () => {
    setPlatform('android');
    await render(<NavIcon color="#ffffff" name="help" />);

    expect(screen.root.props.testID).toBe('materialicon-help-outline');
    expect(JSON.stringify(screen.toJSON())).not.toContain('RNSVGSvgView');
  });
});
