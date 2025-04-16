
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Save, Check, X, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { API_CONFIG } from "@/config/config";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { QdrantClient } from "@qdrant/js-client-rest";

interface EndpointStatus {
  grok: boolean;
  qdrant: boolean;
  ollama: boolean;
}

export function SettingsDialog() {
  const { toast: uiToast } = useToast();
  const [config, setConfig] = useState(API_CONFIG);
  const [status, setStatus] = useState<EndpointStatus>({
    grok: false,
    qdrant: false,
    ollama: false,
  });
  const [isChecking, setIsChecking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkEndpoints();
    }
  }, [isOpen]);

  const checkEndpoints = async () => {
    setIsChecking(true);
    try {
      // Check Grok API
      try {
        const grokResponse = await fetch(config.GROK.BASE_URL + '/models', {
          headers: { 
            Authorization: `Bearer ${config.GROK.API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        setStatus(prev => ({ ...prev, grok: grokResponse.ok }));
      } catch (e) {
        console.error('Error checking Grok:', e);
        setStatus(prev => ({ ...prev, grok: false }));
      }

      // Check Qdrant
      try {
        const qdrantClient = new QdrantClient({
          url: config.QDRANT.BASE_URL,
          apiKey: config.QDRANT.API_KEY,
        });
        
        const qdrantResponse = await qdrantClient.getCollections();
        setStatus(prev => ({ ...prev, qdrant: !!qdrantResponse.collections }));
      } catch (e) {
        console.error('Error checking Qdrant:', e);
        setStatus(prev => ({ ...prev, qdrant: false }));
      }

      // Check Ollama
      try {
        const ollamaResponse = await fetch(`${config.OLLAMA.BASE_URL}/api/embeddings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: "all-minilm", prompt: "test" })
        });
        setStatus(prev => ({ ...prev, ollama: ollamaResponse.ok }));
      } catch (e) {
        console.error('Error checking Ollama:', e);
        setStatus(prev => ({ ...prev, ollama: false }));
      }

      uiToast({
        title: "Status Check Complete",
        description: "API endpoints have been verified.",
      });
    } catch (error) {
      uiToast({
        variant: "destructive",
        title: "Error Checking Status",
        description: "Failed to verify one or more endpoints."
      });
    } finally {
      setIsChecking(false);
    }
  };

  const saveChanges = () => {
    // In a real application, you'd save these to a real configuration store
    // For this demo, we'll show a toast but won't actually modify the config
    localStorage.setItem('api_config', JSON.stringify(config));
    
    toast.success('Settings saved', {
      description: 'API configuration has been updated.',
      action: {
        label: 'Reload',
        onClick: () => window.location.reload(),
      },
    });
    
    uiToast({
      title: "Settings Updated",
      description: "Please reload the page for changes to take effect.",
    });
    
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">API Settings</DialogTitle>
          <DialogDescription>
            Configure your API connections. Changes require a page reload to take effect.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-5 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Grok API</Label>
              <Badge variant={status.grok ? "success" : "destructive"}>
                {status.grok ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                {status.grok ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grok-url">Base URL</Label>
              <Input
                id="grok-url"
                value={config.GROK.BASE_URL}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    GROK: { ...config.GROK, BASE_URL: e.target.value },
                  })
                }
                placeholder="e.g., https://api.x.ai/v1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grok-key">API Key</Label>
              <Input
                id="grok-key"
                value={config.GROK.API_KEY}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    GROK: { ...config.GROK, API_KEY: e.target.value },
                  })
                }
                type="password"
                placeholder="Your Grok API key"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Qdrant Vector Database</Label>
              <Badge variant={status.qdrant ? "success" : "destructive"}>
                {status.qdrant ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                {status.qdrant ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="qdrant-url">Base URL</Label>
              <Input
                id="qdrant-url"
                value={config.QDRANT.BASE_URL}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    QDRANT: { ...config.QDRANT, BASE_URL: e.target.value },
                  })
                }
                placeholder="e.g., https://your-instance.qdrant.io:6333"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="qdrant-key">API Key</Label>
              <Input
                id="qdrant-key"
                value={config.QDRANT.API_KEY}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    QDRANT: { ...config.QDRANT, API_KEY: e.target.value },
                  })
                }
                type="password"
                placeholder="Your Qdrant API key"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Ollama Embeddings</Label>
              <Badge variant={status.ollama ? "success" : "destructive"}>
                {status.ollama ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                {status.ollama ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ollama-url">Base URL</Label>
              <Input
                id="ollama-url"
                value={config.OLLAMA.BASE_URL}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    OLLAMA: { ...config.OLLAMA, BASE_URL: e.target.value },
                  })
                }
                placeholder="e.g., http://localhost:11434"
              />
              <p className="text-xs text-muted-foreground">
                For local Ollama installation, use http://localhost:11434
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 justify-between sm:justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={checkEndpoints}
            disabled={isChecking}
          >
            {isChecking ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
            {isChecking ? "Checking..." : "Test Connections"}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveChanges}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
