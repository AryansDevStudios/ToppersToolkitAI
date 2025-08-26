'use server';
/**
 * @fileOverview A flow that offers information about Topper's Toolkit websites to help students with their doubts.
 *
 * - offerToppersToolkitInfo - A function that offers information about Topper's Toolkit websites.
 * - OfferToppersToolkitInfoInput - The input type for the offerToppersToolkitInfo function.
 * - OfferToppersToolkitInfoOutput - The return type for the offerToppersToolkitInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OfferToppersToolkitInfoInputSchema = z.object({
  doubt: z.string().describe('The student\'s doubt or question.'),
  studentName: z.string().describe('The name of the student asking the doubt.'),
});
export type OfferToppersToolkitInfoInput = z.infer<typeof OfferToppersToolkitInfoInputSchema>;

const OfferToppersToolkitInfoOutputSchema = z.object({
  relevantInfo: z
    .string()
    .describe(
      'Information about Topper\'s Toolkit websites that might help the student with their doubt.'
    ),
});
export type OfferToppersToolkitInfoOutput = z.infer<typeof OfferToppersToolkitInfoOutputSchema>;

export async function offerToppersToolkitInfo(input: OfferToppersToolkitInfoInput): Promise<OfferToppersToolkitInfoOutput> {
  return offerToppersToolkitInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'offerToppersToolkitInfoPrompt',
  input: {schema: OfferToppersToolkitInfoInputSchema},
  output: {schema: OfferToppersToolkitInfoOutputSchema},
  prompt: `You are an AI assistant helping a student named {{studentName}} with their doubt: {{doubt}}.

Topper's Toolkit includes the following websites:
- Library: A resource for educational materials.
- Shop: A place to purchase study aids.
- Doubts: A platform for doubt clearing.

Based on the student's doubt, determine if any of these websites could provide additional help. If so, explain how the website can help clear the doubt.

If none of the websites are relevant to the doubt, say that no Topper's Toolkit websites can help with the doubt.
`,
});

const offerToppersToolkitInfoFlow = ai.defineFlow(
  {
    name: 'offerToppersToolkitInfoFlow',
    inputSchema: OfferToppersToolkitInfoInputSchema,
    outputSchema: OfferToppersToolkitInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
