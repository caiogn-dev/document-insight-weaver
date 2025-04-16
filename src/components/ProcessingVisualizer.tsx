
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, FileText, PauseCircle, RefreshCw } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface ProcessingVisualizerProps {
  currentFile?: {
    name: string;
    size: number;
    type: string;
  };
  processingStage?: "uploading" | "extracting" | "embedding" | "storing" | "complete" | "error" | "paused";
  progress?: number;
  stats?: {
    totalChunks?: number;
    processedChunks?: number;
    vectorsGenerated?: number;
    timeElapsed?: number;
    estimatedTimeRemaining?: number;
  };
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
}

const stageIconVariants = cva("mr-2 h-5 w-5", {
  variants: {
    stage: {
      uploading: "text-blue-500 animate-spin",
      extracting: "text-amber-500 animate-pulse",
      embedding: "text-purple-500 animate-pulse",
      storing: "text-green-500 animate-pulse",
      complete: "text-green-500",
      error: "text-red-500",
      paused: "text-yellow-500",
    },
  },
  defaultVariants: {
    stage: "uploading",
  },
});

const stageNames = {
  uploading: "Uploading File",
  extracting: "Extracting Text",
  embedding: "Generating Embeddings",
  storing: "Storing Vectors",
  complete: "Processing Complete",
  error: "Processing Error",
  paused: "Processing Paused",
};

export function ProcessingVisualizer({
  currentFile,
  processingStage,
  progress = 0,
  stats,
  onPause,
  onResume,
  onCancel,
}: ProcessingVisualizerProps) {
  const stages = ["uploading", "extracting", "embedding", "storing", "complete"];
  const currentStageIndex = stages.indexOf(processingStage || "");
  
  const formatTime = (seconds?: number) => {
    if (!seconds) return "N/A";
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const getStageIcon = (stage?: string) => {
    switch (stage) {
      case "uploading":
      case "extracting":
      case "embedding": 
      case "storing":
        return <RefreshCw className={stageIconVariants({ stage: stage as any })} />;
      case "complete":
        return <CheckCircle className={stageIconVariants({ stage: "complete" })} />;
      case "error":
        return <AlertCircle className={stageIconVariants({ stage: "error" })} />;
      case "paused":
        return <PauseCircle className={stageIconVariants({ stage: "paused" })} />;
      default:
        return <FileText className={stageIconVariants({ stage: "uploading" })} />;
    }
  };

  return (
    <Card className="w-full overflow-hidden border-2 transition-all duration-300 hover:shadow-md">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Document Processing</CardTitle>
            <CardDescription className="mt-1">
              {currentFile
                ? `Processing ${currentFile.name}`
                : "No file being processed"}
            </CardDescription>
          </div>
          
          {processingStage && processingStage !== "complete" && processingStage !== "error" && (
            <div className="flex space-x-2">
              {processingStage !== "paused" ? (
                <Button variant="outline" size="sm" onClick={onPause}>
                  <PauseCircle className="mr-1 h-4 w-4" />
                  Pause
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={onResume}>
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Resume
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center mb-2">
          {getStageIcon(processingStage)}
          <span className="font-medium">{processingStage ? stageNames[processingStage] : "Not Started"}</span>
          
          {progress > 0 && (
            <Badge className="ml-auto" variant={processingStage === "complete" ? "default" : "outline"}>
              {progress.toFixed(0)}%
            </Badge>
          )}
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {currentFile && (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-slate-500 dark:text-slate-400">File Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-500 dark:text-slate-400">Name:</div>
                <div className="font-medium truncate" title={currentFile.name}>{currentFile.name}</div>
                
                <div className="text-slate-500 dark:text-slate-400">Size:</div>
                <div className="font-medium">{(currentFile.size / 1024).toFixed(2)} KB</div>
                
                <div className="text-slate-500 dark:text-slate-400">Type:</div>
                <div className="font-medium">{currentFile.type || "Unknown"}</div>
              </div>
            </div>
          )}
          
          {stats && (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-slate-500 dark:text-slate-400">Processing Stats</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-500 dark:text-slate-400">Total Chunks:</div>
                <div className="font-medium">{stats.totalChunks || 0}</div>
                
                <div className="text-slate-500 dark:text-slate-400">Processed:</div>
                <div className="font-medium">{stats.processedChunks || 0}</div>
                
                <div className="text-slate-500 dark:text-slate-400">Vectors:</div>
                <div className="font-medium">{stats.vectorsGenerated || 0}</div>
                
                {stats.timeElapsed !== undefined && (
                  <>
                    <div className="text-slate-500 dark:text-slate-400">Time Elapsed:</div>
                    <div className="font-medium">{formatTime(stats.timeElapsed)}</div>
                  </>
                )}
                
                {stats.estimatedTimeRemaining !== undefined && processingStage !== "complete" && (
                  <>
                    <div className="text-slate-500 dark:text-slate-400">Est. Remaining:</div>
                    <div className="font-medium">{formatTime(stats.estimatedTimeRemaining)}</div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          {stages.map((stage, index) => (
            <HoverCard key={stage}>
              <HoverCardTrigger>
                <div
                  className={cn(
                    "flex-1 h-2 rounded cursor-pointer transition-all duration-300",
                    index <= currentStageIndex
                      ? "bg-primary"
                      : "bg-secondary",
                    index === currentStageIndex && processingStage !== "complete" && "animate-pulse"
                  )}
                />
              </HoverCardTrigger>
              <HoverCardContent className="w-auto">
                <div className="text-sm font-medium">{stageNames[stage as keyof typeof stageNames]}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {index < currentStageIndex ? "Completed" : 
                   index === currentStageIndex ? "In Progress" : "Pending"}
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
