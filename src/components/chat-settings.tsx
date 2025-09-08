'use client';

import React from 'react';
import { Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export type LearningMode = 'student' | 'grammar-learner' | 'ethic-learner' | 'both';

interface ChatSettingsProps {
  learningMode: LearningMode;
  setLearningMode: (mode: LearningMode) => void;
}

export function ChatSettings({ learningMode, setLearningMode }: ChatSettingsProps) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Open settings</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Learning Mode</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Learning Mode</p>
            <p className="text-xs leading-none text-muted-foreground">
              Customize the AI's feedback style.
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={learningMode} onValueChange={(value) => setLearningMode(value as LearningMode)}>
          <DropdownMenuRadioItem value="student">
            <Check className="mr-2 h-4 w-4" />
            Standard
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="grammar-learner">
            <Check className="mr-2 h-4 w-4" />
            Grammar Learner
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="ethic-learner">
            <Check className="mr-2 h-4 w-4" />
            Ethic Learner
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="both">
            <Check className="mr-2 h-4 w-4" />
            Both
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
