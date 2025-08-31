'use server';
/**
 * @fileOverview A flow that provides a special welcome message for recognized teachers.
 *
 * - getTeacherWelcomeMessage - A function that returns a welcome message for a teacher.
 * - GetTeacherWelcomeMessageInput - The input type for the function.
 * - GetTeacherWelcomeMessageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetTeacherWelcomeMessageInputSchema = z.object({
  teacherName: z.string().describe("The full name of the teacher."),
  gender: z.string().describe("The teacher's gender ('male' or 'female')."),
});
export type GetTeacherWelcomeMessageInput = z.infer<typeof GetTeacherWelcomeMessageInputSchema>;

const GetTeacherWelcomeMessageOutputSchema = z.object({
  welcomeMessage: z.string().describe("The special welcome message, or 'No special message' if the teacher is not recognized."),
});
export type GetTeacherWelcomeMessageOutput = z.infer<typeof GetTeacherWelcomeMessageOutputSchema>;

export async function getTeacherWelcomeMessage(input: GetTeacherWelcomeMessageInput): Promise<GetTeacherWelcomeMessageOutput> {
  return getTeacherWelcomeMessageFlow(input);
}

const getTeacherWelcomeMessageFlow = ai.defineFlow(
  {
    name: 'getTeacherWelcomeMessageFlow',
    inputSchema: GetTeacherWelcomeMessageInputSchema,
    outputSchema: GetTeacherWelcomeMessageOutputSchema,
  },
  async ({ teacherName, gender }) => {
    const principalName = "[Principal's Full Name]";
    const directorName = "[Director's Full Name]";
    const teacherNames = [
      "[Teacher 1 Full Name]",
      "[Teacher 2 Full Name]",
      "[Teacher 3 Full Name]",
    ];
    
    const salutation = gender === 'male' ? 'Sir' : 'Ma\'am';

    let welcomeMessage = 'No special message';

    if (teacherName === principalName) {
      welcomeMessage = `It is an absolute honor to welcome our esteemed Principal, ${principalName}! Your leadership and vision are the bedrock of our school's success. I am ready to assist you with anything you need. How can I help you today, ${salutation}?`;
    } else if (teacherName === directorName) {
      welcomeMessage = `A very warm welcome to our respected Director, ${directorName}! Your guidance inspires us all to strive for excellence. It's a privilege to have you here. How may I be of service, ${salutation}?`;
    } else if (teacherNames.includes(teacherName)) {
      welcomeMessage = `Welcome, ${teacherName}! It's wonderful to see one of our school's amazing educators here. Thank you for your dedication to teaching. I'm here and ready to help you with your query.`;
    }
    
    return { welcomeMessage };
  }
);
