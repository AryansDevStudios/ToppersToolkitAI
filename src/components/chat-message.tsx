// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { type Message } from '@/app/actions';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InlineMath, BlockMath } from 'react-katex';

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

    const hasBlock = processed.some(
      (c) =>
        React.isValidElement(c) &&
        (c.type === BlockMath || c.type === 'div' || c.type === 'pre')
    );

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


interface ChatMessageProps {
    message: Message;
    studentName: string;
    getInitials: (name: string) => string;
}

export function ChatMessage({ message, studentName, getInitials }: ChatMessageProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopy = (content: string, id?: string) => {
    if (!id) return;
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

  const messageId = message.id || message.timestamp;

  return (
    <div
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
        <div className={cn('flex flex-col gap-1 w-auto max-w-[85%] break-words', message.role === 'user' ? 'items-end' : 'items-start')}>
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
                  onClick={() => handleCopy(message.content, messageId)}
                >
                  {copiedMessageId === messageId ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  <span className="sr-only">Copy message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {copiedMessageId === messageId ? 'Copied!' : 'Copy'}
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
  );
}
