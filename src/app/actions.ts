'use server';

import { db } from '@/lib/firebase';
import { solveStudentDoubt } from '@/ai/flows/solve-student-doubt';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  limit,
  Timestamp,
} from 'firebase/firestore';

export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

function formatHistory(messages: Message[]): string {
  if (messages.length === 0) {
    return 'The user has just started the conversation.';
  }
  return `Here is the conversation history:\n${messages
    .map((m) => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content}`)
    .join('\n')}`;
}

export async function getAiResponse(
  studentName: string,
  studentClass: string,
  gender: string | undefined,
  currentMessages: Message[]
): Promise<string> {
  const lastUserMessage = currentMessages[currentMessages.length - 1];

  try {
    const userMessageForDb = {
      role: lastUserMessage.role,
      content: lastUserMessage.content,
      timestamp: serverTimestamp(),
    };
    await addDoc(collection(db, 'chats', studentName, 'messages'), userMessageForDb);

    const conversationHistoryText = formatHistory(currentMessages.slice(0, -1));
    
    const mainAnswerResponse = await solveStudentDoubt({
        studentName,
        studentClass,
        gender,
        question: lastUserMessage.content,
        conversationHistory: conversationHistoryText
    });
   
    const finalAnswer = mainAnswerResponse.answer;

    const aiMessage: Message = {
      role: 'assistant',
      content: finalAnswer,
      timestamp: new Date().toISOString(),
    };

    const aiMessageForDb = {
        role: aiMessage.role,
        content: aiMessage.content,
        timestamp: serverTimestamp()
    };
    await addDoc(collection(db, 'chats', studentName, 'messages'), aiMessageForDb);

    return finalAnswer;
  } catch (error) {
    console.error("Error getting AI response:", error);
    const errorMessage = "I'm having trouble connecting right now. Please try again in a moment.";
    const aiMessageForDb = {
      role: 'assistant',
      content: errorMessage,
      timestamp: serverTimestamp(),
    };
    await addDoc(collection(db, 'chats', studentName, 'messages'), aiMessageForDb);
    return errorMessage;
  }
}

export async function getChatHistory(
  studentName: string
): Promise<Message[]> {
  try {
    const messagesCol = collection(db, 'chats', studentName, 'messages');
    const q = query(messagesCol, orderBy('timestamp', 'asc'), limit(50));
    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp as Timestamp;
      return {
        id: doc.id,
        role: data.role,
        content: data.content,
        timestamp: timestamp ? timestamp.toDate().toISOString() : new Date().toISOString(),
      };
    }) as Message[];
    return messages;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
}
