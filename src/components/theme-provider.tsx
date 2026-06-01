'use client';

import * as React from 'react';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      disableTransitionOnChange
      storageKey="chikology-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
