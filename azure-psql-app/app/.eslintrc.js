module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'consistent-return': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'max-len': ['warn', { code: 120, ignoreComments: true, ignoreStrings: true }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.js', '**/*.spec.js'] }],
    'camelcase': 'warn',
    'comma-dangle': 'warn',
    'global-require': 'warn',
    'new-cap': 'warn',
    'object-shorthand': 'warn',
    'no-trailing-spaces': 'warn',
    'import/newline-after-import': 'warn',
    'function-paren-newline': 'off',
    'prefer-destructuring': 'warn',
    'no-shadow': 'warn',
    'no-use-before-define': 'off',
    'no-underscore-dangle': 'off',
    'quote-props': 'warn',
    'no-plusplus': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'warn',
    'radix': 'warn',
    'import/no-unresolved': ['error', { ignore: ['^y-websocket'] }],
  },
  overrides: [
    {
      files: ['test/**/*.js'],
      rules: {
        'no-undef': 'off',
        'global-require': 'off',
      },
    },
  ],
};
