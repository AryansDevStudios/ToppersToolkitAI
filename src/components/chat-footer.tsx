// @ts-nocheck
'use client';

import React from 'react';
import { Send, Trash2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
import { cn } from '@/lib/utils';

interface ChatFooterProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleClearChat: () => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

export function ChatFooter({
  input,
  setInput,
  handleSubmit,
  handleClearChat,
  isLoading,
  inputRef,
}: ChatFooterProps) {
  return (
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
                    disabled={isLoading}
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
                  This action cannot be undone. This will permanently delete your chat history and clear the AI's memory of this conversation.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearChat} className={cn(buttonVariants({variant: 'destructive'}))}>
                  Delete Permanently
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
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bottom-[7px] md:right-3 md:bottom-3 w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-110 active:scale-100 flex items-center justify-center"
            >
              <Send className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
          A product of Topper's Toolkit by AryansDevStudios
        </p>
      </div>
    </footer>
  );
}
