'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Bot, Send, User, BrainCircuit, Sparkles, PencilRuler, Paintbrush } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAiResponse, getChatHistory, type Message } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function Chat({ studentName }: { studentName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      const history = await getChatHistory(studentName);
      setMessages(history);
      setIsLoading(false);
    }
    loadHistory();
  }, [studentName]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponseContent = await getAiResponse(
        studentName,
        updatedMessages
      );
      const aiMessage: Message = {
        role: 'assistant',
        content: aiResponseContent,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I couldn't get a response. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-900/95 dark:to-violet-900/20">
      <header className="flex items-center justify-between p-4 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
             <Avatar className="h-12 w-12 border-2 border-primary/50 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-primary to-violet-500 text-white">
                  <BrainCircuit className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-950" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">Topper's Iframe Assist</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ready to help, {studentName}!
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 md:p-6 space-y-6">
            {isLoading && messages.length === 0 ? (
              <div className="space-y-4 p-4">
                <Skeleton className="h-24 w-3/4 rounded-2xl bg-gray-200 dark:bg-gray-800" />
                <Skeleton className="h-24 w-3/4 rounded-2xl ml-auto bg-gray-200 dark:bg-gray-800" />
                <Skeleton className="h-24 w-2/3 rounded-2xl bg-gray-200 dark:bg-gray-800" />
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-9 w-9 self-start shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-violet-500 text-white">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'prose prose-sm dark:prose-invert max-w-2xl rounded-2xl p-3 px-4 shadow-md',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-lg prose-p:text-primary-foreground prose-strong:text-primary-foreground prose-a:text-amber-300 hover:prose-a:text-amber-400 prose-code:text-primary-foreground'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-bl-lg border border-gray-200 dark:border-gray-700'
                    )}
                  >
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-9 w-9 self-start shadow-md">
                      <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
            {isLoading && messages.length > 0 && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-9 w-9 shadow-md">
                   <AvatarFallback className="bg-gradient-to-br from-primary to-violet-500 text-white">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                </Avatar>
                <div className="max-w-xs rounded-2xl p-3 px-4 text-sm md:max-w-md lg:max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      <footer className="p-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800/50">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-3"
          >
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your doubt here..."
                className="w-full pl-4 pr-20 py-3 text-base bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-primary rounded-2xl resize-none max-h-48 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-gray-100"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-110 active:scale-100"
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </form>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            Powered by <Paintbrush className="inline-block h-3 w-3 text-violet-500" /> Topper's Iframe Assist
          </p>
        </div>
      </footer>
    </div>
  );
}
