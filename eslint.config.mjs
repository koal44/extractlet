import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import stylistic from '@stylistic/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.ts'],
    languageOptions: {
      // parser: tsParser,
      parserOptions: {
        projectService: true,
      }
    },
    rules: {
      '@typescript-eslint/no-unnecessary-condition': ['warn', { allowConstantLoopConditions: false }],
    },
  },
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
      'quotes': ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
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
      'no-restricted-properties': [ 'warn',
        { object: 'console', property: 'log',  message: 'Use logger or remove.' },
      ],
      // spacing around type colons, e.g. `let x: number`, not `let x :number`
      '@stylistic/type-annotation-spacing': ['warn', {
        before: false,
        after: true,
        overrides: { arrow: { before: true, after: true } },
      }],
      '@stylistic/space-infix-ops': ['warn', { int32Hint: false }],
      '@stylistic/no-trailing-spaces': ['warn'],
      '@stylistic/indent': ['warn', 2, {
        SwitchCase: 1,
        flatTernaryExpressions: true,
        MemberExpression: 1,
        ignoredNodes: [], // optional
      }],
      '@stylistic/comma-spacing': ['warn', { before: false, after: true }],
      '@stylistic/key-spacing': ['warn', { beforeColon: false, afterColon: true, mode: 'minimum'}],
      '@stylistic/object-curly-newline': ['warn', {
        ObjectExpression: { multiline: true, consistent: true },
        ObjectPattern: { multiline: true, consistent: true },
        ExportDeclaration:{ multiline: true, minProperties: 6 },
        ImportDeclaration: { multiline: true, minProperties: 6 },
      }],
      '@stylistic/eol-last': ['warn', 'always'],
      '@stylistic/linebreak-style': ['warn', 'unix'], // or 'windows'
      'no-unneeded-ternary': 'warn',
      'prefer-template': 'warn',
      '@stylistic/space-before-function-paren': ['warn', {
        anonymous: 'never', named: 'never', asyncArrow: 'always'
      }],
      'func-call-spacing': ['warn', 'never'],
      '@stylistic/quote-props': ['warn', 'as-needed'],
      '@typescript-eslint/consistent-type-definitions': ['warn', 'type'], // or 'interface'
      // '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      // '@stylistic/operator-linebreak': ['warn', 'before', { overrides: { '?': 'ignore', ':': 'ignore', '=': 'after' } }],
      // '@typescript-eslint/consistent-type-assertions': ['warn', { assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
      // 'padding-line-between-statements': ['warn',
      //   { blankLine: 'always', prev: '*', next: 'return' },
      //   { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      //   { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
      // ],
      //
      // '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@stylistic/arrow-parens': ['warn', 'always'],
      'curly': ['warn', 'multi-line', 'consistent'],
      // 'no-magic-numbers': ['warn', { ignore: [0,1,2,97,100], ignoreDefaultValues: true, enforceConst: true }],
      // '@typescript-eslint/prefer-as-const': 'warn',
      '@stylistic/member-delimiter-style': ['warn', {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: true,
        },
      }],
      'no-duplicate-imports': ['warn', { allowSeparateTypeImports: true }],
    }
  },
  // {
  //   files: ['eslint.config.mjs'],
  //   rules: { '@typescript-eslint/*': 'off' },
  //   languageOptions: {
  //     parser: undefined,
  //   },
  // },
  {
    ignores: ['dist/**', 'dist-ff/**', '**/gen/**', 'eslint.config.mjs'],
  }
);
