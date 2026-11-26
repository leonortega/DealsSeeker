import { shouldShowImmersiveCaptions } from '../../../src/DealsSeeker.ReactNative/src/components/ImmersiveOfferFeed';

describe('shouldShowImmersiveCaptions', () => {
  it('shows captions on a phone-sized viewport', () => {
    expect(shouldShowImmersiveCaptions(700)).toBe(true);
  });

  it('hides captions only when measured vertical space is too short', () => {
    expect(shouldShowImmersiveCaptions(550)).toBe(false);
  });

  it('keeps captions at the minimum rail height', () => {
    expect(shouldShowImmersiveCaptions(640)).toBe(true);
  });
});
