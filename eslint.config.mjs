import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import stylistic from '@stylistic/eslint-plugin'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'no-only-tests': noOnlyTests,
      '@stylistic': stylistic,
    },
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
      'no-only-tests/no-only-tests': 'error',
      'eqeqeq': 'warn',
      'semi': ['warn', 'always'],
      // 'quotes': ['warn', 'single'],
      'comma-dangle': ['warn', {
        'arrays': 'always-multiline',
        'objects': 'always-multiline',
        'imports': 'always-multiline',
        'exports': 'always-multiline',
        'functions': 'only-multiline'
      }],
      'arrow-spacing': ['warn', { before: true, after: true }],
      'object-curly-spacing': ['warn', 'always'],
      'array-bracket-spacing': ['warn', 'never'],
      'block-spacing': ['warn', 'always'],
      'keyword-spacing': ['warn', { before: true, after: true }],
      'space-before-blocks': ['warn', 'always'],
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-restricted-properties': [ 'warn', {
        object: 'console',
        property: 'log',
        message: 'Unexpected console.log, use a proper logger or remove before commit.'
      }]
    }
  },
  {
    ignores: ['dist/**', 'dist-ff/**', '**/gen/**'],
  }
);
