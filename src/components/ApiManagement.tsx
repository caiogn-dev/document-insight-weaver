
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Loader2, Settings, Shield, Database, Brain } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { API_CONFIG } from "@/config/config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApiStatus {
  grok: 'idle' | 'checking' | 'success' | 'error';
  qdrant: 'idle' | 'checking' | 'success' | 'error';
  ollama: 'idle' | 'checking' | 'success' | 'error';
}

interface ApiConfig {
  GROK: {
    BASE_URL: string;
    API_KEY: string;
  };
  QDRANT: {
    BASE_URL: string;
    API_KEY: string;
  };
  OLLAMA: {
    BASE_URL: string;
  };
}

export function ApiManagement() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    grok: 'idle',
    qdrant: 'idle',
    ollama: 'idle',
  });
  
  const [apiConfig, setApiConfig] = useState<ApiConfig>(API_CONFIG);
  const [activeTab, setActiveTab] = useState("grok");
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  const testGrokApi = async () => {
    setApiStatus(prev => ({ ...prev, grok: 'checking' }));
    try {
      const response = await fetch(`${apiConfig.GROK.BASE_URL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiConfig.GROK.API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setApiStatus(prev => ({ ...prev, grok: 'success' }));
        toast({
          title: "Grok API Connected",
          description: "Successfully connected to Grok API",
        });
      } else {
        setApiStatus(prev => ({ ...prev, grok: 'error' }));
        toast({
          variant: "destructive",
          title: "Grok API Error",
          description: `Error: ${response.status} - ${response.statusText}`,
        });
      }
    } catch (error) {
      console.error('Error checking Grok API:', error);
      setApiStatus(prev => ({ ...prev, grok: 'error' }));
      toast({
        variant: "destructive",
        title: "Grok API Error",
        description: error instanceof Error ? error.message : "Failed to connect",
      });
    }
  };

  const testQdrantApi = async () => {
    setApiStatus(prev => ({ ...prev, qdrant: 'checking' }));
    try {
      const response = await fetch(`${apiConfig.QDRANT.BASE_URL}/collections`, {
        method: 'GET',
        headers: {
          'api-key': apiConfig.QDRANT.API_KEY,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setApiStatus(prev => ({ ...prev, qdrant: 'success' }));
        toast({
          title: "Qdrant API Connected",
          description: "Successfully connected to Qdrant API",
        });
      } else {
        setApiStatus(prev => ({ ...prev, qdrant: 'error' }));
        toast({
          variant: "destructive",
          title: "Qdrant API Error",
          description: `Error: ${response.status} - ${response.statusText}`,
        });
      }
    } catch (error) {
      console.error('Error checking Qdrant API:', error);
      setApiStatus(prev => ({ ...prev, qdrant: 'error' }));
      toast({
        variant: "destructive",
        title: "Qdrant API Error",
        description: error instanceof Error ? error.message : "Failed to connect",
      });
    }
  };

  const testOllamaApi = async () => {
    setApiStatus(prev => ({ ...prev, ollama: 'checking' }));
    try {
      const response = await fetch(`${apiConfig.OLLAMA.BASE_URL}/api/tags`, {
        method: 'GET',
      });
      
      if (response.ok) {
        setApiStatus(prev => ({ ...prev, ollama: 'success' }));
        toast({
          title: "Ollama API Connected",
          description: "Successfully connected to Ollama API",
        });
      } else {
        setApiStatus(prev => ({ ...prev, ollama: 'error' }));
        toast({
          variant: "destructive",
          title: "Ollama API Error",
          description: `Error: ${response.status} - ${response.statusText}`,
        });
      }
    } catch (error) {
      console.error('Error checking Ollama API:', error);
      setApiStatus(prev => ({ ...prev, ollama: 'error' }));
      toast({
        variant: "destructive",
        title: "Ollama API Error",
        description: error instanceof Error ? error.message : "Failed to connect",
      });
    }
  };

  const testAllConnections = () => {
    testGrokApi();
    testQdrantApi();
    testOllamaApi();
  };

  const saveApiConfig = () => {
    // In a real application, you would persist this to localStorage or a backend
    // For now, we'll just use it in memory and show a toast
    toast({
      title: "Settings Saved",
      description: "API configuration has been updated",
    });
    setOpenDialog(false);
    testAllConnections();
  };

  const getStatusIcon = (status: 'idle' | 'checking' | 'success' | 'error') => {
    switch (status) {
      case 'idle':
        return <AlertCircle className="h-5 w-5 text-slate-400" />;
      case 'checking':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  useEffect(() => {
    // Check connections on mount
    testAllConnections();
  }, []);

  return (
    <Card className="w-full border-2 transition-all duration-300 hover:shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">API Status</CardTitle>
            <CardDescription>
              Manage and monitor connected API services
            </CardDescription>
          </div>
          
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>API Configuration</DialogTitle>
                <DialogDescription>
                  Update API endpoints and credentials for the application.
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="grok" value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="grok">Grok</TabsTrigger>
                  <TabsTrigger value="qdrant">Qdrant</TabsTrigger>
                  <TabsTrigger value="ollama">Ollama</TabsTrigger>
                </TabsList>
                
                <TabsContent value="grok" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Base URL</label>
                    <Input 
                      value={apiConfig.GROK.BASE_URL} 
                      onChange={(e) => setApiConfig({
                        ...apiConfig,
                        GROK: { ...apiConfig.GROK, BASE_URL: e.target.value }
                      })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <Input 
                      type="password" 
                      value={apiConfig.GROK.API_KEY} 
                      onChange={(e) => setApiConfig({
                        ...apiConfig,
                        GROK: { ...apiConfig.GROK, API_KEY: e.target.value }
                      })} 
                    />
                  </div>
                  <Button onClick={testGrokApi} className="w-full">Test Connection</Button>
                </TabsContent>
                
                <TabsContent value="qdrant" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Base URL</label>
                    <Input 
                      value={apiConfig.QDRANT.BASE_URL} 
                      onChange={(e) => setApiConfig({
                        ...apiConfig,
                        QDRANT: { ...apiConfig.QDRANT, BASE_URL: e.target.value }
                      })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <Input 
                      type="password" 
                      value={apiConfig.QDRANT.API_KEY} 
                      onChange={(e) => setApiConfig({
                        ...apiConfig,
                        QDRANT: { ...apiConfig.QDRANT, API_KEY: e.target.value }
                      })} 
                    />
                  </div>
                  <Button onClick={testQdrantApi} className="w-full">Test Connection</Button>
                </TabsContent>
                
                <TabsContent value="ollama" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Base URL</label>
                    <Input 
                      value={apiConfig.OLLAMA.BASE_URL} 
                      onChange={(e) => setApiConfig({
                        ...apiConfig,
                        OLLAMA: { ...apiConfig.OLLAMA, BASE_URL: e.target.value }
                      })} 
                    />
                  </div>
                  <Button onClick={testOllamaApi} className="w-full">Test Connection</Button>
                </TabsContent>
              </Tabs>
              
              <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
                <Button variant="secondary" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={saveApiConfig}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900/50 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium">Grok API</h3>
                <p className="text-xs text-slate-500">LLM service for RAG assistant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(apiStatus.grok)}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={testGrokApi}>
                      Test
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Test Grok API connection</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900/50 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium">Qdrant Vector DB</h3>
                <p className="text-xs text-slate-500">Vector storage for embeddings</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(apiStatus.qdrant)}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={testQdrantApi}>
                      Test
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Test Qdrant Vector DB connection</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900/50 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium">Ollama Embeddings</h3>
                <p className="text-xs text-slate-500">Generates text embeddings</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(apiStatus.ollama)}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={testOllamaApi}>
                      Test
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Test Ollama API connection</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 dark:bg-slate-900/20 flex justify-between items-center border-t p-4">
        <div className="flex items-center gap-2">
          <Badge variant={
            apiStatus.grok === 'success' && 
            apiStatus.qdrant === 'success' && 
            apiStatus.ollama === 'success' ? 'default' : 'outline'
          }>
            {
              apiStatus.grok === 'success' && 
              apiStatus.qdrant === 'success' && 
              apiStatus.ollama === 'success' ? 'All Systems Operational' : 'System Issues Detected'
            }
          </Badge>
        </div>
        <Button onClick={testAllConnections}>
          Check All Connections
        </Button>
      </CardFooter>
    </Card>
  );
}
