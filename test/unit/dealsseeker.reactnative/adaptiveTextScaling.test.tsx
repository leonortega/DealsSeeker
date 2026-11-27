import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
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

describe('chrome text scaling (APP.TYPOGRAPHY.001-R5 / APP.ACCESSIBILITY.UX.001-R9)', () => {
  it('lets footer labels grow past a 1.2x cap and wrap', async () => {
    await render(
      <AppFooterBar
        items={[{ key: 'suggestions', label: 'Suggestions', onPress: jest.fn() }]}
        palette={palette}
      />
    );

    const label = screen.getByText('Suggestions');
    expect(label.props.maxFontSizeMultiplier).toBeUndefined();
    expect(label.props.numberOfLines).toBeUndefined();
    expect(StyleSheet.flatten(label.props.style).flexShrink).toBeGreaterThan(0);
  });

  it('lets presentation switch labels grow with the system reading size', async () => {
    await render(
      <PresentationModeSwitch
        feedLabel="Feed"
        mapLabel="Map"
        onChange={jest.fn()}
        palette={palette}
        value="feed"
      />
    );

    const label = screen.getByText('Feed');
    expect(label.props.maxFontSizeMultiplier).toBeUndefined();
    expect(label.props.numberOfLines).toBeUndefined();
  });
});
