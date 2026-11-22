// Architectural fitness functions for the React Native client, run from the
// client directory: npm run test:arch
//
// Allowed dependency direction (arrows point to what may be imported):
//   screens -> components -> hooks -> context -> utils -> api
// A layer may also import layers to its left; no layer may import one to its right.

module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      comment: 'Circular imports between client modules make the graph untestable.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'api-is-a-leaf',
      comment: 'The transport layer must not import state or UI modules.',
      severity: 'error',
      from: { path: '^src/api/' },
      to: { path: '^src/(components|context|hooks|screens)/' },
    },
    {
      name: 'utils-only-use-api',
      comment: 'Pure helpers may use contracts but must not reach into state or UI.',
      severity: 'error',
      from: { path: '^src/utils/' },
      to: { path: '^src/(components|context|hooks|screens)/' },
    },
    {
      name: 'context-does-not-use-ui',
      comment: 'Global state must not depend on screens, components or hooks.',
      severity: 'error',
      from: { path: '^src/context/' },
      to: { path: '^src/(components|hooks|screens)/' },
    },
    {
      name: 'hooks-do-not-use-ui',
      comment: 'Hooks are reusable and must not import screens or components.',
      severity: 'error',
      from: { path: '^src/hooks/' },
      to: { path: '^src/(components|screens)/' },
    },
    {
      name: 'components-do-not-use-screens',
      comment: 'A component must never depend on the screen that hosts it.',
      severity: 'error',
      from: { path: '^src/components/' },
      to: { path: '^src/screens/' },
    },
  ],
  options: {
    tsConfig: { fileName: 'tsconfig.json' },
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '^src/stubs/' },
  },
};
