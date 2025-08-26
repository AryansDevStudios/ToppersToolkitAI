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
  doc,
  deleteDoc,
  writeBatch,
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

export async function clearChatHistory(studentName: string): Promise<{ success: boolean }> {
  try {
    const messagesColRef = collection(db, 'chats', studentName, 'messages');
    const querySnapshot = await getDocs(messagesColRef);
    
    if (querySnapshot.empty) {
        return { success: true };
    }

    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error clearing chat history: ", error);
    return { success: false };
  }
}

// NOTE: This is a simplified search. For production, you would want a more robust
// full-text search solution like Algolia, Typesense, or an external vector DB.
// This linear scan will be slow and expensive on large datasets.
export async function getNoteContentForAI(query: string): Promise<string> {
    try {
        const subjectsSnapshot = await getDocs(collection(db, 'subjects'));
        if (subjectsSnapshot.empty) {
            return "No study materials found in the database.";
        }

        const queryLower = query.toLowerCase();
        let mostRelevantNote: { content: string; score: number } = { content: '', score: 0 };

        for (const subjectDoc of subjectsSnapshot.docs) {
            const subjectData = subjectDoc.data();
            const subSubjects = subjectData.subSubjects || [];

            for (const subSubject of subSubjects) {
                const chapters = subSubject.chapters || [];
                for (const chapter of chapters) {
                    const notes = chapter.notes || [];
                    for (const note of notes) {
                        // Simple keyword matching for relevance scoring
                        let currentScore = 0;
                        const noteContent = note.pdfUrl || ''; // Assuming content is in pdfUrl for now. This would be the extracted text in a real scenario.
                        const noteName = note.name?.toLowerCase() || '';
                        const chapterName = chapter.name?.toLowerCase() || '';
                        const subSubjectName = subSubject.name?.toLowerCase() || '';
                        const subjectName = subjectData.name?.toLowerCase() || '';
                        
                        if (noteName.includes(queryLower)) currentScore += 5;
                        if (chapterName.includes(queryLower)) currentScore += 3;
                        if (subSubjectName.includes(queryLower)) currentScore += 2;
                        if (subjectName.includes(queryLower)) currentScore += 1;
                        queryLower.split(' ').forEach(word => {
                            if (noteContent.toLowerCase().includes(word)) {
                                currentScore += 0.1;
                            }
                        })

                        // In a real implementation, you would fetch the content from pdfUrl,
                        // extract the text, and use that for the search.
                        // For now, we'll return metadata as a placeholder for the content.
                        const foundContent = `Content from: ${subjectData.name} -> ${subSubject.name} -> ${chapter.name} -> ${note.name}. PDF is at ${note.pdfUrl}.`;


                        if (currentScore > mostRelevantNote.score) {
                            mostRelevantNote = { content: foundContent, score: currentScore };
                        }
                    }
                }
            }
        }

        if (mostRelevantNote.score > 0) {
            return mostRelevantNote.content;
        }

        return "I couldn't find a specific note that directly addresses your question. I can try to answer using my general knowledge.";
    } catch (error) {
        console.error("Error searching notes in Firestore:", error);
        return "There was an error trying to search through your notes.";
    }
}
