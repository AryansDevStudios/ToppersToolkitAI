import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: "Topper's Toolkit AI",
  description: 'AI-powered doubt solver for students',
  icons: {
    icon: 'https://raw.githubusercontent.com/AryansDevStudios/ToppersToolkit/refs/heads/main/public/icon/icon_app.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0KOVEMQNogPSesLpv7EdxUey/tDb+ESBeCojK/2GmSSvi7szsJgmE" crossOrigin="anonymous" />
      </head>
      <body className="font-body antialiased">
        <Suspense>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
