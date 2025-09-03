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
  writeBatch,
  where,
} from 'firebase/firestore';

export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  render?: boolean;
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
      render: true,
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
        timestamp: serverTimestamp(),
        render: true,
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
      render: true,
    };
    await addDoc(collection(db, 'chats', studentName, 'messages'), aiMessageForDb);
    return errorMessage;
  }
}

export async function getChatHistory(
  studentName: string,
  showArchived: boolean = false
): Promise<Message[]> {
  try {
    const messagesCol = collection(db, 'chats', studentName, 'messages');
    
    let q;
    if (showArchived) {
      q = query(messagesCol, orderBy('timestamp', 'asc'));
    } else {
      q = query(
        messagesCol,
        where('render', 'in', [true, null]),
        orderBy('timestamp', 'asc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp as Timestamp;
      return {
        id: doc.id,
        role: data.role,
        content: data.content,
        timestamp: timestamp ? timestamp.toDate().toISOString() : new Date().toISOString(),
        render: data.render,
      };
    }) as Message[];
    return messages;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    // When a composite index is missing, Firestore throws an error.
    // We can try a simpler query that fetches messages without the 'render' field for backward compatibility.
    try {
      const messagesCol = collection(db, 'chats', studentName, 'messages');
      const q = query(messagesCol, orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          // Manually filter for 'render' being true or null/undefined
          if (showArchived || data.render === true || data.render === undefined || data.render === null) {
            const timestamp = data.timestamp as Timestamp;
            return {
              id: doc.id,
              role: data.role,
              content: data.content,
              timestamp: timestamp ? timestamp.toDate().toISOString() : new Date().toISOString(),
              render: data.render,
            } as Message;
          }
          return null;
        })
        .filter(Boolean) as Message[];
      return messages;
    } catch (fallbackError) {
      console.error("Fallback error fetching chat history:", fallbackError);
      return [];
    }
  }
}

export async function hasChatHistory(studentName: string): Promise<boolean> {
    try {
      const messagesCol = collection(db, 'chats', studentName, 'messages');
      const q = query(messagesCol, where('render', 'in', [true, null]), limit(1));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      // Fallback for when the composite index doesn't exist yet
      console.warn("hasChatHistory query failed, falling back to fetching all messages and checking locally.");
      try {
        const allMessages = await getChatHistory(studentName, false);
        return allMessages.length > 0;
      } catch (fallbackError) {
        console.error("Error checking for chat history with fallback:", fallbackError);
        return false;
      }
    }
  }

export async function clearUserChatSession(studentName: string): Promise<{success: boolean, error?: string}> {
    try {
        const messagesCol = collection(db, 'chats', studentName, 'messages');
        const q = query(messagesCol, where('render', '!=', false));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: true };
        }

        const batch = writeBatch(db);
        querySnapshot.forEach(doc => {
            batch.update(doc.ref, { render: false });
        });

        await batch.commit();
        return { success: true };
    } catch (error) {
        console.error("Error clearing user chat session:", error);
        return { success: false, error: (error as Error).message };
    }
}
