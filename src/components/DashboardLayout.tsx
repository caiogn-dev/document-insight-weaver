
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProcessingVisualizer } from "@/components/ProcessingVisualizer";
import { ApiManagement } from "@/components/ApiManagement";
import { ChatInterface } from "@/components/ChatInterface";
import { FileUpload } from "@/components/FileUpload";
import { ASSISTANT_ROLES } from "@/config/config";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Upload, 
  Settings, 
  Activity,
  FileText,
  Github
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssistantRole } from "@/config/config";

interface ProcessingInfo {
  currentFile?: {
    name: string;
    size: number;
    type: string;
  };
  processingStage?: "uploading" | "extracting" | "embedding" | "storing" | "complete" | "error" | "paused";
  progress: number;
  stats: {
    totalChunks: number;
    processedChunks: number;
    vectorsGenerated: number;
    timeElapsed?: number;
    estimatedTimeRemaining?: number;
  };
}

export function DashboardLayout() {
  const [processingInfo, setProcessingInfo] = useState<ProcessingInfo>({
    currentFile: undefined,
    processingStage: undefined,
    progress: 0,
    stats: {
      totalChunks: 0,
      processedChunks: 0,
      vectorsGenerated: 0,
    },
  });

  const [selectedRole, setSelectedRole] = useState<AssistantRole>("RESEARCHER");
  
  const handlePauseProcessing = () => {
    setProcessingInfo(prev => ({
      ...prev,
      processingStage: "paused"
    }));
  };
  
  const handleResumeProcessing = () => {
    setProcessingInfo(prev => ({
      ...prev,
      processingStage: prev.processingStage === "paused" ? "embedding" : prev.processingStage
    }));
  };
  
  const handleCancelProcessing = () => {
    setProcessingInfo({
      currentFile: undefined,
      processingStage: undefined,
      progress: 0,
      stats: {
        totalChunks: 0,
        processedChunks: 0,
        vectorsGenerated: 0,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">RAG Assistant</h1>
            <Badge variant="outline" className="ml-2">v1.0</Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as AssistantRole)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ASSISTANT_ROLES).map(([key, role]) => (
                  <SelectItem key={key} value={key}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Settings</SheetTitle>
                  <SheetDescription>
                    Configure application settings and API connections.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  <ApiManagement />
                </div>
              </SheetContent>
            </Sheet>
            
            <a href="https://github.com/yourusername/rag-assistant" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon">
                <Github className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto py-6 px-4">
        <div className="grid gap-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProcessingVisualizer 
              currentFile={processingInfo.currentFile}
              processingStage={processingInfo.processingStage}
              progress={processingInfo.progress}
              stats={processingInfo.stats}
              onPause={handlePauseProcessing}
              onResume={handleResumeProcessing}
              onCancel={handleCancelProcessing}
            />
            <ApiManagement />
          </div>
        </div>
        
        <Tabs defaultValue="chat" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid grid-cols-3 w-[400px]">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Activity className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
          </div>
          
          <TabsContent value="chat" className="bg-white dark:bg-slate-800 p-6 rounded-lg border shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">Chat with Assistant</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Ask questions about your uploaded documents.
              </p>
            </div>
            <ChatInterface />
          </TabsContent>
          
          <TabsContent value="upload" className="bg-white dark:bg-slate-800 p-6 rounded-lg border shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">Upload Documents</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Upload documents to be processed and analyzed.
              </p>
            </div>
            <FileUpload onProcessingUpdate={setProcessingInfo} />
          </TabsContent>
          
          <TabsContent value="dashboard" className="bg-white dark:bg-slate-800 p-6 rounded-lg border shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">Dashboard</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                View system performance and document statistics.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Documents</h3>
                <p className="text-2xl font-bold">{processingInfo.stats.totalChunks > 0 ? 1 : 0}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Total processed documents</p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">Chunks</h3>
                <p className="text-2xl font-bold">{processingInfo.stats.totalChunks}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Total text chunks</p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">Vectors</h3>
                <p className="text-2xl font-bold">{processingInfo.stats.vectorsGenerated}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Total embeddings generated</p>
              </div>
            </div>
            
            {/* Add more dashboard components here if needed */}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t mt-8 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            RAG Assistant © {new Date().getFullYear()} | All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
