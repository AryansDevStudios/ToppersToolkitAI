import { Chat } from '@/components/chat';
import { Suspense } from 'react';

function ChatPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const studentName = (searchParams?.name as string) ?? 'Student';
  const studentClass = (searchParams?.class as string) ?? 'Class';

  return (
    <main className="h-screen bg-background">
      <Chat studentName={studentName} studentClass={studentClass} />
    </main>
  );
}

export default function Home({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Suspense fallback={<div className="h-screen w-full" />}>
      <ChatPage searchParams={searchParams ?? {}} />
    </Suspense>
  );
}
