import { Chat } from '@/components/chat';
import { AlertTriangle } from 'lucide-react';
import { Suspense } from 'react';

function ChatPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const studentName = searchParams.name as string;
  const studentClass = searchParams.class as string;

  if (!studentName || !studentClass) {
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
      <Chat studentName={studentName} studentClass={studentClass} />
    </main>
  );
}

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Suspense fallback={<div className="h-screen w-full" />}>
      <ChatPage searchParams={searchParams} />
    </Suspense>
  );
}
