import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import jest from 'eslint-plugin-jest';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  { ignores: ['node_modules/', 'dist/', 'coverage/'] },
  {
    files: [
      'src/**/*.{js,mjs,cjs,ts}',
      'src/*.{js,mjs,cjs,ts}',
      'src/__tests__/**/*.{js,mjs,cjs,ts}',
    ],
  },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/__tests__/**/*.{js,mjs,cjs,ts}'],
    ...jest.configs['flat/recommended'],
    // Jest Rules
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/prefer-expect-assertions': 'off',
    },
  },
  // Eslint Rules
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  // Prettier
  eslintConfigPrettier,
];
