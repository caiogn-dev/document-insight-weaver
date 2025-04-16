
import { API_CONFIG } from '@/config/config';

export interface Model {
  id: string;
  name: string;
  description?: string;
  type: 'chat' | 'embeddings';
  status?: 'available' | 'limited' | 'unavailable';
}

export const fetchGrokModels = async (): Promise<Model[]> => {
  try {
    const response = await fetch(`${API_CONFIG.GROK.BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${API_CONFIG.GROK.API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Grok models');
    }

    const data = await response.json();
    return data.data.map((model: any) => ({
      id: model.id,
      name: model.name || model.id,
      description: model.description,
      type: 'chat',
      status: 'available' // Default status for fetched models
    }));
  } catch (error) {
    console.error('Error fetching Grok models:', error);
    return [
      { id: 'grok-1', name: 'Grok-1', type: 'chat', status: 'available' },
      { id: 'grok-1-pro', name: 'Grok-1 Pro', type: 'chat', status: 'available' }
    ];
  }
};

export const fetchOllamaModels = async (): Promise<Model[]> => {
  try {
    const response = await fetch(`${API_CONFIG.OLLAMA.BASE_URL}/api/tags`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Ollama models');
    }

    const data = await response.json();
    return data.models.map((model: any) => ({
      id: model.name,
      name: model.name,
      description: `Size: ${model.size}`,
      type: 'embeddings',
      status: 'available' // Default status for fetched models
    }));
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return [
      { id: 'all-minilm', name: 'All-MiniLM', type: 'embeddings', status: 'available' },
      { id: 'nomic-embed-text', name: 'Nomic Embed', type: 'embeddings', status: 'available' }
    ];
  }
};
