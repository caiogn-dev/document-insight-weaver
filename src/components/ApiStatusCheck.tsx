
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { API_CONFIG } from '@/config/config';

interface ApiStatus {
  grok: 'idle' | 'checking' | 'success' | 'error';
  qdrant: 'idle' | 'checking' | 'success' | 'error';
  ollama: 'idle' | 'checking' | 'success' | 'error';
}

export function ApiStatusCheck() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    grok: 'idle',
    qdrant: 'idle',
    ollama: 'idle',
  });

  const checkGrokApi = async () => {
    setApiStatus(prev => ({ ...prev, grok: 'checking' }));
    try {
      const response = await fetch(`${API_CONFIG.GROK.BASE_URL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.GROK.API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setApiStatus(prev => ({ ...prev, grok: 'success' }));
      } else {
        setApiStatus(prev => ({ ...prev, grok: 'error' }));
      }
    } catch (error) {
      console.error('Error checking Grok API:', error);
      setApiStatus(prev => ({ ...prev, grok: 'error' }));
    }
  };

  const checkQdrantApi = async () => {
    setApiStatus(prev => ({ ...prev, qdrant: 'checking' }));
    try {
      const response = await fetch(`${API_CONFIG.QDRANT.BASE_URL}/collections`, {
        method: 'GET',
        headers: {
          'api-key': API_CONFIG.QDRANT.API_KEY,
        },
      });
      
      if (response.ok) {
        setApiStatus(prev => ({ ...prev, qdrant: 'success' }));
      } else {
        setApiStatus(prev => ({ ...prev, qdrant: 'error' }));
      }
    } catch (error) {
      console.error('Error checking Qdrant API:', error);
      setApiStatus(prev => ({ ...prev, qdrant: 'error' }));
    }
  };

  const checkOllamaApi = async () => {
    setApiStatus(prev => ({ ...prev, ollama: 'checking' }));
    try {
      const response = await fetch(`${API_CONFIG.OLLAMA.BASE_URL}/api/tags`, {
        method: 'GET',
      });
      
      if (response.ok) {
        setApiStatus(prev => ({ ...prev, ollama: 'success' }));
      } else {
        setApiStatus(prev => ({ ...prev, ollama: 'error' }));
      }
    } catch (error) {
      console.error('Error checking Ollama API:', error);
      setApiStatus(prev => ({ ...prev, ollama: 'error' }));
    }
  };

  const checkAllConnections = () => {
    checkGrokApi();
    checkQdrantApi();
    checkOllamaApi();
  };

  // Check connections on mount
  useEffect(() => {
    checkAllConnections();
  }, []);

  const getStatusIcon = (status: 'idle' | 'checking' | 'success' | 'error') => {
    switch (status) {
      case 'idle':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      case 'checking':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>API Status</CardTitle>
        <CardDescription>
          Check the status of connected APIs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(apiStatus.grok)}
              <span>Grok API</span>
            </div>
            <Button size="sm" variant="outline" onClick={checkGrokApi}>
              Check
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(apiStatus.qdrant)}
              <span>Qdrant Vector DB</span>
            </div>
            <Button size="sm" variant="outline" onClick={checkQdrantApi}>
              Check
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(apiStatus.ollama)}
              <span>Ollama Embeddings</span>
            </div>
            <Button size="sm" variant="outline" onClick={checkOllamaApi}>
              Check
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={checkAllConnections}>
            Check All Connections
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
