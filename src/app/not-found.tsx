"use client";

import React from "react";

export default function NotFoundPage() {
  return (
    <main className="flex items-center justify-center h-screen bg-background">
      <div className="text-center p-6 rounded-lg border bg-card shadow-md">
        <h1 className="text-4xl font-bold text-foreground">404 — Page Not Found</h1>
        <p className="mt-4 text-muted-foreground">
          Sorry, the page you are looking for does not exist.
        </p>
      </div>
    </main>
  );
}
