
import { CHUNK_SIZE, CHUNK_OVERLAP, COLLECTION_NAME, API_CONFIG } from '@/config/config';
import { retryWithBackoff, cacheData, getCachedData, storeVectorsInLocalCache, localVectorSearch } from './fallbackService';
import { toast } from 'sonner';

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
    // First try to get from cache
    const cacheKey = `embedding_${text.substring(0, 100)}`;
    const cachedEmbedding = getCachedData<number[]>(cacheKey);
    
    if (cachedEmbedding) {
      return cachedEmbedding;
    }
    
    // If not in cache, try to get from API with retry logic
    const embedding = await retryWithBackoff(async () => {
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
    });
    
    // Cache the result
    cacheData(cacheKey, embedding);
    
    return embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    toast.error('Failed to create embedding. Using fallback method.', {
      description: 'Some functionality may be limited.',
    });
    
    // In a real app, you might have a more sophisticated fallback
    // For demo purposes, we'll return a random embedding
    const mockEmbedding = Array.from({ length: 384 }, () => Math.random() * 2 - 1);
    return mockEmbedding;
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

    // Store in local cache for fallback
    storeVectorsInLocalCache(points);
    
    // Store in Qdrant with retry logic
    await retryWithBackoff(async () => {
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
    });
    
    toast.success('Vectors stored successfully', {
      description: `${texts.length} chunks have been processed and stored.`,
    });
  } catch (error) {
    console.error('Error storing vectors:', error);
    toast.warning('Vectors stored locally only', {
      description: 'Connection to Qdrant failed. Vectors are stored locally for fallback.',
    });
    // We've already stored in local cache above, so no additional fallback needed here
  }
};

// Function to search similar documents
export const searchSimilarDocuments = async (query: string, limit: number = 3): Promise<any[]> => {
  try {
    // Generate embedding for query
    const embedding = await createEmbedding(query);
    
    // Search Qdrant with retry logic
    try {
      const response = await retryWithBackoff(async () => {
        const res = await fetch(`${API_CONFIG.QDRANT.BASE_URL}/collections/${COLLECTION_NAME}/points/search`, {
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

        if (!res.ok) {
          throw new Error(`Failed to search vectors: ${res.statusText}`);
        }
        
        return res;
      });

      const data = await response.json();
      return data.result.map((item: any) => item.payload);
    } catch (error) {
      console.error('Error searching from Qdrant, falling back to local search:', error);
      toast.warning('Using local vector search', {
        description: 'Connection to Qdrant failed. Search results may be limited.',
      });
      
      // Fall back to local search
      return localVectorSearch(embedding, limit);
    }
  } catch (error) {
    console.error('Error searching similar documents:', error);
    toast.error('Failed to search documents', {
      description: 'Both remote and local searches failed.',
    });
    return [];
  }
};

// Process a document: extract text, chunk, embed, and store
export const processDocument = async (
  file: File, 
  onProgressUpdate?: (info: {
    stage: string;
    progress: number;
    stats: any;
  }) => void
): Promise<void> => {
  try {
    // Extract text from file
    onProgressUpdate?.({
      stage: "uploading",
      progress: 10,
      stats: { totalChunks: 0, processedChunks: 0, vectorsGenerated: 0 }
    });
    
    const text = await extractTextFromFile(file);
    
    // Chunk the text
    onProgressUpdate?.({
      stage: "extracting",
      progress: 30,
      stats: { totalChunks: 0, processedChunks: 0, vectorsGenerated: 0 }
    });
    
    const chunks = chunkText(text);
    
    // Start timer for processing
    const startTime = Date.now();
    
    // Create embeddings for each chunk
    const embeddings = [];
    let processedChunks = 0;
    
    onProgressUpdate?.({
      stage: "embedding",
      progress: 40,
      stats: { 
        totalChunks: chunks.length, 
        processedChunks: 0, 
        vectorsGenerated: 0,
        timeElapsed: 0,
        estimatedTimeRemaining: 0
      }
    });
    
    for (const chunk of chunks) {
      const embedding = await createEmbedding(chunk);
      embeddings.push(embedding);
      processedChunks++;
      
      const progress = 40 + (processedChunks / chunks.length) * 40;
      const timeElapsed = (Date.now() - startTime) / 1000;
      const estimatedTotalTime = (timeElapsed / processedChunks) * chunks.length;
      const estimatedTimeRemaining = Math.max(0, estimatedTotalTime - timeElapsed);
      
      onProgressUpdate?.({
        stage: "embedding",
        progress,
        stats: { 
          totalChunks: chunks.length, 
          processedChunks,
          vectorsGenerated: processedChunks,
          timeElapsed,
          estimatedTimeRemaining
        }
      });
    }
    
    // Store vectors in Qdrant
    onProgressUpdate?.({
      stage: "storing",
      progress: 80,
      stats: { 
        totalChunks: chunks.length, 
        processedChunks: chunks.length, 
        vectorsGenerated: chunks.length,
        timeElapsed: (Date.now() - startTime) / 1000,
        estimatedTimeRemaining: 0
      }
    });
    
    const metadata = chunks.map(() => ({
      filename: file.name,
      fileType: file.type,
      timestamp: new Date().toISOString(),
    }));
    
    await storeVectors(chunks, embeddings, metadata);
    
    // Processing complete
    onProgressUpdate?.({
      stage: "complete",
      progress: 100,
      stats: { 
        totalChunks: chunks.length, 
        processedChunks: chunks.length, 
        vectorsGenerated: chunks.length,
        timeElapsed: (Date.now() - startTime) / 1000,
        estimatedTimeRemaining: 0
      }
    });
    
    console.log(`Successfully processed document: ${file.name}`);
  } catch (error) {
    console.error('Error processing document:', error);
    
    onProgressUpdate?.({
      stage: "error",
      progress: 0,
      stats: { totalChunks: 0, processedChunks: 0, vectorsGenerated: 0 }
    });
    
    toast.error('Document processing failed', {
      description: error instanceof Error ? error.message : 'Unknown error occurred',
    });
    
    throw error;
  }
};
