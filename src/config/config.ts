
export const API_CONFIG = {
  GROK: {
    BASE_URL: 'https://api.x.ai/v1',
    API_KEY: 'xai-KpZZyU6MIarnkWHwteAirawTVHo2PyLp65MJrQVVQGlW3AvXPqcrnPabMc4zoi1pUDi21DCg3jnggntL',
    FALLBACK_ENABLED: true,
  },
  QDRANT: {
    BASE_URL: 'https://e91380d5-0433-4f43-8d38-5932f7af19ff.us-east4-0.gcp.cloud.qdrant.io:6333',
    API_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIiwiZXhwIjoxNzQ1NjI2MjA4fQ.qVt8NZMFp9CsjlE7D4G_ZBJtCkJVr6AC9h3KxQcuAyw',
    FALLBACK_ENABLED: true,
    LOCAL_STORAGE_KEY: 'qdrant_cache',
  },
  OLLAMA: {
    BASE_URL: 'http://localhost:11434',
    FALLBACK_ENABLED: true,
    FALLBACK_MODEL: 'all-minilm', // Fallback to the same model when the API is down
  },
};

export const COLLECTION_NAME = 'documents';
export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 200;

export interface ModelConfig {
  grok: string;
  ollama: string;
}

export const DEFAULT_MODELS: ModelConfig = {
  grok: 'grok-1',
  ollama: 'all-minilm'
};

export const ASSISTANT_ROLES = {
  RESEARCHER: {
    id: 'researcher',
    name: 'Research Assistant',
    description: 'Specializes in analyzing documents and providing detailed insights',
    systemPrompt: 'You are a research assistant specializing in document analysis.',
  },
  WRITER: {
    id: 'writer',
    name: 'Content Writer',
    description: 'Focuses on generating well-structured documents and summaries',
    systemPrompt: 'You are a content writer focusing on clear and concise documentation.',
  },
  ANALYST: {
    id: 'analyst',
    name: 'Data Analyst',
    description: 'Analyzes data patterns and provides statistical insights',
    systemPrompt: 'You are a data analyst specializing in pattern recognition and statistical analysis.',
  },
} as const;

export type AssistantRole = keyof typeof ASSISTANT_ROLES;

// Fallback configuration
export const FALLBACK_CONFIG = {
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  CACHE_EXPIRATION_MS: 24 * 60 * 60 * 1000, // 24 hours
};
