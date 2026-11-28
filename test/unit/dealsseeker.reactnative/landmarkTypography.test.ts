import fs from 'fs';
import path from 'path';
import { materialTypeScale } from '../../../src/DealsSeeker.ReactNative/src/utils/theme';

describe('Material 3 type system (APP.TYPOGRAPHY.001-R1)', () => {
  const sourceRoot = path.resolve(__dirname, '../../../src/DealsSeeker.ReactNative/src');

  function collectSourceFiles(directory: string): string[] {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectSourceFiles(fullPath);
      }
      return /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
    });
  }

  it('has no serif landmark face or helper in application source', () => {
    const offenders = collectSourceFiles(sourceRoot).filter((file) => {
      const source = fs.readFileSync(file, 'utf8');
      return /landmarkFontFamily/.test(source) || /fontFamily:\s*['"](Georgia|serif)['"]/.test(source);
    });

    expect(offenders).toEqual([]);
  });

  it('uses the Material 3 type scale tokens for every role', () => {
    expect(Object.keys(materialTypeScale).sort()).toEqual([
      'bodyLarge',
      'bodyMedium',
      'headlineSmall',
      'labelLarge',
      'labelMedium',
      'titleLarge',
    ]);
    Object.values(materialTypeScale).forEach((token) => {
      expect(token.fontSize).toBeGreaterThan(0);
      expect(token.lineHeight).toBeGreaterThan(0);
    });
  });
});
