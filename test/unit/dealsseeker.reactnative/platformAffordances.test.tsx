import { render, screen } from '@testing-library/react-native';
import fs from 'fs';
import path from 'path';
import { PresentationModeSwitch } from '../../../src/DealsSeeker.ReactNative/src/components/PresentationModeSwitch';
import { touchFloor } from '../../../src/DealsSeeker.ReactNative/src/utils/layout';
import type { Palette } from '../../../src/DealsSeeker.ReactNative/src/utils/theme';

const palette = { accent: '#ce4719', border: '#8b857e', ink: '#18181b', onAccent: '#ffffff', panel: '#ffffff' } as Palette;

describe('platform-native touch affordances (APP.SHELL.002-R11)', () => {
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
});
