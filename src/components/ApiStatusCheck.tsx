
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { API_CONFIG } from '@/config/config';
import { qdrantClient } from '@/services/setupService';
import { toast } from 'sonner';

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
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      const collections = await qdrantClient.getCollections();
      
      if (collections && collections.collections) {
        setApiStatus(prev => ({ ...prev, qdrant: 'success' }));
        console.log('Qdrant collections:', collections.collections.map(c => c.name).join(', '));
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

  const checkAllConnections = async () => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        checkGrokApi(),
        checkQdrantApi(),
        checkOllamaApi()
      ]);
      
      toast.success('API status check complete', {
        description: 'Connection status has been updated for all services.'
      });
    } catch (error) {
      console.error('Error checking connections:', error);
      toast.error('Failed to check some connections', {
        description: 'One or more services could not be reached.'
      });
    } finally {
      setIsRefreshing(false);
    }
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
    <Card className="w-full transition-all hover:shadow-md">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>API Status</CardTitle>
            <CardDescription>
              Check the status of connected APIs
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={checkAllConnections} 
            disabled={isRefreshing}
            className="rounded-full h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(apiStatus.grok)}
              <span className="font-medium">Grok API</span>
            </div>
            <Button size="sm" variant="ghost" onClick={checkGrokApi} className="h-8 px-2">
              Check
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(apiStatus.qdrant)}
              <span className="font-medium">Qdrant Vector DB</span>
            </div>
            <Button size="sm" variant="ghost" onClick={checkQdrantApi} className="h-8 px-2">
              Check
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(apiStatus.ollama)}
              <span className="font-medium">Ollama Embeddings</span>
            </div>
            <Button size="sm" variant="ghost" onClick={checkOllamaApi} className="h-8 px-2">
              Check
            </Button>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className={`py-1 px-2 rounded ${apiStatus.grok === 'success' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              Chat
            </div>
            <div className={`py-1 px-2 rounded ${apiStatus.qdrant === 'success' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              Storage
            </div>
            <div className={`py-1 px-2 rounded ${apiStatus.ollama === 'success' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              Embeddings
            </div>
          </div>
          
          <div className="flex justify-center mt-3">
            <Button 
              onClick={checkAllConnections} 
              className="w-full" 
              disabled={isRefreshing}
              variant={Object.values(apiStatus).includes('error') ? "destructive" : "default"}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check All Connections'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
