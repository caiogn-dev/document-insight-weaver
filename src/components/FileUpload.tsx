
import { useState, useCallback, useEffect, Dispatch, SetStateAction } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { processDocument, extractTextFromFile, chunkText, createEmbedding, storeVectors } from '@/services/documentService';
import { API_CONFIG } from '@/config/config';

interface FileWithPreview extends File {
  preview?: string;
}

interface ProcessingInfo {
  currentFile?: {
    name: string;
    size: number;
    type: string;
  };
  processingStage?: "uploading" | "extracting" | "embedding" | "storing" | "complete";
  progress: number;
  stats: {
    totalChunks: number;
    processedChunks: number;
    vectorsGenerated: number;
  };
}

interface FileUploadProps {
  onProcessingUpdate?: Dispatch<SetStateAction<ProcessingInfo>>;
}

export function FileUpload({ onProcessingUpdate }: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<string[]>([]);
  const { toast } = useToast();

  const updateProcessingInfo = (info: Partial<ProcessingInfo>) => {
    if (onProcessingUpdate) {
      onProcessingUpdate(prev => ({ ...prev, ...info }));
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [
      ...prev,
      ...acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }))
    ]);
  }, []);

  const removeFile = (name: string) => {
    setFiles(files => {
      const newFiles = files.filter(file => file.name !== name);
      return newFiles;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    onDrop(droppedFiles);
  };

  const processDocumentWithUpdates = async (file: File) => {
    try {
      // Update current file info
      updateProcessingInfo({
        currentFile: {
          name: file.name,
          size: file.size,
          type: file.type
        },
        processingStage: "uploading",
        progress: 5
      });

      // Extract text
      updateProcessingInfo({ processingStage: "extracting", progress: 20 });
      const text = await extractTextFromFile(file);
      
      // Chunk text
      updateProcessingInfo({ 
        processingStage: "extracting", 
        progress: 40
      });
      const chunks = chunkText(text);
      updateProcessingInfo({ 
        stats: { 
          totalChunks: chunks.length,
          processedChunks: 0,
          vectorsGenerated: 0
        }
      });
      
      // Create embeddings
      updateProcessingInfo({ processingStage: "embedding", progress: 60 });
      const embeddings: number[][] = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const embedding = await createEmbedding(chunks[i]);
        embeddings.push(embedding);
        
        // Update progress for each chunk processed
        updateProcessingInfo({ 
          progress: 60 + Math.floor((i / chunks.length) * 20),
          stats: { 
            totalChunks: chunks.length,
            processedChunks: i + 1,
            vectorsGenerated: embeddings.length
          }
        });
      }
      
      // Store vectors
      updateProcessingInfo({ processingStage: "storing", progress: 80 });
      const metadata = chunks.map(() => ({
        filename: file.name,
        fileType: file.type,
        timestamp: new Date().toISOString(),
      }));
      
      await storeVectors(chunks, embeddings, metadata);
      
      // Complete
      updateProcessingInfo({ processingStage: "complete", progress: 100 });
      
      return true;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  };

  const handleProcessFiles = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    const processed: string[] = [];
    
    try {
      for (const file of files) {
        if (processedFiles.includes(file.name)) continue;
        
        await processDocumentWithUpdates(file);
        processed.push(file.name);
        
        toast({
          title: "Document processed",
          description: `Successfully processed ${file.name}`,
        });
      }
      
      setProcessedFiles(prev => [...prev, ...processed]);
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: `An error occurred while processing documents: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      updateProcessingInfo({ processingStage: undefined, progress: 0 });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-4 w-full max-w-4xl mx-auto">
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-testid="file-upload"
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Drag and drop your files here, or
          </p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) onDrop(Array.from(files));
              };
              input.click();
            }}
          >
            Browse files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <>
          <div className="mt-4 space-y-2">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  {processedFiles.includes(file.name) && (
                    <span className="text-xs text-green-600 font-medium">Processed</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.name)}
                  disabled={isProcessing && !processedFiles.includes(file.name)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleProcessFiles}
              disabled={isProcessing || files.every(file => processedFiles.includes(file.name))}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process Documents'
              )}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
