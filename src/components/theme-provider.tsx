'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
        // default to system preference if no param
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if(isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }
  }, [theme]);

  return <>{children}</>;
}
