
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { API_CONFIG } from "@/config/config";

interface EndpointStatus {
  grok: boolean;
  qdrant: boolean;
  ollama: boolean;
}

export function SettingsDialog() {
  const { toast } = useToast();
  const [config, setConfig] = useState(API_CONFIG);
  const [status, setStatus] = useState<EndpointStatus>({
    grok: false,
    qdrant: false,
    ollama: false,
  });

  const checkEndpoints = async () => {
    try {
      // Check Grok API
      const grokStatus = await fetch(config.GROK.BASE_URL + '/models', {
        headers: { Authorization: `Bearer ${config.GROK.API_KEY}` }
      }).then(r => r.ok);

      // Check Qdrant
      const qdrantStatus = await fetch(config.QDRANT.BASE_URL + '/collections', {
        headers: { 
          'api-key': config.QDRANT.API_KEY,
          'Content-Type': 'application/json'
        }
      }).then(r => r.ok);

      // Check Ollama
      const ollamaStatus = await fetch(config.OLLAMA.BASE_URL + '/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: "all-minilm", prompt: "test" })
      }).then(r => r.ok);

      setStatus({
        grok: grokStatus,
        qdrant: qdrantStatus,
        ollama: ollamaStatus
      });

      toast({
        title: "Status Check Complete",
        description: "API endpoints have been verified.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Checking Status",
        description: "Failed to verify one or more endpoints."
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>API Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">Grok API</h3>
            <div className="grid grid-cols-[1fr,auto] items-center gap-2">
              <Input
                value={config.GROK.BASE_URL}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    GROK: { ...config.GROK, BASE_URL: e.target.value },
                  })
                }
                placeholder="Base URL"
              />
              <div className={`w-3 h-3 rounded-full ${status.grok ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <Input
              value={config.GROK.API_KEY}
              onChange={(e) =>
                setConfig({
                  ...config,
                  GROK: { ...config.GROK, API_KEY: e.target.value },
                })
              }
              type="password"
              placeholder="API Key"
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Qdrant</h3>
            <div className="grid grid-cols-[1fr,auto] items-center gap-2">
              <Input
                value={config.QDRANT.BASE_URL}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    QDRANT: { ...config.QDRANT, BASE_URL: e.target.value },
                  })
                }
                placeholder="Base URL"
              />
              <div className={`w-3 h-3 rounded-full ${status.qdrant ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <Input
              value={config.QDRANT.API_KEY}
              onChange={(e) =>
                setConfig({
                  ...config,
                  QDRANT: { ...config.QDRANT, API_KEY: e.target.value },
                })
              }
              type="password"
              placeholder="API Key"
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Ollama</h3>
            <div className="grid grid-cols-[1fr,auto] items-center gap-2">
              <Input
                value={config.OLLAMA.BASE_URL}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    OLLAMA: { ...config.OLLAMA, BASE_URL: e.target.value },
                  })
                }
                placeholder="Base URL"
              />
              <div className={`w-3 h-3 rounded-full ${status.ollama ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </div>

          <Button onClick={checkEndpoints}>Check Connection Status</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
