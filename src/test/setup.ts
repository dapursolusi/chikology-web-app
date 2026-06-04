import '@testing-library/jest-dom/vitest';

Object.defineProperty(document, 'elementFromPoint', {
  value: () => ({
    getBoundingClientRect: () => ({ top: 0, left: 0, width: 100, height: 100 }),
  }),
  writable: true,
  configurable: true,
});

Object.defineProperty(window, 'matchMedia', {
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
  writable: true,
  configurable: true,
});
