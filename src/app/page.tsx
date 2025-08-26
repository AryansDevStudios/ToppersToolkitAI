import { Chat } from '@/components/chat';
import { AlertTriangle } from 'lucide-react';
import { Suspense } from 'react';

function ChatPage({
  searchParams,
}: {
  searchParams: { name?: string };
}) {
  const studentName = searchParams.name;

  if (!studentName) {
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
              Student name not provided in the URL.
              <br />
              Please append{' '}
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                ?name=YourName
              </code>{' '}
              to the address.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen bg-background">
      <Chat studentName={studentName} />
    </main>
  );
}

export default function Home({
  searchParams,
}: {
  searchParams: { name?: string, theme?: string };
}) {
  return (
    <Suspense fallback={<div className="h-screen w-full" />}>
      <ChatPage searchParams={searchParams} />
    </Suspense>
  );
}
