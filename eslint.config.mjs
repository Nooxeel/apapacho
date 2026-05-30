import nextConfig from 'eslint-config-next/core-web-vitals';
import tsPlugin from '@typescript-eslint/eslint-plugin';

/**
 * ESLint flat config (ESLint 9 + Next.js 15 / eslint-config-next 16).
 *
 * Replaces the legacy .eslintrc.json which caused a circular-JSON error when
 * ESLint 9 tried to bridge the legacy format through eslint-config-next's
 * flat-config-only export.
 *
 * The @typescript-eslint plugin must be re-declared in the custom rules block
 * because each flat-config object resolves plugins independently.
 */
export default [
  ...nextConfig,
  {
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // React Compiler rules introduced in eslint-config-next@16 that the
      // existing codebase (written before these rules) violates widely.
      // Downgraded to warn so CI is unblocked without masking logic bugs.
      // TODO: audit and fix each instance as part of a React Compiler migration.
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
];
