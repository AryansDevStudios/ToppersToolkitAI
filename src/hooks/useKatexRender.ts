// @ts-nocheck
'use client';

import { useEffect } from 'react';
import { type Message } from '@/app/actions';

export function useKatexRender(messages: Message[]) {
  useEffect(() => {
    if (messages.length === 0) return;

    let isMounted = true;

    async function renderMath() {
      try {
        const renderMathInElement = (await import('katex/dist/contrib/auto-render')).default;
        
        if (isMounted && typeof window !== 'undefined') {
          renderMathInElement(document.body, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\(', right: '\\)', display: false },
              { left: '\\[', right: '\\]', display: true }
            ],
            throwOnError: false
          });
        }
      } catch (error) {
        console.error('KaTeX render error:', error);
      }
    }

    // A short delay to allow React to render the new message
    const timeoutId = setTimeout(() => {
        renderMath();
    }, 100);

    return () => { 
        isMounted = false; 
        clearTimeout(timeoutId);
    };
  }, [messages]);
}
