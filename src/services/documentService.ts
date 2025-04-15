
import { CHUNK_SIZE, CHUNK_OVERLAP, COLLECTION_NAME, API_CONFIG } from '@/config/config';

// Function to extract text from files
export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

// Function to chunk text
export const chunkText = (text: string, chunkSize: number = CHUNK_SIZE, overlap: number = CHUNK_OVERLAP): string[] => {
  const chunks: string[] = [];
  let i = 0;
  
  while (i < text.length) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push(chunk);
    i += chunkSize - overlap;
  }
  
  return chunks;
};

// Function to create embeddings using Ollama
export const createEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await fetch(`${API_CONFIG.OLLAMA.BASE_URL}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'all-minilm',
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create embedding: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
};

// Function to store vectors in Qdrant
export const storeVectors = async (
  texts: string[],
  embeddings: number[][],
  metadata: Record<string, any>[]
): Promise<void> => {
  try {
    const points = embeddings.map((embedding, i) => ({
      id: crypto.randomUUID(),
      vector: embedding,
      payload: {
        text: texts[i],
        ...metadata[i]
      }
    }));

    const response = await fetch(`${API_CONFIG.QDRANT.BASE_URL}/collections/${COLLECTION_NAME}/points`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_CONFIG.QDRANT.API_KEY,
      },
      body: JSON.stringify({ points }),
    });

    if (!response.ok) {
      throw new Error(`Failed to store vectors: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error storing vectors:', error);
    throw error;
  }
};

// Function to search similar documents
export const searchSimilarDocuments = async (query: string, limit: number = 3): Promise<any[]> => {
  try {
    // Generate embedding for query
    const embedding = await createEmbedding(query);
    
    // Search Qdrant for similar vectors
    const response = await fetch(`${API_CONFIG.QDRANT.BASE_URL}/collections/${COLLECTION_NAME}/points/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_CONFIG.QDRANT.API_KEY,
      },
      body: JSON.stringify({
        vector: embedding,
        limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to search vectors: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result.map((item: any) => item.payload);
  } catch (error) {
    console.error('Error searching similar documents:', error);
    throw error;
  }
};

// Process a document: extract text, chunk, embed, and store
export const processDocument = async (file: File): Promise<void> => {
  try {
    // Extract text from file
    const text = await extractTextFromFile(file);
    
    // Chunk the text
    const chunks = chunkText(text);
    
    // Create embeddings for each chunk
    const embeddings = await Promise.all(chunks.map(chunk => createEmbedding(chunk)));
    
    // Store vectors in Qdrant
    const metadata = chunks.map(() => ({
      filename: file.name,
      fileType: file.type,
      timestamp: new Date().toISOString(),
    }));
    
    await storeVectors(chunks, embeddings, metadata);
    
    console.log(`Successfully processed document: ${file.name}`);
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
};
