module.exports = {
    env: { browser: true,
        es6: true },
    parser: '@babel/eslint-parser',
    extends: ['prettier', 'airbnb/base'],
    globals: { Atomics: 'readonly',
        SharedArrayBuffer: 'readonly' },
    parserOptions: { ecmaVersion: 2018,
        sourceType: 'module' },
    plugins: [
        'prettier',
        'unused-imports',
    ],
    ignorePatterns: ['**/CircularSankey/*.js', '**/Sankey-Plus/**'],
    rules: {
        indent: ['error', 4],
        'brace-style': ['error', '1tbs', { allowSingleLine: true }],
        'space-before-function-paren': [
            'error',
            { anonymous: 'ignore', named: 'never', asyncArrow: 'always' },
        ],
        'no-console': 'off',
        'max-len': [2, { code: 120, tabWidth: 4, ignoreUrls: true }],
        'no-param-reassign': ['error', { props: false }],
        'import/no-extraneous-dependencies': 'off',
        'prefer-destructuring': 'off',
        'func-names': ['error', 'never'],
        'no-unused-expressions': [
            'error',
            { allowShortCircuit: true, allowTernary: true },
        ],
        'no-underscore-dangle': 'off',
        'no-use-before-define': 'off',
        'no-nested-ternary': 'off',
        // "func-call-spacing": ["error", "never"],

        // Supermetrics
        'import/prefer-default-export': 'off', // default exports are bad: https://basarat.gitbook.io/typescript/main-1/defaultisbad
        'import/no-default-export': 'error', // default exports are bad, prefer named exports

        // For dev
        'no-unused-vars': 'off',

        // Visualizations only
        'object-curly-newline': [
            'error',
            {
                // minProperties: 5,
                ExportDeclaration: 'always',
            },
        ],
        'no-mixed-operators': 'off',
    },
};
