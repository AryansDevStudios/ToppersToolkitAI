'use client';

import React from 'react';
import { Sparkles, BookCheck, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export type LearningMode = {
  grammar: boolean;
  ethic: boolean;
};

interface ChatSettingsProps {
  learningMode: LearningMode;
  setLearningMode: (mode: LearningMode) => void;
}

export function ChatSettings({ learningMode, setLearningMode }: ChatSettingsProps) {

  const handleGrammarChange = (checked: boolean) => {
    setLearningMode({ ...learningMode, grammar: checked });
  };

  const handleEthicChange = (checked: boolean) => {
    setLearningMode({ ...learningMode, ethic: checked });
  };

  const grammarActive = learningMode.grammar;
  const ethicActive = learningMode.ethic;
  const anyActive = grammarActive || ethicActive;

  return (
    <Popover>
        <PopoverTrigger asChild>
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    "rounded-full h-9 px-4 backdrop-blur-sm transition-all duration-300 text-white font-semibold",
                    !anyActive && "bg-gradient-to-br from-blue-500 to-primary",
                    grammarActive && !ethicActive && "bg-gradient-to-br from-yellow-400 to-amber-500",
                    !grammarActive && ethicActive && "bg-gradient-to-br from-green-400 to-emerald-500",
                    grammarActive && ethicActive && "bg-gradient-to-br from-green-400 to-yellow-500",
                    anyActive ? "text-primary-foreground" : "bg-background/50 text-muted-foreground hover:bg-background/80"
                )}
            >
                <Sparkles className={cn("h-4 w-4 mr-2 transition-transform", anyActive && "rotate-12 scale-110")} />
                <span className="text-sm font-medium">Learning Mode</span>
            </Button>
        </PopoverTrigger>
      <PopoverContent className="w-64" align="center" side="top">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Customize Feedback</h4>
            <p className="text-sm text-muted-foreground">
              Select modes to get instant feedback on your writing.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="flex items-center space-x-3">
              <Checkbox id="grammar" checked={grammarActive} onCheckedChange={handleGrammarChange} />
              <Label htmlFor="grammar" className="flex items-center gap-2 font-normal text-sm cursor-pointer">
                <BookCheck className="h-4 w-4 text-muted-foreground"/>
                Grammar Learner
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="ethic" checked={ethicActive} onCheckedChange={handleEthicChange} />
              <Label htmlFor="ethic" className="flex items-center gap-2 font-normal text-sm cursor-pointer">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                Ethic Learner
              </Label>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
