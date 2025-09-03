// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Bot, Send, User, BrainCircuit, Copy, Check, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAiResponse, getChatHistory, clearChatHistory, type Message } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// KaTeX imports
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

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

// This is the new, robust renderer that handles Markdown formatting and LaTeX.
const renderers = {
  p: ({ children }) => {
    const childrenArray = React.Children.toArray(children);

    const processed = childrenArray.flatMap((child, index) => {
      if (typeof child === 'string') {
        const parts = child.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/g);
        return parts.map((part, i) => {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            return <BlockMath key={`${index}-${i}`} math={part.slice(2, -2)} />;
          }
          if (part.startsWith('$') && part.endsWith('$')) {
            return <InlineMath key={`${index}-${i}`} math={part.slice(1, -1)} />;
          }
          return <span key={`${index}-${i}`}>{part}</span>;
        });
      }

      // Return child as-is
      return child;
    });

    // Detect any block-level elements properly
    const hasBlock = processed.some(
      (c) =>
        React.isValidElement(c) &&
        (c.type === BlockMath || c.type === 'div' || c.type === 'pre')
    );

    // Wrap in <p> only if no block exists
    return hasBlock ? <>{processed}</> : <p className="">{processed}</p>;
  },

  a: ({ node, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" />
  ),
  h1: ({ node, ...props }) => <h1 {...props} className="text-2xl font-bold my-2" />,
  h2: ({ node, ...props }) => <h2 {...props} className="text-xl font-bold my-2" />,
  h3: ({ node, ...props }) => <h3 {...props} className="text-lg font-bold my-2" />,
  h4: ({ node, ...props }) => <h4 {...props} className="text-md font-semibold my-1" />,
  h5: ({ node, ...props }) => <h5 {...props} className="text-sm font-semibold my-1" />,
  h6: ({ node, ...props }) => <h6 {...props} className="text-xs font-semibold my-1" />,
  blockquote: ({ node, ...props }) => <blockquote {...props} className="border-l-2 pl-4 italic text-gray-600 my-2" />,
  ul: ({ node, ...props }) => <ul {...props} className="list-disc ml-6 my-2" />,
  ol: ({ node, ...props }) => <ol {...props} className="list-decimal ml-6 my-2" />,
  strong: ({ node, ...props }) => <strong {...props} className="font-semibold" />,
  em: ({ node, ...props }) => <em {...props} className="italic" />,
  code: ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const codeContent = String(children);
    const [copied, setCopied] = React.useState(false);

    if (!inline && match) {
      const language = match[1];

      const handleCopy = () => {
        navigator.clipboard.writeText(codeContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      };

      return (
        <div className="relative my-2">
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm md:text-base">
            <code className={`language-${language}`}>{codeContent}</code>
          </pre>
          <button
            onClick={handleCopy}
            className={`absolute top-2 right-2 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-1`}
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              'Copy'
            )}
          </button>
        </div>
      );
    }

    // Inline code
    return (
      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm md:text-base" {...props}>
        {children}
      </code>
    );
  }

};


export function Chat({ studentName, studentClass, gender }: { studentName: string, studentClass: string, gender?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    // A quick hack to get clean text for copying, without the react-katex internal markup
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const katexElements = tempDiv.querySelectorAll('.katex-mathml');
    katexElements.forEach(el => el.remove());
    const cleanContent = tempDiv.innerText || content;

    navigator.clipboard.writeText(cleanContent).then(() => {
      setCopiedMessageId(id);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    });
  };

  const handleClearChat = async () => {
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
    setIsLoading(false);
  };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
                      'flex items-start gap-2 sm:gap-3', 
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
                      <div className={cn('flex flex-col gap-1 w-auto max-w-[85%] ', message.role === 'user' ? 'items-end' : 'items-start')}>
                        <div className={cn("flex w-fit max-w-full flex-col gap-1", message.role === 'user' ? 'items-end' : 'items-start')}>
                          <div
                            className={cn(
                              'prose prose-sm dark:prose-invert rounded-2xl p-3 px-4 shadow-sm break-words',
                              'prose-p:text-sm prose-p:md:text-base',
                              message.role === 'user'
                                ? 'bg-gradient-to-br from-primary to-violet-500 text-primary-foreground rounded-br-lg prose-p:text-primary-foreground prose-strong:text-primary-foreground prose-a:text-amber-300 hover:prose-a:text-amber-400 prose-code:text-primary-foreground'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-bl-lg border border-gray-200 dark:border-gray-700'
                            )}
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={renderers}
                            >
                              {message.content}
                            </ReactMarkdown>

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
               <AlertDialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        disabled={isLoading || isHistoryLoading || messages.length === 0}
                      >
                        <Trash2 className="h-5 w-5" />
                        <span className="sr-only">Clear chat history</span>
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    Clear History
                  </TooltipContent>
                </Tooltip>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your current chat history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearChat} className={cn(buttonVariants({variant: 'destructive'}))}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
