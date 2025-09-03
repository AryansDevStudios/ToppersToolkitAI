// @ts-nocheck
'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Bot, Send, User, BrainCircuit, Copy, Check } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAiResponse, getChatHistory, clearChatHistory, type Message } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useKatexRender } from '@/hooks/useKatexRender';

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


export function Chat({ studentName, studentClass, gender }: { studentName: string, studentClass: string, gender?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Custom hook to render LaTeX
  useKatexRender(messages);

  useEffect(() => {
    async function loadHistory() {
      setIsHistoryLoading(true);
      const history = await getChatHistory(studentName);
      setMessages(history);
      setIsHistoryLoading(false);
    }
    loadHistory();
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
      const maxHeight = 10 * 24; // 10 lines * 24px line-height (approx)
      if (scrollHeight > maxHeight) {
        inputRef.current.style.height = `${maxHeight}px`;
        inputRef.current.style.overflowY = 'auto';
      } else {
        inputRef.current.style.height = `${scrollHeight}px`;
        inputRef.current.style.overflowY = 'hidden';
      }
    }
  }, [input]);

  const handleCopy = (content: string, id?: string) => {
    if (!id) return;
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(id);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (input.trim() === '{clearHistory}') {
      setIsLoading(true);
      const result = await clearChatHistory(studentName);
      if (result.success) {
        setMessages([{
          role: 'system',
          content: 'Your chat history has been cleared.',
          timestamp: new Date().toISOString(),
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'system',
          content: 'Sorry, there was an error clearing your history.',
          timestamp: new Date().toISOString(),
        }]);
      }
      setInput('');
      setIsLoading(false);
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
        inputRef.current.style.height = 'auto'; // Reset height after submission
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

  return (
    <TooltipProvider>
    <div className="flex h-screen w-full flex-col bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-900/95 dark:to-violet-900/20">
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full custom-scrollbar" ref={scrollAreaRef}>
          <div className="p-4 md:p-6 space-y-6">
            {isHistoryLoading ? (
              <ChatSkeletons />
            ) : messages.length === 0 ? (
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
                <div
                  key={message.id || index}
                  className={cn(
                    'flex w-full items-start gap-2 md:gap-3',
                     message.role === 'system' ? 'justify-center' : message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 md:h-9 md:w-9 self-start shadow-md shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-violet-500 text-white">
                        <Bot className="h-4 w-4 md:h-5 md:w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                   {message.role === 'system' ? (
                     <div className="text-center text-xs text-muted-foreground py-2 px-4 rounded-full bg-card border">
                        {message.content}
                      </div>
                   ) : (
                    <div className={cn('flex flex-col gap-1 w-full max-w-full', message.role === 'user' ? 'items-end' : 'items-start')}>
                      <div className={cn("flex w-fit max-w-[90%] md:max-w-[75%] flex-col gap-1", message.role === 'user' ? 'items-end' : 'items-start')}>
                        <div
                          className={cn(
                            'prose prose-sm dark:prose-invert rounded-2xl p-3 px-4 shadow-sm break-words',
                            'prose-p:text-sm prose-p:md:text-base',
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-primary to-violet-500 text-primary-foreground rounded-br-lg prose-p:text-primary-foreground prose-strong:text-primary-foreground prose-a:text-amber-300 hover:prose-a:text-amber-400 prose-code:text-primary-foreground'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-bl-lg border border-gray-200 dark:border-gray-700'
                          )}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                         <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-auto px-2 transition-opacity text-muted-foreground hover:text-foreground"
                              onClick={() => handleCopy(message.content, message.id || `${index}`)}
                            >
                              {copiedMessageId === (message.id || `${index}`) ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                              <span className="sr-only">Copy message</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {copiedMessageId === (message.id || `${index}`) ? 'Copied!' : 'Copy'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                   )}
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 md:h-9 md:w-9 self-start shadow-md shrink-0">
                      <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold">
                        {getInitials(studentName)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
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

      <footer className="p-2 md:p-4 bg-white/30 dark:bg-[#18192b]/30 backdrop-blur-md border-t border-gray-200 dark:border-gray-800/50">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 md:gap-3"
          >
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your doubt here..."
                className="w-full pl-3 pr-16 py-5 md:pl-4 md:pr-20 md:py-5 text-sm md:text-base bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-primary rounded-xl md:rounded-2xl resize-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background dark:text-gray-100 max-h-48 custom-scrollbar"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                disabled={isLoading || isHistoryLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || isHistoryLoading || !input.trim()}
                className="absolute right-2 bottom-[7px] md:right-3 md:bottom-3 w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-110 active:scale-100 flex items-center justify-center"
              >
                <Send className="h-4 w-4 md:h-5 md:w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </form>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            A product of Topper's Toolkit, under AryansDevStudios
          </p>
        </div>
      </footer>
    </div>
    </TooltipProvider>
  );
}
