import fs from 'fs';
import path from 'path';

const sourceRoot = path.resolve(__dirname, '../../../src/DealsSeeker.ReactNative/src');

describe('palette-derived chrome (APP.THEME.001-R10)', () => {
  it('does not hardcode footer icon colors in the navigator', () => {
    const source = fs.readFileSync(path.join(sourceRoot, 'navigation/AppNavigator.tsx'), 'utf8');
    expect(source).not.toMatch(/color=\{?'#[0-9a-fA-F]{6}'/);
  });

  it('does not hardcode white text literals in the immersive overlay', () => {
    const source = fs.readFileSync(path.join(sourceRoot, 'components/ImmersiveOfferFeed.tsx'), 'utf8');
    expect(source).not.toMatch(/color:\s*'#(fff|ffffff)'/);
  });

  it('wires the authored footer surface into the native tab bar options', () => {
    const navigator = fs.readFileSync(path.join(sourceRoot, 'navigation/AppNavigator.tsx'), 'utf8');
    expect(navigator).toMatch(/footerBarAppearance\(palette\)/);
    expect(navigator).toMatch(/tabBarActiveTintColor:\s*footer\.activeTintColor/);
    expect(navigator).toMatch(/tabBarStyle:/);
  });

  it('derives the status bar from the rendered route rather than the global immersive flag', () => {
    const app = fs.readFileSync(path.join(sourceRoot, '../App.tsx'), 'utf8');
    expect(app).toMatch(/resolveRouteChrome/);
    expect(app).not.toMatch(/resolveShellChrome\(immersiveOffers/);
    expect(app).toMatch(/'auth'/);
  });
});
