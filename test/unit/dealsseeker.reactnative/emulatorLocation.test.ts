import { resolveEmulatorLocation } from '../../../src/DealsSeeker.ReactNative/src/utils/emulatorLocation';

const key = 'EXPO_PUBLIC_EMULATOR_LOCATION';

describe('resolveEmulatorLocation (APP.LOCATION.DEV.001)', () => {
  const original = process.env[key];

  afterEach(() => {
    if (original === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = original;
    }
  });

  it('parses a valid configured position', () => {
    process.env[key] = '40.7128,-74.006';
    expect(resolveEmulatorLocation()).toEqual({ lat: 40.7128, lng: -74.006 });
  });

  it('ignores a missing or malformed value', () => {
    delete process.env[key];
    expect(resolveEmulatorLocation()).toBeNull();

    process.env[key] = 'not-a-position';
    expect(resolveEmulatorLocation()).toBeNull();

    process.env[key] = '40.7128';
    expect(resolveEmulatorLocation()).toBeNull();
  });

  it('ignores coordinates outside valid ranges', () => {
    process.env[key] = '95.1,-74.006';
    expect(resolveEmulatorLocation()).toBeNull();

    process.env[key] = '40.7128,-200';
    expect(resolveEmulatorLocation()).toBeNull();
  });
});
