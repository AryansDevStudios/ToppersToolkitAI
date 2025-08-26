import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from 'react';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: "Topper's Toolkit AI",
  description: 'AI-powered doubt solver for students',
};

export default function RootLayout({
  children,
  params,
  searchParams,
}: Readonly<{
  children: React.ReactNode;
  params: {};
  searchParams: { [key: string]: string | string[] | undefined };
}>) {
  const theme = searchParams?.theme || 'light';

  return (
    <html lang="en" className={cn(theme)} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Suspense fallback={<div />}>
          {children}
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
