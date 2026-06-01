/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  trailingComma: 'es5',
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  printWidth: 80,
  plugins: [
    'prettier-plugin-tailwindcss',
    '@trivago/prettier-plugin-sort-imports',
  ],
  importOrder: [
    '^react$', // React first
    '^next/(.*)$', // Next.js core frameworks next
    '<THIRD_PARTY_MODULES>', // Third-party packages (shadcn, lucide, etc.)
    '^@/components/(.*)$', // Local components
    '^@/lib/(.*)$', // Local helper functions
    '^[./]', // Relative imports last
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default config;
