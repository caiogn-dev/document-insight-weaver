
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Model } from '@/services/modelService';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  type: 'chat' | 'embeddings';
  className?: string;
}

export function ModelSelector({
  models,
  selectedModel,
  onModelSelect,
  type,
  className
}: ModelSelectorProps) {
  return (
    <Select value={selectedModel} onValueChange={onModelSelect}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={`Select ${type} model`} />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
