
import { useEffect, useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { FileUpload } from "@/components/FileUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initializeVectorStore } from "@/services/setupService";
import { useToast } from "@/components/ui/use-toast";
import { ASSISTANT_ROLES } from "@/config/config";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ProcessingVisualizer } from "@/components/ProcessingVisualizer";

const Index = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();
  const [processingInfo, setProcessingInfo] = useState({
    currentFile: undefined,
    processingStage: undefined,
    progress: 0,
    stats: {
      totalChunks: 0,
      processedChunks: 0,
      vectorsGenerated: 0,
    },
  });

  // Initialize the vector database on component mount
  useEffect(() => {
    const setupVectorStore = async () => {
      try {
        await initializeVectorStore();
      } catch (error) {
        console.error('Failed to initialize vector store:', error);
        toast({
          variant: "destructive",
          title: "Initialization failed",
          description: "Failed to connect to the vector database. Some features may not work correctly.",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    setupVectorStore();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold text-gray-900">RAG Assistant</h1>
          <SettingsDialog />
        </div>
        <p className="text-gray-600 mb-4">Upload documents and start chatting!</p>
        
        <div className="flex justify-center gap-4 mb-6">
          {Object.entries(ASSISTANT_ROLES).map(([key, role]) => (
            <div key={key} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 max-w-xs">
              <h3 className="font-semibold text-lg mb-1">{role.name}</h3>
              <p className="text-sm text-gray-600">{role.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <ProcessingVisualizer {...processingInfo} />
      </div>

      <Tabs defaultValue="chat" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="chat">
          <ChatInterface />
        </TabsContent>
        <TabsContent value="upload">
          <FileUpload onProcessingUpdate={setProcessingInfo} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
