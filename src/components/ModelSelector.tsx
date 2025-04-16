
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Model } from '@/services/modelService';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  type: 'chat' | 'embeddings';
  className?: string;
  disabled?: boolean;
}

export function ModelSelector({
  models,
  selectedModel,
  onModelSelect,
  type,
  className,
  disabled = false
}: ModelSelectorProps) {
  const isMobile = useIsMobile();
  const selectedModelData = models.find(model => model.id === selectedModel);
  
  return (
    <div className="flex flex-col space-y-1 w-full">
      <div className="flex items-center gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          {type === 'chat' ? 'Chat Model' : 'Embeddings Model'}
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side={isMobile ? "bottom" : "right"} className="max-w-[250px] text-xs">
              {type === 'chat' 
                ? 'Chat models generate responses to your queries'
                : 'Embedding models generate vector representations for document search'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Select 
        value={selectedModel} 
        onValueChange={onModelSelect}
        disabled={disabled || models.length === 0}
      >
        <SelectTrigger className={`h-9 ${className}`}>
          <SelectValue placeholder={`Select ${type} model`} />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {models.length === 0 ? (
            <div className="py-2 px-2 text-sm text-muted-foreground italic">
              No models available
            </div>
          ) : (
            models.map((model) => (
              <SelectItem key={model.id} value={model.id} className="py-2">
                <div className="flex flex-col">
                  <span className="font-medium">{model.name}</span>
                  {model.description && (
                    <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                      {model.description}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      {selectedModelData?.description && !isMobile && (
        <p className="text-xs text-muted-foreground truncate max-w-full">
          {selectedModelData.description}
        </p>
      )}
    </div>
  );
}
