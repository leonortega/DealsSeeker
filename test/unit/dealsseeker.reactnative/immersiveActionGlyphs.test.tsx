import { render, screen } from '@testing-library/react-native';
import {
  ImmersiveActionIconGlyph,
  type ImmersiveActionIcon,
} from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveActionGlyphs';

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    palette: { accent: '#b85c38', ink: '#1f3128', inkMuted: '#5f6d63' },
  }),
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

    expect(screen.root.props.stroke).toBe('#b85c38');
  });

  it('uses ink for an inactive action', async () => {
    await render(<ImmersiveActionIconGlyph kind="favorite" />);

    expect(screen.root.props.stroke).toBe('#1f3128');
  });

  it('keeps the glyph out of the screen-reader order', async () => {
    await render(<ImmersiveActionIconGlyph kind="comments" />);

    expect(screen.root.props.accessible).toBe(false);
  });
});
