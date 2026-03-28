import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        Worker: 'readonly',
        self: 'readonly',
        postMessage: 'readonly',
        CodeMirror: 'readonly',
        cytoscape: 'readonly',
        requestAnimationFrame: 'readonly',
        localStorage: 'readonly',
        importScripts: 'readonly',
        loadPyodide: 'readonly',
        fetch: 'readonly',
        AbortController: 'readonly',
        URL: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
    },
  },
  {
    ignores: ['node_modules/', 'tmp/', 'dist/'],
  },
];
