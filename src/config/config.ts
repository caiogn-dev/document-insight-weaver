
export const API_CONFIG = {
  GROK: {
    BASE_URL: 'https://api.x.ai/v1',
    API_KEY: 'xai-KpZZyU6MIarnkWHwteAirawTVHo2PyLp65MJrQVVQGlW3AvXPqcrnPabMc4zoi1pUDi21DCg3jnggntL',
  },
  QDRANT: {
    BASE_URL: 'https://e91380d5-0433-4f43-8d38-5932f7af19ff.us-east4-0.gcp.cloud.qdrant.io:6333',
    API_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.BfJWuuXEQDXciSvtLDbUFbVkqNezhahrJLQZMwO_l-Y',
  },
  OLLAMA: {
    BASE_URL: 'http://localhost:11434',
  },
};

export const COLLECTION_NAME = 'documents';
export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 200;

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
