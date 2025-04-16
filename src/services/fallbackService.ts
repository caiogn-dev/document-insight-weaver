
import { API_CONFIG, FALLBACK_CONFIG } from '@/config/config';

// Generic function to retry API calls with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>, 
  maxRetries: number = FALLBACK_CONFIG.MAX_RETRY_ATTEMPTS
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.warn(`Attempt ${attempt + 1}/${maxRetries} failed:`, error);
      lastError = error as Error;
      
      // Wait with exponential backoff
      const delay = FALLBACK_CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Simple in-memory cache for fallbacks
const cache = new Map<string, { data: any; timestamp: number }>();

export function getCachedData<T>(key: string): T | null {
  const item = cache.get(key);
  
  if (!item) {
    return null;
  }
  
  // Check if expired
  if (Date.now() - item.timestamp > FALLBACK_CONFIG.CACHE_EXPIRATION_MS) {
    cache.delete(key);
    return null;
  }
  
  return item.data as T;
}

export function cacheData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

// Local storage based cache for larger data (for Qdrant fallback)
export function storeVectorsInLocalCache(vectors: any[]): void {
  try {
    if (!API_CONFIG.QDRANT.FALLBACK_ENABLED) return;
    
    const key = API_CONFIG.QDRANT.LOCAL_STORAGE_KEY;
    const existingData = localStorage.getItem(key);
    const existingVectors = existingData ? JSON.parse(existingData) : [];
    
    // Append new vectors
    const updatedVectors = [...existingVectors, ...vectors];
    
    // Store back in localStorage with a timestamp
    localStorage.setItem(key, JSON.stringify(updatedVectors));
    localStorage.setItem(`${key}_timestamp`, Date.now().toString());
  } catch (error) {
    console.error('Error storing vectors in local cache:', error);
  }
}

export function getVectorsFromLocalCache(): any[] {
  try {
    if (!API_CONFIG.QDRANT.FALLBACK_ENABLED) return [];
    
    const key = API_CONFIG.QDRANT.LOCAL_STORAGE_KEY;
    const data = localStorage.getItem(key);
    const timestamp = localStorage.getItem(`${key}_timestamp`);
    
    if (!data || !timestamp) {
      return [];
    }
    
    // Check if expired
    if (Date.now() - parseInt(timestamp) > FALLBACK_CONFIG.CACHE_EXPIRATION_MS) {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_timestamp`);
      return [];
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error retrieving vectors from local cache:', error);
    return [];
  }
}

// Simple cosine similarity for local vector search
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Local search fallback
export function localVectorSearch(queryVector: number[], limit: number = 3): any[] {
  const vectors = getVectorsFromLocalCache();
  
  if (vectors.length === 0) {
    return [];
  }
  
  // Calculate similarities
  const vectorsWithSimilarity = vectors.map((item: any) => ({
    ...item,
    similarity: cosineSimilarity(queryVector, item.vector),
  }));
  
  // Sort by similarity (descending)
  vectorsWithSimilarity.sort((a, b) => b.similarity - a.similarity);
  
  // Return top results
  return vectorsWithSimilarity.slice(0, limit).map(item => item.payload);
}
