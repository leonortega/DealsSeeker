import { useRef } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import { act, render } from '@testing-library/react-native';
import {
  resolveDestinationKey,
  useDestinationFocus,
} from '../../../src/DealsSeeker.ReactNative/src/hooks/useDestinationFocus';

type OverlayRoute = { name: string } | null;

function Probe({ tab, overlay }: { tab: 'offers' | 'suggestions'; overlay?: OverlayRoute }) {
  const containerRef = useRef<View>(null);
  useDestinationFocus(containerRef, tab, overlay ?? null, (key) => `t:${key}`, () => 123);
  return <View ref={containerRef} />;
}

describe('destination focus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
    jest.spyOn(AccessibilityInfo, 'setAccessibilityFocus').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps destinations to their localized labels', () => {
    expect(resolveDestinationKey('offers', { name: 'favorites' })).toBe('nav.favorites');
    expect(resolveDestinationKey('offers', { name: 'add-offer' })).toBe('nav.addOffer');
  });

  it('announces the destination when it changes', async () => {
    const view = await render(<Probe tab="offers" />);

    await act(async () => {
      view.rerender(<Probe tab="suggestions" />);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('t:nav.suggestions');
  });

  it('announces the restored destination when Back returns to Offers', async () => {
    const view = await render(<Probe tab="suggestions" />);

    await act(async () => {
      view.rerender(<Probe tab="offers" />);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('t:nav.offers');
  });

  it('does not repeat an announcement for the same destination', async () => {
    const view = await render(<Probe tab="offers" />);
    jest.clearAllMocks();

    await act(async () => {
      view.rerender(<Probe tab="offers" />);
    });

    expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();
  });

  it('moves focus to the destination container', async () => {
    await render(<Probe tab="suggestions" />);

    expect(AccessibilityInfo.setAccessibilityFocus).toHaveBeenCalled();
  });
});
