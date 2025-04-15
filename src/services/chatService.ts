
import { API_CONFIG, ASSISTANT_ROLES, AssistantRole } from '@/config/config';
import { searchSimilarDocuments } from './documentService';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  citations?: {
    text: string;
    source: string;
  }[];
}

// Function to query Grok API
export const queryGrokAPI = async (
  messages: Message[],
  role: AssistantRole = 'RESEARCHER'
): Promise<string> => {
  try {
    // Get context from similar documents
    const userMessage = messages.filter(m => m.role === 'user').pop();
    let context = '';
    
    if (userMessage) {
      const similarDocs = await searchSimilarDocuments(userMessage.content);
      if (similarDocs.length > 0) {
        context = 'Context from documents:\n' + similarDocs.map(doc => doc.text).join('\n\n');
      }
    }

    // Format messages for Grok API
    const formattedMessages = [
      {
        role: 'system',
        content: `${ASSISTANT_ROLES[role].systemPrompt}\n\n${context ? context : 'No relevant document context found.'}`
      },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Call Grok API
    const response = await fetch(`${API_CONFIG.GROK.BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.GROK.API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-1',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get response from Grok: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error querying Grok API:', error);
    throw error;
  }
};

// Function to extract citations from text
export const extractCitations = (text: string) => {
  // This is a simple implementation - could be enhanced with regex
  const citations = [];
  // Example pattern: [Citation: text from "source"]
  const pattern = /\[Citation: (.*?) from "(.*?)"\]/g;
  let match;
  
  while ((match = pattern.exec(text)) !== null) {
    citations.push({
      text: match[1],
      source: match[2]
    });
  }
  
  return citations;
};
