
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
import { HelpCircle, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
        <SelectTrigger className={cn("h-9 transition-all", className, {
          "border-green-500 shadow-sm shadow-green-100": selectedModelData?.status === 'available',
          "border-yellow-500 shadow-sm shadow-yellow-100": selectedModelData?.status === 'limited',
          "border-red-500 shadow-sm shadow-red-100": selectedModelData?.status === 'unavailable'
        })}>
          <SelectValue placeholder={`Select ${type} model`}>
            {selectedModelData && (
              <div className="flex items-center justify-between w-full">
                <span>{selectedModelData.name}</span>
                {selectedModelData.status && (
                  <Badge variant={
                    selectedModelData.status === 'available' ? 'success' : 
                    selectedModelData.status === 'limited' ? 'warning' : 'destructive'
                  } className="ml-2 text-[10px] py-0 h-5">
                    {selectedModelData.status === 'available' ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : null}
                    {selectedModelData.status === 'available' ? 'Active' : 
                      selectedModelData.status === 'limited' ? 'Limited' : 'Offline'}
                  </Badge>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          {models.length === 0 ? (
            <div className="py-2 px-2 text-sm text-muted-foreground italic">
              No models available
            </div>
          ) : (
            models.map((model) => (
              <SelectItem key={model.id} value={model.id} className="py-2">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{model.name}</span>
                    {model.status && (
                      <Badge variant={
                        model.status === 'available' ? 'success' : 
                        model.status === 'limited' ? 'warning' : 'destructive'
                      } className="ml-2 text-[10px] py-0 h-5">
                        {model.status === 'available' ? 'Active' : 
                          model.status === 'limited' ? 'Limited' : 'Offline'}
                      </Badge>
                    )}
                  </div>
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
