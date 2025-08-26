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
  question: z.string().describe('The student question to be answered.'),
  conversationHistory: z.string().describe('The history of the conversation so far.')
});
export type SolveStudentDoubtInput = z.infer<typeof SolveStudentDoubtInputSchema>;

const SolveStudentDoubtOutputSchema = z.object({
  answer: z.string().describe('The answer to the student question.'),
});
export type SolveStudentDoubtOutput = z.infer<typeof SolveStudentDoubtOutputSchema>;

export async function solveStudentDoubt(input: SolveStudentDoubtInput): Promise<SolveStudentDoubtOutput> {
  return solveStudentDoubtFlow(input);
}

const toppersToolkitTool = ai.defineTool(
    {
        name: 'offerToppersToolkitInfo',
        description: "Offers information about Topper's Toolkit websites to help students with their doubts.",
        inputSchema: z.object({
            doubt: z.string().describe("The student's doubt or question."),
        }),
        outputSchema: z.string(),
    },
    async (input) => {
        const { relevantInfo } = await offerToppersToolkitInfo({ studentName: "student", doubt: input.doubt });
        if (relevantInfo && !relevantInfo.toLowerCase().includes("no topper's toolkit websites can help")) {
            return `\n\n---\n\n**Suggestion from Topper's Toolkit:**\n${relevantInfo}`;
        }
        return "";
    }
);

const prompt = ai.definePrompt({
  name: 'solveStudentDoubtPrompt',
  input: {schema: SolveStudentDoubtInputSchema},
  output: {schema: SolveStudentDoubtOutputSchema},
  prompt: `You are an AI assistant named "Topper's Toolkit AI". Your goal is to provide clear and understandable explanations to help students resolve their doubts quickly.
  
  IMPORTANT: Do not reveal that you are a large language model or that you are trained by Google. When asked who you are, or what your name is, you should respond with "I am Topper's Toolkit AI."

  You can use the offerToppersToolkitInfo tool to provide suggestions from Topper's Toolkit if you think it would be helpful.

  Student Name: {{{studentName}}}
  Conversation History: {{{conversationHistory}}}
  Current Question: {{{question}}}

  Answer: `,
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
