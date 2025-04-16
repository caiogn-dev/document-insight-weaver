
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

interface ProcessingVisualizerProps {
  currentFile?: {
    name: string;
    size: number;
    type: string;
  };
  processingStage?: "uploading" | "extracting" | "embedding" | "storing" | "complete";
  progress?: number;
  stats?: {
    totalChunks?: number;
    processedChunks?: number;
    vectorsGenerated?: number;
  };
}

export function ProcessingVisualizer({
  currentFile,
  processingStage,
  progress = 0,
  stats,
}: ProcessingVisualizerProps) {
  const stages = ["uploading", "extracting", "embedding", "storing", "complete"];
  const currentStageIndex = stages.indexOf(processingStage || "");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Document Processing</CardTitle>
        <CardDescription>
          {currentFile
            ? `Processing ${currentFile.name}`
            : "No file being processed"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div>Stage: {processingStage || "Not started"}</div>
            {currentFile && (
              <>
                <div>Size: {(currentFile.size / 1024).toFixed(2)} KB</div>
                <div>Type: {currentFile.type}</div>
              </>
            )}
          </div>
          
          {stats && (
            <div className="space-y-2">
              <div>Total Chunks: {stats.totalChunks || 0}</div>
              <div>Processed: {stats.processedChunks || 0}</div>
              <div>Vectors: {stats.vectorsGenerated || 0}</div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {stages.map((stage, index) => (
            <div
              key={stage}
              className={`flex-1 h-2 rounded ${
                index <= currentStageIndex
                  ? "bg-primary"
                  : "bg-secondary"
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
