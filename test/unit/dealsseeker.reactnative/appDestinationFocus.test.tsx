import { useRef } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import { act, render } from '@testing-library/react-native';
import {
  resolveDestinationKey,
  useDestinationFocus,
} from '../../../src/DealsSeeker.ReactNative/src/hooks/useDestinationFocus';

type OverlayRoute = { name: string } | null;

function Probe({ tab, overlay }: { tab: 'offers' | 'reports'; overlay?: OverlayRoute }) {
  const containerRef = useRef<View>(null);
  useDestinationFocus(containerRef, tab, overlay ?? null, (key) => `t:${key}`);
  return <View ref={containerRef} />;
}

describe('destination focus', () => {
  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
    jest.spyOn(AccessibilityInfo, 'setAccessibilityFocus').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps destinations to their localized labels', () => {
    expect(resolveDestinationKey('reports', null)).toBe('nav.reports');
    expect(resolveDestinationKey('offers', { name: 'favorites' })).toBe('nav.favorites');
    expect(resolveDestinationKey('offers', { name: 'add-offer' })).toBe('nav.addOffer');
  });

  it('announces the destination when it changes', async () => {
    const view = await render(<Probe tab="offers" />);

    await act(async () => {
      view.rerender(<Probe tab="reports" />);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('t:nav.reports');
  });

  it('announces the restored destination when Back returns to Offers', async () => {
    const view = await render(<Probe tab="reports" />);

    await act(async () => {
      view.rerender(<Probe tab="offers" />);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('t:nav.offers');
  });

  it('does not repeat an announcement for the same destination', async () => {
    const view = await render(<Probe tab="offers" />);

    await act(async () => {
      view.rerender(<Probe tab="offers" />);
    });

    expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();
  });

  it('moves focus to the destination container', async () => {
    await render(<Probe tab="reports" />);

    expect(AccessibilityInfo.setAccessibilityFocus).toHaveBeenCalled();
  });
});
