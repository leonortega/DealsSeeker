import fs from 'fs';
import path from 'path';
import { landmarkFontFamily } from '../../../src/DealsSeeker.ReactNative/src/utils/typography';

describe('landmark font family (APP.TYPOGRAPHY.001-R1)', () => {
  it('uses the authored face on iOS', () => {
    expect(landmarkFontFamily('ios')).toBe('Georgia');
  });

  it('uses an equivalent platform serif on Android', () => {
    expect(landmarkFontFamily('android')).toBe('serif');
  });
});

describe('landmark font usage', () => {
  const sourceRoot = path.resolve(__dirname, '../../../src/DealsSeeker.ReactNative/src');

  function collectSourceFiles(directory: string): string[] {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectSourceFiles(fullPath);
      }
      return fullPath.endsWith('.tsx') ? [fullPath] : [];
    });
  }

  it('has no inline Georgia literals in component styles', () => {
    const offenders = collectSourceFiles(sourceRoot).filter((file) =>
      /fontFamily:\s*'Georgia'/.test(fs.readFileSync(file, 'utf8'))
    );

    expect(offenders).toEqual([]);
  });
});
