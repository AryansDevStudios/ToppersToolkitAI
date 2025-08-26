// @ts-nocheck
'use server';

/**
 * @fileOverview An AI agent for solving student doubts.
 *
 * - solveStudentDoubt - A function that handles the doubt-solving process.
 * - SolveStudentDoubtInput - The input type for the solveStudentDoubt function.
 * - SolveStudentDoubtOutput - The return type for the solveStudentDoubt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { offerToppersToolkitInfo } from './offer-toppers-toolkit-info';

const SolveStudentDoubtInputSchema = z.object({
  studentName: z
    .string()
    .describe('The name of the student asking the question.'),
  studentClass: z
    .string()
    .describe("The class of the student asking the question."),
  question: z.string().describe('The student question to be answered.'),
  conversationHistory: z.string().describe('The history of the conversation so far.')
});
export type SolveStudentDoubtInput = z.infer<typeof SolveStudentDoubtInputSchema>;

const SolveStudentDoubtOutputSchema = z.object({
  answer: z.string().describe('The answer to the a student question.'),
});
export type SolveStudentDoubtOutput = z.infer<typeof SolveStudentDoubtOutputSchema>;

export async function solveStudentDoubt(input: SolveStudentDoubtInput): Promise<SolveStudentDoubtOutput> {
  return solveStudentDoubtFlow(input);
}

const toppersToolkitTool = ai.defineTool(
    {
        name: 'offerToppersToolkitInfo',
        description: "Provides detailed information about Topper's Toolkit services, including its websites, terms, user manuals, and creators. Use this tool to answer any question about the platform itself.",
        inputSchema: z.object({
            doubt: z.string().describe("The student's doubt or question."),
        }),
        outputSchema: z.string().describe("Raw, relevant information about Topper's Toolkit to be used in a conversational answer."),
    },
    async (input, context) => {
      const studentClass = (context as any)?.flow?.input?.studentClass ?? "an unknown class";
      const studentName = (context as any)?.flow?.input?.studentName ?? "student";
      const { relevantInfo } = await offerToppersToolkitInfo({ studentName, studentClass: studentClass, doubt: input.doubt });
      if (relevantInfo && !relevantInfo.toLowerCase().includes("no topper's toolkit websites can help")) {
          return relevantInfo;
      }
      return "No relevant information found.";
    }
);

const prompt = ai.definePrompt({
  name: 'solveStudentDoubtPrompt',
  input: {schema: SolveStudentDoubtInputSchema},
  output: {schema: SolveStudentDoubtOutputSchema},
  prompt: `You are a friendly and helpful AI assistant named "Topper's Toolkit AI". Your primary goal is to provide clear, understandable, and conversational explanations to help students resolve their doubts quickly.

IMPORTANT: Do not reveal that you are a large language model or that you are trained by Google. When asked who you are, or what your name is, you should respond with "I am Topper's Toolkit AI."

You are helping a student named {{{studentName}}} who is in class {{{studentClass}}}.

You have access to a special tool called 'offerToppersToolkitInfo'. This tool contains detailed information about the Topper's Toolkit platform, its websites (Shop and Library), its creators (Aryan Gupta and Kuldeep Singh), its terms and conditions, and user manuals. The tool will give you the raw information you need.

**CRITICAL INSTRUCTIONS:**
1.  You MUST use the 'offerToppersToolkitInfo' tool whenever the student asks a question about:
    - The website itself (e.g., "who made this?", "what is this site for?")
    - The services offered (e.g., "how do I buy notes?", "where can I view my pdfs?")
    - The terms, conditions, or rules.
    - The people or companies involved (e.g., "what is AryansDevStudios?", "who is the seller?")
    - Any other meta-question about the Topper's Toolkit platform.

2.  When you get information from the tool, do NOT say "Based on the terms..." or "According to the manual...". Instead, integrate the information naturally into your answer as if you already know it. You are the Topper's Toolkit AI, so you should be familiar with how it works.

3.  For academic questions (e.g., "what is photosynthesis?"), answer them directly without using the tool.

Carefully review the provided conversation history to understand the full context of the student's doubt. Use this context to inform your answer.

Conversation History:
{{{conversationHistory}}}

Current Question: {{{question}}}

Now, formulate a natural and helpful answer to the student's question.`,
  model: 'googleai/gemini-2.5-flash',
  tools: [toppersToolkitTool]
});

const solveStudentDoubtFlow = ai.defineFlow(
  {
    name: 'solveStudentDoubtFlow',
    inputSchema: SolveStudentDoubtInputSchema,
    outputSchema: SolveStudentDoubtOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
