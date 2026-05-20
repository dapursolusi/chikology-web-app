/**
 * @see https://github.com/lint-staged/lint-staged#examples
 *
 */

import { defineConfig } from "lint-staged";

export default defineConfig({
  "*.{js,jsx,ts,tsx}": ["prettier --write", "eslint --fix"],
  "*.{json,md,css}": ["prettier --write"],
});
