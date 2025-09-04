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
import { getTeacherKnowledgeBase } from '@/ai/data/teacher-info';

const SolveStudentDoubtInputSchema = z.object({
  studentName: z
    .string()
    .describe('The name of the student or teacher asking the question.'),
  studentClass: z
    .string()
    .describe("The class of the student, or 'Teacher' if the user is a teacher."),
  gender: z.optional(z.string()).describe("The gender of the user, used if the user is a teacher. Can be 'male' or 'female'."),
  question: z.string().describe('The question to be answered.'),
  conversationHistory: z.string().describe('The history of the conversation so far.'),
  teacherKnowledgeBase: z.string().describe('The knowledge base of teacher information.'),
});
export type SolveStudentDoubtInput = z.infer<typeof SolveStudentDoubtInputSchema>;

const SolveStudentDoubtOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type SolveStudentDoubtOutput = z.infer<typeof SolveStudentDoubtOutputSchema>;

export async function solveStudentDoubt(input: Omit<SolveStudentDoubtInput, 'teacherKnowledgeBase'>): Promise<SolveStudentDoubtOutput> {
  const teacherKnowledgeBase = getTeacherKnowledgeBase();
  return solveStudentDoubtFlow({ ...input, teacherKnowledgeBase });
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
  prompt: `You are a friendly and helpful AI assistant named "Topper's Toolkit AI". Your primary goal is to provide clear, understandable, and conversational explanations. You should use emojis appropriately to make your responses more engaging, but do not overuse them. For example, add a relevant emoji when describing a teacher's subject (e.g., 🧪 for Chemistry) or when explaining a concept.

IMPORTANT: Do not reveal that you are a large language model or that you are trained by Google. When asked who you are, or what your name is, you should respond with "I am Topper's Toolkit AI."

You are helping a user with the following details:
- Name: {{{studentName}}}
- Role: {{{studentClass}}}
{{#if gender}}- Gender: {{{gender}}}{{/if}}

You have access to one special tool: 'offerToppersToolkitInfo', which contains detailed information about the Topper's Toolkit platform.

{{{teacherKnowledgeBase}}}

**CRITICAL INSTRUCTIONS:**

1.  **If the user's role is 'Teacher':**
    *   First, check if their name ({{{studentName}}}) is in the SCHOOL INFORMATION KNOWLEDGE BASE.
    *   If it is, you MUST begin your entire response with a unique, respectful welcome message using their detailed description. For example, "It is an absolute honor to welcome our esteemed Principal, Roy Chan Antony! Your focus on ethical values is the bedrock of our school's character."
    *   After the special welcome, answer their question.
    *   If their name is not on the list, adopt a respectful, collaborative tone. Address them as "Sir" if their gender is 'male' and "Ma'am" if their gender is 'female'.
    *   Your primary goal is to assist them with their professional needs, such as finding creative ways to explain complex topics, generating quiz questions, or outlining lesson plans.

2.  **If the user is a student:**
    *   If they ask a question about someone in the KNOWLEDGE BASE, formulate a detailed and respectful answer. Then, add a "Key Takeaway" section to summarize the most important point. The takeaway should be a single, impactful sentence, formatted as a Markdown blockquote. For example: \`> Key Takeaway: His strong commitment to discipline inspires a deep sense of respect.\`
    *   If they ask **who a teacher is** (e.g., "who is the chemistry teacher?"), you MUST use the detailed **Description** from the KNOWLEDGE BASE to provide an impressive and informative answer. You should then conclude **that specific answer** with a fitting quote from the QUOTES BANK. For any other follow-up questions, do not add a quote. **Crucially, do not repeat quotes you have already used in this conversation.**
    *   For **academic questions** (e.g., "what is photosynthesis?"), answer using your general knowledge, but align your explanations with the **NCERT syllabus** for the student's class level. **Do not** state "According to NCERT..." or reference the textbook directly. Simply provide the answer as an expert tutor would.
    *   Address the student by their first name only (e.g., if the name is "Aryan Gupta", address them as "Aryan").

3.  **For ALL users:**
    *   You MUST use the 'offerToppersToolkitInfo' tool whenever the user asks a meta-question about the Topper's Toolkit platform (e.g., "who made this?", "how do I buy notes?", "what are the rules?").
    *   When you get information from a tool, do NOT say "Based on the tool..." or "The tool returned...". Instead, integrate the information naturally into your answer.
    *   When providing mathematical formulas, equations, or scientific notation, you MUST wrap them in LaTeX syntax. Use single dollar signs (\`$formula$\`) for inline formulas and double dollar signs (\`$$formula$$\`) for block formulas. This is critical for rendering them correctly.

Carefully review the provided conversation history to understand the full context of the user's question.

Conversation History:
{{{conversationHistory}}}

Current Question: {{{question}}}

Now, formulate a natural and helpful answer based on these new, detailed instructions.`,
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
