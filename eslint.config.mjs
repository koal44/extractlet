// import js from '@eslint/js';
// import globals from 'globals';
// import { defineConfig } from 'eslint/config';

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
      'no-explicit-any': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      
    }
  },
  {
    ignores: ['dist/**', '**/gen/**'],
  }
);

// export default defineConfig([
//   {
//     files: ['**/*.{js,mjs,cjs}'],
//     plugins: { js },
//     extends: ['js/recommended'],
//     rules: {
//       'no-unused-vars': 'warn',
//       'no-undef': 'error',
//       eqeqeq: 'warn',
//       semi: ['warn', 'always'],
//       quotes: ['warn', 'single'],
//       'no-console': 'off',
//       'no-debugger': 'off',
//       'no-var': 'error',
//       'prefer-const': 'warn',
//       'arrow-spacing': ['warn', { before: true, after: true }],
//       'comma-dangle': ['warn', {
//         'arrays': 'always-multiline',
//         'objects': 'always-multiline',
//         'imports': 'always-multiline',
//         'exports': 'always-multiline',
//         'functions': 'never',
//       }],
//       'object-curly-spacing': ['warn', 'always'],
//       'array-bracket-spacing': ['warn', 'never'],
//       'block-spacing': ['warn', 'always'],
//       'keyword-spacing': ['warn', { before: true, after: true }],
//       'space-before-blocks': ['warn', 'always'],
//     },
//   },
//   {
//     files: ['**/*.js'],
//     languageOptions: { sourceType: 'module' },
//   },
//   {
//     files: ['src/**/*.js'],
//     languageOptions: {
//       globals: {
//         ...globals.browser,
//         process: 'readonly',
//         module: 'readonly',
//       },
//     },
//   },
//   {
//     files: ['test/**/*.js', './*.js'],
//     languageOptions: {
//       globals: {
//         ...globals.node,
//       },
//     },
//   },
//   {
//     ignores: ['dist/**', '**/gen/**'],
//   },
// ]);
