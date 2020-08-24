module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'airbnb-typescript/base'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    project: './tsconfig.json',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/lines-between-class-members': [ 'warn', 'always', { exceptAfterSingleLine: true } ],
    '@typescript-eslint/no-unused-vars': [ 'error', { 'argsIgnorePattern': '^_' } ],
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
    },
  ],
};
