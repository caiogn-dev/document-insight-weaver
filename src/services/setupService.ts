
import { API_CONFIG, COLLECTION_NAME } from '@/config/config';

// Function to check if collection exists in Qdrant
export const checkCollectionExists = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.QDRANT.BASE_URL}/collections/${COLLECTION_NAME}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_CONFIG.QDRANT.API_KEY,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error checking collection:', error);
    return false;
  }
};

// Function to create collection in Qdrant
export const createCollection = async (dimension: number = 384): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.QDRANT.BASE_URL}/collections/${COLLECTION_NAME}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_CONFIG.QDRANT.API_KEY,
      },
      body: JSON.stringify({
        vectors: {
          size: dimension,
          distance: 'Cosine',
        },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error creating collection:', error);
    return false;
  }
};

// Function to initialize the vector database collection
export const initializeVectorStore = async (): Promise<void> => {
  try {
    const exists = await checkCollectionExists();
    
    if (!exists) {
      console.log(`Collection ${COLLECTION_NAME} does not exist, creating...`);
      const created = await createCollection();
      
      if (created) {
        console.log(`Collection ${COLLECTION_NAME} created successfully.`);
      } else {
        throw new Error(`Failed to create collection ${COLLECTION_NAME}`);
      }
    } else {
      console.log(`Collection ${COLLECTION_NAME} already exists.`);
    }
  } catch (error) {
    console.error('Error initializing vector store:', error);
    throw error;
  }
};
