'use server';

import { db } from '@/lib/firebase';
import { clearStudentDoubt } from '@/ai/flows/remember-student-context';
import { offerToppersToolkitInfo } from '@/ai/flows/offer-toppers-toolkit-info';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  limit,
} from 'firebase/firestore';

export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: any;
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
  currentMessages: Message[]
): Promise<string> {
  const lastUserMessage = currentMessages[currentMessages.length - 1];

  try {
    await addDoc(collection(db, 'chats', studentName, 'messages'), lastUserMessage);

    const conversationHistoryText = formatHistory(currentMessages);
    
    const [mainAnswerResponse, toolkitInfoResponse] = await Promise.all([
      clearStudentDoubt({
        studentName,
        doubt: conversationHistoryText,
      }),
      offerToppersToolkitInfo({
        studentName,
        doubt: lastUserMessage.content,
      }),
    ]);

    let finalAnswer = mainAnswerResponse.answer;

    if (
      toolkitInfoResponse.relevantInfo &&
      !toolkitInfoResponse.relevantInfo
        .toLowerCase()
        .includes("no topper's toolkit websites can help")
    ) {
      finalAnswer += `\n\n---\n\n**Suggestion from Topper's Toolkit:**\n${toolkitInfoResponse.relevantInfo}`;
    }

    const aiMessage: Message = {
      role: 'assistant',
      content: finalAnswer,
      timestamp: serverTimestamp(),
    };

    await addDoc(collection(db, 'chats', studentName, 'messages'), aiMessage);

    return finalAnswer;
  } catch (error) {
    console.error('Error getting AI response or saving to Firestore:', error);
    const errorMessage = "I'm having trouble connecting right now. Please try again in a moment.";
    const aiMessage: Message = {
      role: 'assistant',
      content: errorMessage,
      timestamp: serverTimestamp(),
    };
    await addDoc(collection(db, 'chats', studentName, 'messages'), aiMessage);
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
    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    return messages;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}
