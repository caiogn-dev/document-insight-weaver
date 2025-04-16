
import { API_CONFIG, ASSISTANT_ROLES, AssistantRole } from '@/config/config';
import { searchSimilarDocuments } from './documentService';
import { retryWithBackoff, cacheData, getCachedData } from './fallbackService';
import { toast } from 'sonner';

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

// Function to query Grok API with fallback
export const queryGrokAPI = async (
  messages: Message[],
  role: AssistantRole = 'RESEARCHER',
  model: string = 'grok-1'
): Promise<string> => {
  try {
    // Get context from similar documents
    const userMessage = messages.filter(m => m.role === 'user').pop();
    let contextData = '';
    
    if (userMessage) {
      const similarDocs = await searchSimilarDocuments(userMessage.content);
      if (similarDocs.length > 0) {
        contextData = 'Context from documents:\n' + similarDocs.map(doc => doc.text).join('\n\n');
      }
    }

    // Create a cache key based on the user's messages
    const cacheKey = `chat_${JSON.stringify(messages).substring(0, 100)}`;
    const cachedResponse = getCachedData<string>(cacheKey);
    
    if (cachedResponse) {
      console.log('Using cached response for:', cacheKey);
      return cachedResponse;
    }

    // Format messages for Grok API
    const formattedMessages = [
      {
        role: 'system',
        content: `${ASSISTANT_ROLES[role].systemPrompt}\n\n${contextData ? contextData : 'No relevant document context found.'}`
      },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Call Grok API with retry logic
    const response = await retryWithBackoff(async () => {
      const res = await fetch(`${API_CONFIG.GROK.BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.GROK.API_KEY}`
        },
        body: JSON.stringify({
          model: model,
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to get response from Grok: ${res.statusText}`);
      }
      
      return res;
    });

    const data = await response.json();
    const responseContent = data.choices[0].message.content;
    
    // Cache successful response
    cacheData(cacheKey, responseContent);
    
    return responseContent;
  } catch (error) {
    console.error('Error querying Grok API:', error);
    
    // Fallback to a simple response
    toast.error('Failed to get response from AI', {
      description: 'Using fallback response. Some functionality may be limited.',
    });
    
    return createFallbackResponse(messages);
  }
};

// Function for fallback responses when API fails
function createFallbackResponse(messages: Message[]): string {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  
  // Extremely simple fallback - in a real app, you might use a local model
  return `I'm currently experiencing connectivity issues and can't provide a full response. 
  
Your question was about: "${lastUserMessage.substring(0, 100)}${lastUserMessage.length > 100 ? '...' : ''}"

I couldn't find relevant information in your documents.

Please try again later when the connection is restored. In the meantime, you can try:
1. Asking a more specific question
2. Uploading more relevant documents
3. Checking the API status in the dashboard`;
}

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
