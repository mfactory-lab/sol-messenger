const antfu = require('@antfu/eslint-config').default

module.exports = antfu({
  rules: {
    'antfu/consistent-list-newline': 'off',
    'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],

    'ts/consistent-type-imports': 'off',

    'toml/padding-line-between-pairs': 'off',
    'ts/consistent-type-definitions': ['error', 'type'],

    'curly': ['error', 'all'],

    'node/prefer-global/process': 'off',
    'node/prefer-global/buffer': 'off',
    'node/no-path-concat': 'off',

    'no-console': 'off',
  },
})
