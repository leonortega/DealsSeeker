import { render, screen } from '@testing-library/react-native';
import { AppFooterBar } from '../../../src/DealsSeeker.ReactNative/src/components/AppFooterBar';
import { PresentationModeSwitch } from '../../../src/DealsSeeker.ReactNative/src/components/PresentationModeSwitch';
import type { Palette } from '../../../src/DealsSeeker.ReactNative/src/utils/theme';

const palette = {
  accent: '#ce4719',
  background: '#faf8f5',
  border: '#8b857e',
  card: '#ffffff',
  ink: '#18181b',
  inkMuted: '#52525b',
  panel: '#ffffff',
  panelAlt: '#e7f7f1',
  onAccent: '#ffffff',
  backdrop: '#121417',
  footerActive: '#5a2e20',
} as Palette;

describe('chrome text scaling', () => {
  it('bounds footer label scaling so a long label cannot wrap mid-word', async () => {
    await render(
      <AppFooterBar
        items={[{ key: 'suggestions', label: 'Suggestions', onPress: jest.fn() }]}
        palette={palette}
      />
    );

    const label = screen.getByText('Suggestions');
    expect(label.props.maxFontSizeMultiplier).toBeGreaterThan(1);
    expect(label.props.numberOfLines).toBe(1);
  });

  it('bounds presentation switch label scaling', async () => {
    await render(
      <PresentationModeSwitch
        feedLabel="Feed"
        mapLabel="Map"
        onChange={jest.fn()}
        palette={palette}
        value="feed"
      />
    );

    expect(screen.getByText('Feed').props.maxFontSizeMultiplier).toBeGreaterThan(1);
  });
});
