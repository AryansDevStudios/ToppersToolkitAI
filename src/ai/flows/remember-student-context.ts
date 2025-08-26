'use server';

/**
 * @fileOverview This flow remembers the student's context and uses it to clear their doubts.
 *
 * - clearStudentDoubt - A function that clears the student's doubt using AI, remembering the context.
 * - ClearStudentDoubtInput - The input type for the clearStudentDoubt function.
 * - ClearStudentDoubtOutput - The return type for the clearStudentDoubt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClearStudentDoubtInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  doubt: z.string().describe('The student\'s doubt or question.'),
});
export type ClearStudentDoubtInput = z.infer<typeof ClearStudentDoubtInputSchema>;

const ClearStudentDoubtOutputSchema = z.object({
  answer: z.string().describe('The AI\'s answer to the student\'s doubt.'),
});
export type ClearStudentDoubtOutput = z.infer<typeof ClearStudentDoubtOutputSchema>;

export async function clearStudentDoubt(input: ClearStudentDoubtInput): Promise<ClearStudentDoubtOutput> {
  return clearStudentDoubtFlow(input);
}

const prompt = ai.definePrompt({
  name: 'clearStudentDoubtPrompt',
  input: {schema: ClearStudentDoubtInputSchema},
  output: {schema: ClearStudentDoubtOutputSchema},
  prompt: `You are an AI assistant helping students with their doubts. Your name is Topper's Toolkit Doubts.

  You will be provided with the student's name and their doubt. Remember the context of the conversation so you don't have to ask follow up questions.

  Student Name: {{{studentName}}}
  Doubt: {{{doubt}}}
  `, // Removed the example output format
});

const clearStudentDoubtFlow = ai.defineFlow(
  {
    name: 'clearStudentDoubtFlow',
    inputSchema: ClearStudentDoubtInputSchema,
    outputSchema: ClearStudentDoubtOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
