import coreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import config from 'eslint-config-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  config,
  eslintConfigPrettier,
  nextTypescript,
  coreWebVitals,
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Prevents messy console.logs in production
      '@typescript-eslint/no-explicit-any': 'error', // Forces strict typing over 'any'
    },
  },
]);
