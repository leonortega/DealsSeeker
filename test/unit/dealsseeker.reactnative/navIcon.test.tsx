import { render, screen } from '@testing-library/react-native';
import { NavIcon, type NavIconName } from '../../../src/DealsSeeker.ReactNative/src/components/NavIcon';

describe('NavIcon', () => {
  it.each<NavIconName>(['account', 'suggestions', 'reports', 'offers', 'create', 'search'])(
    'renders a drawn SVG icon for %s',
    async (name) => {
      await render(<NavIcon color="#ffffff" name={name} />);

      expect(screen.root.type).toBe('RNSVGSvgView');
    }
  );

  it('keeps the decorative icon out of the screen-reader order', async () => {
    await render(<NavIcon color="#ffffff" name="offers" />);

    expect(screen.root.props.accessible).toBe(false);
  });

  it('applies the requested color to the drawing', async () => {
    await render(<NavIcon color="#b85c38" name="reports" />);

    expect(screen.root.props.stroke).toBe('#b85c38');
  });
});
