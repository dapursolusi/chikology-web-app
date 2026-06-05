import '@testing-library/jest-dom/vitest';

if (typeof document !== 'undefined') {
  Object.defineProperty(document, 'elementFromPoint', {
    value: () => ({
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        width: 100,
        height: 100,
      }),
    }),
    writable: true,
    configurable: true,
  });
}

if (typeof window !== 'undefined') {
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
}
