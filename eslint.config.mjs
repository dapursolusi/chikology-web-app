import config from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import nextTypescript from "eslint-config-next/typescript";
import coreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  config,
  eslintConfigPrettier,
  nextTypescript,
  coreWebVitals,
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }], // Prevents messy console.logs in production
      "@typescript-eslint/no-explicit-any": "error", // Forces strict typing over 'any'
    },
  },
]);
