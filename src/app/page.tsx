'use client';

import { Chat } from '@/components/chat';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { Suspense } from 'react';

function ChatPage() {
  const searchParams = useSearchParams();
  const studentName = searchParams.get('name');
  const studentClass = searchParams.get('class');
  const gender = searchParams.get('gender');

  const isTeacher = studentClass?.toLowerCase() === 'teacher';
  const isInfoMissing = !studentName || !studentClass || (isTeacher && !gender);

  if (isInfoMissing) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-center p-8 border-2 border-dashed rounded-2xl bg-card">
          <div className="rounded-full border-4 border-destructive/20 bg-destructive/10 p-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">
              Missing Information
            </h1>
            <p className="text-muted-foreground">
              We see that there is a technical glitch on our side please contact the site developer
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen bg-background">
      <Chat studentName={studentName} studentClass={studentClass} gender={gender || undefined} />
    </main>
  );
}

function HomePage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-background" />}>
      <ChatPage />
    </Suspense>
  )
}

export default HomePage;
