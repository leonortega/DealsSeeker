// Naming and placement checks for the client source tree.
// Run from the React Native client directory via `npm run test:arch`.
const fs = require('fs');
const path = require('path');

const src = path.resolve(process.cwd(), 'src');
const failures = [];

function filesIn(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(full) : [full];
  });
}

const all = filesIn(src);

for (const file of all) {
  const relative = path.relative(src, file).replace(/\\/g, '/');
  const base = path.basename(file);

  if (relative.startsWith('stubs/')) continue;

  if (relative.startsWith('hooks/')) {
    if (!/^use[A-Z]/.test(base)) failures.push(`hook must start with 'use': ${relative}`);
  }

  if (relative.startsWith('components/') || relative.startsWith('screens/')) {
    if (!/^[A-Z][A-Za-z0-9]*\.tsx$/.test(base)) failures.push(`UI module must be PascalCase .tsx: ${relative}`);
  }

  if (base.endsWith('.js')) failures.push(`unexpected JavaScript file in src: ${relative}`);
}

if (failures.length > 0) {
  console.error('Naming convention violations:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`Naming conventions OK (${all.length} files checked)`);
