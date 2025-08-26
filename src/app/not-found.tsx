
'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex h-screen w-full items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-4 text-center p-8 border-2 border-dashed rounded-2xl bg-card">
        <div className="rounded-full border-4 border-destructive/20 bg-destructive/10 p-3">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            404 - Page Not Found
          </h1>
          <p className="text-muted-foreground">
            Sorry, the page you are looking for does not exist.
          </p>
        </div>
        <Link href="/" className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
            Go back home
        </Link>
      </div>
    </main>
  );
}
