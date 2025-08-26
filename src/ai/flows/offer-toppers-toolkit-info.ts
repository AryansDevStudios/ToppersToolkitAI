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
  studentClass: z.string().describe("The student's class."),
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
  prompt: `You are an AI assistant helping a student named {{studentName}} in class {{studentClass}} with their doubt: "{{doubt}}".

Topper's Toolkit includes the following websites. Analyze the student's doubt and determine if any of these are relevant.

- **Topper's Toolkit Shop** (https://topperstoolkit.netlify.app/): This is where students can get study materials. It offers notes in both printed and PDF formats. There is also a "print on demand" service for custom PDFs. If the student is asking about buying notes, needing physical copies, or wanting to print something, this is the place to suggest.

- **Topper's Toolkit Library** (https://topperstoolkitviewer.netlify.app/): This is the student's personal digital library. After purchasing digital notes from the Shop, they can access and view them here. If a student is asking about where to find notes they've already purchased or how to view their digital materials, this is the correct service.

- **Topper's Toolkit Doubts**: This is the current chat platform for doubt clearing. You don't need to suggest this as they are already using it.

Based on the student's doubt, determine if the Shop or Library could provide additional help.
- If it is relevant, explain clearly how the specific website can help them. Provide the name of the service and its URL.
- If neither of the websites are relevant to the doubt, say that no Topper's Toolkit websites can help with the doubt.
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
