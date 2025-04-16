
import { API_CONFIG, COLLECTION_NAME } from '@/config/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { toast } from 'sonner';

// Create Qdrant client
export const qdrantClient = new QdrantClient({
  url: API_CONFIG.QDRANT.BASE_URL,
  apiKey: API_CONFIG.QDRANT.API_KEY,
});

// Function to check if collection exists in Qdrant
export const checkCollectionExists = async (): Promise<boolean> => {
  try {
    const response = await qdrantClient.getCollection(COLLECTION_NAME);
    return !!response;
  } catch (error) {
    console.error('Error checking collection:', error);
    return false;
  }
};

// Function to create collection in Qdrant
export const createCollection = async (dimension: number = 384): Promise<boolean> => {
  try {
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: dimension,
        distance: 'Cosine',
      }
    });
    return true;
  } catch (error) {
    console.error('Error creating collection:', error);
    return false;
  }
};

// Function to initialize the vector database collection
export const initializeVectorStore = async (): Promise<void> => {
  try {
    // First check if we can connect to Qdrant
    try {
      const collections = await qdrantClient.getCollections();
      console.log('Successfully connected to Qdrant. Available collections:', 
        collections.collections.map(c => c.name).join(', '));
    } catch (err) {
      console.error('Could not connect to Qdrant:', err);
      toast.error('Could not connect to Qdrant', {
        description: 'Using local fallback for vector operations'
      });
      return; // Exit early and rely on fallback mechanisms
    }
    
    // Check if collection exists
    const exists = await checkCollectionExists();
    
    if (!exists) {
      console.log(`Collection ${COLLECTION_NAME} does not exist, creating...`);
      const created = await createCollection();
      
      if (created) {
        console.log(`Collection ${COLLECTION_NAME} created successfully.`);
        toast.success('Vector database initialized', {
          description: `Collection "${COLLECTION_NAME}" created successfully.`
        });
      } else {
        toast.error('Vector database initialization failed', {
          description: 'Using local fallback for vector operations'
        });
        throw new Error(`Failed to create collection ${COLLECTION_NAME}`);
      }
    } else {
      console.log(`Collection ${COLLECTION_NAME} already exists.`);
      toast.success('Vector database connected', {
        description: `Using existing collection "${COLLECTION_NAME}"`
      });
    }
  } catch (error) {
    console.error('Error initializing vector store:', error);
    throw error;
  }
};
