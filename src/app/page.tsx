import { Chat } from '@/components/chat';

export default function Home({
  searchParams,
}: {
  searchParams: { name?: string };
}) {
  const studentName = searchParams.name;

  if (!studentName) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-background p-4">
        <div className="text-center p-8 border rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-destructive">
            Missing Information
          </h1>
          <p className="mt-2 text-muted-foreground">
            Student name not provided in the URL.
            <br />
            Please append `?name=YourName` to the address.
          </p>
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
