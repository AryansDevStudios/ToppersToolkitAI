// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, BrainCircuit, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAiResponse, getChatHistory, hasChatHistory, type Message } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// KaTeX imports
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { useSearchParams } from 'next/navigation';
import { ChatFooter } from './chat-footer';
import { ChatMessage } from './chat-message';

const getInitials = (name: string) => {
  if (!name) return '';
  const nameParts = name.trim().split(' ').filter(Boolean);
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  return (
    (nameParts[0].charAt(0) || '') +
    (nameParts[nameParts.length - 1].charAt(0) || '')
  ).toUpperCase();
};

export function Chat({ studentName, studentClass, gender, showArchived }: { studentName: string, studentClass: string, gender?: string, showArchived: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isCheckingHistory, setIsCheckingHistory] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function checkAndLoadHistory() {
      setIsCheckingHistory(true);
      const historyExists = await hasChatHistory(studentName);
      
      if (historyExists) {
        const history = await getChatHistory(studentName);
        setMessages(history);
      } else {
        setMessages([]);
      }
      
      setIsHistoryLoading(false);
      setIsCheckingHistory(false);
    }
    checkAndLoadHistory();
  }, [studentName]);

  useEffect(() => {
    const chatInput = inputRef.current;

    const handleFocus = () => {
      window.parent.postMessage('inputFocused', '*');
    };

    const handleBlur = () => {
      window.parent.postMessage('inputBlurred', '*');
    };

    if (chatInput) {
      chatInput.addEventListener('focus', handleFocus);
      chatInput.addEventListener('blur', handleBlur);
    }

    return () => {
      if (chatInput) {
        chatInput.removeEventListener('focus', handleFocus);
        chatInput.removeEventListener('blur', handleBlur);
      }
    };
  }, []);

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
      const scrollHeight = inputRef.current.scrollHeight;
      const maxHeight = 10 * 24;
      if (scrollHeight > maxHeight) {
        inputRef.current.style.height = `${maxHeight}px`;
        inputRef.current.style.overflowY = 'auto';
      } else {
        inputRef.current.style.height = `${scrollHeight}px`;
        inputRef.current.style.overflowY = 'hidden';
      }
    }
  }, [input]);

  const handleClearChat = async () => {
    setMessages([]);
    // We are not deleting from DB, just clearing the session UI.
    // A full reload can also achieve this if state is not shared across reloads.
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (input.trim().toLowerCase() === '/clear') {
        handleClearChat();
        setInput('');
        return;
    }

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
        studentClass,
        gender,
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
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const ChatSkeletons = () => (
    <div className="space-y-6">
      <div className="flex items-start gap-3 justify-start">
        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
        <div className="flex flex-col gap-2 w-full max-w-[75%]">
          <Skeleton className="h-7 w-48 rounded-2xl" />
          <Skeleton className="h-7 w-32 rounded-2xl" />
        </div>
      </div>
      <div className="flex items-start gap-3 justify-end">
        <div className="flex flex-col gap-2 w-full max-w-[75%] items-end">
          <Skeleton className="h-7 w-40 rounded-2xl" />
        </div>
        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      </div>
      <div className="flex items-start gap-3 justify-start">
        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
        <div className="flex flex-col gap-2 w-full max-w-[75%]">
          <Skeleton className="h-7 w-56 rounded-2xl" />
        </div>
      </div>
      <div className="flex items-start gap-3 justify-end">
        <div className="flex flex-col gap-2 w-full max-w-[75%] items-end">
          <Skeleton className="h-7 w-32 rounded-2xl" />
          <Skeleton className="h-7 w-24 rounded-2xl" />
        </div>
        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      </div>
    </div>
  );

  if (isCheckingHistory || isHistoryLoading) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading conversation...</p>
        </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full flex-col bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-900/95 dark:to-violet-900/20">
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full custom-scrollbar" ref={scrollAreaRef}>
            <div className="p-4 md:p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="flex h-[calc(100vh-140px)] flex-col items-center justify-center gap-4 text-center p-4">
                  <div className="p-3 bg-primary/10 rounded-full border-4 border-primary/20">
                    <BrainCircuit className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                      Welcome, {studentName}!
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                      You can start a conversation by typing your doubt below.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <ChatMessage
                    key={message.id || index}
                    message={message}
                    studentName={studentName}
                    getInitials={getInitials}
                  />
                ))
              )}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                  <Avatar className="h-8 w-8 md:h-9 md:w-9 shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-violet-500 text-white">
                      <Bot className="h-4 w-4 md:h-5 md:w-5" />
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
        <ChatFooter
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            handleClearChat={handleClearChat}
            isLoading={isLoading || isHistoryLoading}
            inputRef={inputRef}
        />
      </div>
    </TooltipProvider>
  );
}
