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
    const salutation = gender === 'male' ? 'Sir' : "Ma'am";
    let welcomeMessage = 'No special message';

    // Using a switch statement for cleaner logic
    switch (teacherName.toLowerCase()) {
      // Core Administration
      case 'roy chan antony':
        welcomeMessage = `It is an absolute honor to welcome our esteemed Principal, Roy Chan Antony! Your focus on ethical values is the bedrock of our school's character. I am ready to assist you. How can I help you today, ${salutation}?`;
        break;
      case 'smitha roy':
        welcomeMessage = `A very warm welcome to our respected Incharge, Smitha Roy! Your leadership is instrumental to our school. It's a privilege to have you here. How may I be of service, ${salutation}?`;
        break;

      // Incharges & Coordinators
      case 'amit singh':
        welcomeMessage = `Welcome, Amit Singh! It's wonderful to see the incharge for classes 9 to 12. Thank you for your dedication. I'm here and ready to help with your query, ${salutation}.`;
        break;
      case 'divyam sir':
      case 'divyam':
        welcomeMessage = `Welcome, Divyam sir! Great to see our Hybrid Class Coordinator and IT Teacher. I'm ready to assist with any technical or academic query you have.`;
        break;

      // Current Teachers
      case 'shivkant sir':
      case 'shivkant':
        welcomeMessage = `Welcome, Shivkant sir! It's a pleasure to assist our History and Politics teacher for sections A and B. How can I help you today?`;
        break;
      case 'chandra prakash shukla':
        welcomeMessage = `Welcome, Chandra Prakash Shukla! Great to see our Section A teacher. How can I be of assistance, ${salutation}?`;
        break;
      case 'rajesh sir':
      case 'rajesh':
        welcomeMessage = `Welcome, Rajesh sir! It's a pleasure to see our Section B teacher. What can I help you with today?`;
        break;
      case 'sunil sir':
      case 'sunil':
        welcomeMessage = `Welcome, Sunil Sir! Honored to assist our H/C section teacher. How can I help you prepare for your class today?`;
        break;
      case 'adalat sir':
      case 'adalat':
        welcomeMessage = `Welcome, Adalat sir! It's wonderful to see our dedicated Hindi teacher. I'm here and ready to help.`;
        break;
      case 'ashish srivastava':
        welcomeMessage = `Welcome, Ashish Srivastava! We all appreciate your hard work as our Math teacher and Assistant Class Teacher. I am ready to assist you with your query, ${salutation}.`;
        break;
      case 'divakar pandey':
        welcomeMessage = `A warm welcome to our Physics teacher, Divakar Pandey! It's great to have you here. How can I help, ${salutation}?`;
        break;
      case 'amersh sir':
      case 'amersh':
        welcomeMessage = `Welcome, Amersh Sir! It's a pleasure to see our Chemistry teacher and Class Teacher. I'm here to support you.`;
        break;
      case 'ajay sir':
      case 'ajay':
        welcomeMessage = `Welcome, Ajay sir! It's an honor to have our first AI adopter here. Your way of explaining concepts is famous! How can I assist our Bio teacher today?`;
        break;

      // Previous Teachers
      case 'pramod sir':
      case 'pramod':
      case 'mantasha maam':
      case 'mantasha':
      case 'shailendra sir':
      case 'shailendra':
      case 'rahul sir':
      case 'rahul':
      case 'nirupma maam':
      case 'nirupma':
      case 'avdesh sir':
      case 'avdesh':
        welcomeMessage = `Welcome, ${teacherName}! It's so good to see one of our school's wonderful former teachers. Thank you for all your contributions. I'm here and ready to help you with your query.`;
        break;

      // Default for any other teacher not on the special list
      default:
        // A generic but respectful greeting for any user with role "Teacher"
        welcomeMessage = `Welcome! It's wonderful to see one of our school's amazing educators here. Thank you for your dedication to teaching. I'm here and ready to help you with your query.`;
        break;
    }
    
    return { welcomeMessage };
  }
);
