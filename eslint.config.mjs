import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      eqeqeq: 'warn',
      semi: ['warn', 'always'],
      quotes: ['warn', 'single'],
      'no-console': 'off',
      'no-debugger': 'off',
      'no-var': 'error',
      'prefer-const': 'warn',
      'arrow-spacing': ['warn', { before: true, after: true }],
      'comma-dangle': ['warn', {
        'arrays': 'always-multiline',
        'objects': 'always-multiline',
        'imports': 'always-multiline',
        'exports': 'always-multiline',
        'functions': 'never',
      }],
      'object-curly-spacing': ['warn', 'always'],
      'array-bracket-spacing': ['warn', 'never'],
      'block-spacing': ['warn', 'always'],
      'keyword-spacing': ['warn', { before: true, after: true }],
      'space-before-blocks': ['warn', 'always'],
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: { sourceType: 'module' },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        process: 'readonly',
        module: 'readonly',
      },
    },
  },
  {
    files: ['test/**/*.js', './*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: ['dist/**'],
  },
]);
