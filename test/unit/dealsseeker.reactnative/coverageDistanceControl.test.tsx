import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';

Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });

const { CoverageDistanceControl } =
  require('../../../src/DealsSeeker.ReactNative/src/components/CoverageDistanceControl') as typeof import('../../../src/DealsSeeker.ReactNative/src/components/CoverageDistanceControl');
const { platformTouchFloor } =
  require('../../../src/DealsSeeker.ReactNative/src/utils/layout') as typeof import('../../../src/DealsSeeker.ReactNative/src/utils/layout');

jest.mock('../../../src/DealsSeeker.ReactNative/src/components/NativeBottomSheet', () => {
  const { View: MockView } = require('react-native');
  return {
    NativeBottomSheet: ({ visible, children }: { visible: boolean; children: React.ReactNode }) =>
      visible ? <MockView testID="native-bottom-sheet">{children}</MockView> : null,
  };
});

const palette = { accent: '#ce4719', accentMuted: '#fbe6df', accentText: '#b83b12', border: '#8b857e', card: '#ffffff', ink: '#18181b', inkMuted: '#52525b', panel: '#ffffff' } as never;
const t = (key: string) => key;

describe('CoverageDistanceControl (OFFERS.FILTER.SIMPLIFICATION.001)', () => {
  it('shows one control with the current distance', async () => {
    await render(<CoverageDistanceControl radiusMeters={1500} onChange={jest.fn()} palette={palette} t={t} />);

    const control = screen.getByRole('button', { name: /1500 m/ });
    expect(control).toBeTruthy();
    expect(screen.queryByRole('button', { name: '500 m' })).toBeNull();
  });

  it('opens the full distance list and applies a selection', async () => {
    const onChange = jest.fn();
    await render(<CoverageDistanceControl radiusMeters={1500} onChange={onChange} palette={palette} t={t} />);

    await fireEvent.press(screen.getByRole('button', { name: /1500 m/ }));
    expect(screen.getByRole('radio', { name: '500 m' }).props.accessibilityState).toEqual({ selected: false });
    expect(screen.getByRole('radio', { name: '1500 m' }).props.accessibilityState).toEqual({ selected: true });

    await fireEvent.press(screen.getByRole('radio', { name: '500 m' }));
    expect(onChange).toHaveBeenCalledWith(500);
  });

  it('gives the chip and every radius option the platform touch floor', async () => {
    await render(<CoverageDistanceControl radiusMeters={1500} onChange={jest.fn()} palette={palette} t={t} />);
    await fireEvent.press(screen.getByRole('button', { name: /1500 m/ }));

    expect(StyleSheet.flatten(screen.getByRole('button', { name: /1500 m/ }).props.style).minHeight).toBeGreaterThanOrEqual(platformTouchFloor);
    for (const option of ['500 m', '1000 m', '1500 m', '2500 m', '5000 m']) {
      expect(StyleSheet.flatten(screen.getByRole('radio', { name: option }).props.style).minHeight).toBeGreaterThanOrEqual(platformTouchFloor);
    }
  });

  it('uses the 48-unit Android touch floor', async () => {
    expect(platformTouchFloor).toBe(48);

    await render(<CoverageDistanceControl radiusMeters={1500} onChange={jest.fn()} palette={palette} t={t} />);
    await fireEvent.press(screen.getByRole('button', { name: /1500 m/ }));

    expect(StyleSheet.flatten(screen.getByRole('button', { name: /1500 m/ }).props.style).minHeight).toBeGreaterThanOrEqual(48);
    for (const option of ['500 m', '1000 m']) {
      expect(StyleSheet.flatten(screen.getByRole('radio', { name: option }).props.style).minHeight).toBeGreaterThanOrEqual(48);
    }
  });
});
