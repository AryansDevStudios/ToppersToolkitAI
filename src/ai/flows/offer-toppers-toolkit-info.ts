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

---
### Topper's Toolkit Shop

- **Website URL:** https://topperstoolkit.netlify.app/
- **Purpose:** This is where students can get study materials. It offers notes in both printed and PDF formats. There is also a "print on demand" service for custom PDFs. 
- **Key Use Cases:** Suggest this service if a student is asking about buying notes, needing physical copies, or wanting to print something.
- **Related Links:**
    - Terms: https://topperstoolkit.netlify.app/terms
    - Manual: https://topperstoolkit.netlify.app/manual

- **Full Terms and Conditions for Topper's Toolkit Shop:**
    - **Last Updated:** 11-08-2025
    - **Owner:** Aryan Gupta (AryansDevStudios)
    - **Seller:** Kuldeep Singh
    - **Relationship with Access Site:** All digital notes purchased here are accessed exclusively through our official viewer platform, Topper’s Toolkit Viewer ([https://topperstoolkitviewer.netlify.app](https://topperstoolkitviewer.netlify.app)).
    - **Ownership:** All notes and materials are the sole property of Kuldeep Singh. Purchasing grants a license to use, not ownership. You cannot reproduce, distribute, or resell.
    - **Delivery:** Digital access is provided after payment verification (up to 1–2 hours). Printed orders are processed according to delivery timelines. A transaction is confirmed via WhatsApp.
    - **Refunds:** Refunds are only given for technical glitches on our side (fixed within 3 hours) or orders made by mistake (report within 15 minutes). No refunds for term violations.
    - **Prohibited Activities:** You may NOT download, save, screenshot, screen record, print, photocopy, scan, or share any notes (digital or printed). Sharing account credentials is also forbidden.
    - **Printed Purchases Terms:** Booklets are for personal use only and cannot be copied, scanned, photographed, or redistributed in any form.
    - **Anti-Piracy:** Content may contain digital watermarks. Violations are treated as copyright infringement.
    - **Enforcement:** Violating terms can lead to account suspension or a permanent ban, removal of access without refund, and potential legal action.
    - **Agreement:** Users must agree to terms at checkout.
    - **Availability:** Maximum expected downtime is 1 hour.

- **User Manual for Topper's Toolkit Shop:**
    - **Browsing:** Find subjects on the homepage, click a subject to see subcategories (e.g., Physics), then click a subcategory to see chapters.
    - **Adding to Cart:** Choose between PDF (digital, view-only in Library) or Printed (physical booklet). Click "Add to Cart."
    - **Print on Demand:** For custom documents, click "Go to Wormhole.app" to upload and get a link. Submit the link in our form. We will contact you on WhatsApp with a price.
    - **Checkout:** In your cart, provide your name, class, and WhatsApp number. Choose a payment method.
    - **Accessing Digital Notes:** Access is granted to the secure Library platform within 1–2 hours after order confirmation. Remember, digital notes are view-only.

---
### Topper's Toolkit Library

- **Website URL:** https://topperstoolkitviewer.netlify.app/
- **Purpose:** This is the student's personal digital library. After purchasing digital notes from the Shop, they can access and view them here.
- **Key Use Cases:** Suggest this service if a student is asking where to find notes they've already purchased or how to view their digital materials.
- **Related Links:**
    - Terms: https://topperstoolkitviewer.netlify.app/terms
    - Manual: https://topperstoolkitviewer.netlify.app/user-manual

---
### Topper's Toolkit Doubts
This is the current chat platform for doubt clearing. You don't need to suggest this as they are already using it.

---

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
