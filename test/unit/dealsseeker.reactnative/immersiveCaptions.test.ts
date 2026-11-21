import { shouldShowImmersiveCaptions } from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed';

describe('shouldShowImmersiveCaptions', () => {
  it('hides captions on narrow screens', () => {
    expect(shouldShowImmersiveCaptions(true, 1)).toBe(false);
  });

  it('shows captions on wide screens at normal text size', () => {
    expect(shouldShowImmersiveCaptions(false, 1)).toBe(true);
  });

  it('hides captions once text scaling reaches 150 percent', () => {
    expect(shouldShowImmersiveCaptions(false, 1.5)).toBe(false);
  });

  it('hides captions at 200 percent text size', () => {
    expect(shouldShowImmersiveCaptions(false, 2)).toBe(false);
  });

  it('hides captions when vertical space is too short for the action rail', () => {
    expect(shouldShowImmersiveCaptions(false, 1, 550)).toBe(false);
    expect(shouldShowImmersiveCaptions(false, 1, 700)).toBe(true);
  });
});
