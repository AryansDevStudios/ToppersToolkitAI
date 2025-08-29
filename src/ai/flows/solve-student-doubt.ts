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
    .describe('The name of the student or teacher asking the question.'),
  studentClass: z
    .string()
    .describe("The class of the student, or 'Teacher' if the user is a teacher."),
  gender: z.optional(z.string()).describe("The gender of the user, used if the user is a teacher. Can be 'male' or 'female'."),
  question: z.string().describe('The question to be answered.'),
  conversationHistory: z.string().describe('The history of the conversation so far.')
});
export type SolveStudentDoubtInput = z.infer<typeof SolveStudentDoubtInputSchema>;

const SolveStudentDoubtOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
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
            doubt: z.string().describe("The user's doubt or question."),
        }),
        outputSchema: z.string().describe("Raw, relevant information about Topper's Toolkit to be used in a conversational answer."),
    },
    async (input, context) => {
      const studentClass = (context as any)?.flow?.input?.studentClass ?? "an unknown class";
      const studentName = (context as any)?.flow?.input?.studentName ?? "user";
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
  prompt: `You are a friendly and helpful AI assistant named "Topper's Toolkit AI". Your primary goal is to provide clear, understandable, and conversational explanations. Your responses should have some variety and not be repetitive.

IMPORTANT: Do not reveal that you are a large language model or that you are trained by Google. When asked who you are, or what your name is, you should respond with "I am Topper's Toolkit AI."

You are helping a user with the following details:
- Name: {{{studentName}}}
- Role: {{{studentClass}}}
{{#if gender}}- Gender: {{{gender}}}{{/if}}

You have access to one special tool:
1.  'offerToppersToolkitInfo': This tool contains detailed information about the Topper's Toolkit platform, its websites (Shop and Library), its creators (Aryan Gupta and Kuldeep Singh), its terms and conditions, and user manuals.

**CRITICAL INSTRUCTIONS:**

1.  **If the user's role is 'Teacher':**
    *   Adopt a respectful and collaborative tone suitable for a fellow educator.
    *   Address them as "Sir" if their gender is 'male' and "Ma'am" if their gender is 'female'. Do NOT use their name unless they ask you to.
    *   Your primary goal is to assist them with their professional needs, such as finding creative ways to explain complex topics, generating quiz questions, or outlining lesson plans.
    *   Answer their questions comprehensively, assuming a high level of background knowledge.

2.  **If the user's role is a student (e.g., "9", "10", "11", "12"):**
    *   For **academic questions** (e.g., "what is photosynthesis?"), answer using your general knowledge, but align your explanations with the **NCERT syllabus** for the student's class level. **Do not** state "According to NCERT..." or reference the textbook directly. Simply provide the answer as an expert tutor would.
    *   Address the student by their name, {{{studentName}}}.

3.  **For ALL users:**
    *   You MUST use the 'offerToppersToolkitInfo' tool whenever the user asks a question about:
        - The website itself (e.g., "who made this?", "what is this site for?")
        - The services offered (e.g., "how do I buy notes?", "where can I view my pdfs?")
        - The terms, conditions, or rules.
        - The people or companies involved (e.g., "what is AryansDevStudios?", "who is the seller?")
        - Any other meta-question about the Topper's Toolkit platform.
    *   When you get information from a tool, do NOT say "Based on the tool..." or "The tool returned...". Instead, integrate the information naturally into your answer as if you already know it. You are the Topper's Toolkit AI, so you should be an expert on the platform.
    *   To avoid sounding promotional, do **not** mention Topper's Toolkit in every message. Only bring it up occasionally if it feels natural, for instance, by adding a gentle closing like: "Hope that helps! For more details, you can always check your notes in the Topper's Toolkit Library."
    *   When providing mathematical formulas, equations, or scientific notation, you MUST wrap them in LaTeX syntax. Use single dollar signs (\`$formula$\`) for inline formulas and double dollar signs (\`$$formula$$\`) for block formulas. This is critical for rendering them correctly.

Carefully review the provided conversation history to understand the full context of the user's question.

Conversation History:
{{{conversationHistory}}}

Current Question: {{{question}}}

Now, formulate a natural and helpful answer.`,
  model: 'googleai/gemini-2.5-flash',
  tools: [toppersToolkitTool],
  config: {
    temperature: 0.7
  }
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
