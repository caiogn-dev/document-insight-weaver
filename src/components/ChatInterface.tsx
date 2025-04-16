
import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, FileText, Info, MessageSquare, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message, queryGrokAPI, extractCitations } from "@/services/chatService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssistantRole, ASSISTANT_ROLES, DEFAULT_MODELS } from '@/config/config';
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Model } from '@/services/modelService';
import { ModelSelector } from './ModelSelector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ChatInterfaceProps {
  models?: Model[];
  selectedModel?: string;
  onModelSelect?: (modelId: string) => void;
}

export function ChatInterface({ 
  models = [], 
  selectedModel = DEFAULT_MODELS.grok,
  onModelSelect
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [assistantRole, setAssistantRole] = useState<AssistantRole>("RESEARCHER");
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input field when the component loads
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Get messages for context (last 10 messages)
      const recentMessages = [...messages.slice(-9), userMessage];
      
      // Query Grok API
      const response = await queryGrokAPI(recentMessages, assistantRole, selectedModel);
      
      // Extract citations if any
      const citations = extractCitations(response);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
        citations: citations.length > 0 ? citations : undefined
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: error instanceof Error ? error.message : "Failed to get a response",
      });
    } finally {
      setIsLoading(false);
      // Refocus the input field after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  
  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-14rem)] md:h-[600px] w-full max-w-4xl mx-auto">
      <div className="p-3 md:p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
        <h3 className="font-medium flex items-center">
          <MessageSquare className="h-4 w-4 mr-2" />
          Chat with your documents
        </h3>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-sm text-gray-500 whitespace-nowrap">Assistant:</span>
            <Select
              value={assistantRole}
              onValueChange={(value: AssistantRole) => setAssistantRole(value)}
            >
              <SelectTrigger className="w-full md:w-[180px] h-8">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ASSISTANT_ROLES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex flex-col">
                      <span>{value.name}</span>
                      <span className="text-xs text-muted-foreground">{value.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {onModelSelect && models.length > 0 && (
            <div className="w-full md:w-auto">
              <ModelSelector
                models={models.filter(m => m.type === 'chat')}
                selectedModel={selectedModel}
                onModelSelect={onModelSelect}
                type="chat"
                className="h-8 w-full md:w-[180px]"
              />
            </div>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-3 md:p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto h-12 w-12 opacity-50 mb-2" />
              <p>Upload and process documents, then start chatting!</p>
              <p className="text-sm mt-1">The assistant will use your documents to provide informed responses.</p>
              <div className="mt-4 grid gap-2 mx-auto max-w-md">
                {Object.entries(ASSISTANT_ROLES).map(([key, role]) => (
                  <Button 
                    key={key} 
                    variant="outline" 
                    className="flex justify-start gap-2" 
                    onClick={() => {
                      setAssistantRole(key as AssistantRole);
                      setInput(`Tell me about ${key === 'RESEARCHER' ? 'research in my documents' : key === 'WRITER' ? 'writing summaries' : 'analyzing data patterns'}`);
                      if (inputRef.current) {
                        inputRef.current.focus();
                      }
                    }}
                  >
                    <span className="text-primary">
                      {key === 'RESEARCHER' ? (
                        <FileText className="h-4 w-4" />
                      ) : key === 'WRITER' ? (
                        <MessageSquare className="h-4 w-4" />
                      ) : (
                        <Info className="h-4 w-4" />
                      )}
                    </span>
                    <span className="text-sm font-medium">{role.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-full gap-3",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[85%] md:max-w-[80%] relative group",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="whitespace-pre-wrap text-sm md:text-base">{message.content}</div>
                  
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                      <p className="font-medium">Sources:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        {message.citations.map((citation, index) => (
                          <li key={index}>
                            <span className="font-medium">{citation.source}</span>: {citation.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "absolute -top-2 -right-2 text-[10px] py-0 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity",
                      message.role === 'user' ? "bg-primary/10" : "bg-background"
                    )}
                  >
                    {formatTimestamp(message.timestamp)}
                  </Badge>
                </div>
                
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      
      <div className="p-3 md:p-4 border-t">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (!isLoading && input.trim()) handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size={isMobile ? "icon" : "default"}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {!isMobile && <span>Send</span>}
                      <Send className="h-4 w-4 ml-0 md:ml-2" />
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Send message (or press Enter)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </form>
      </div>
    </Card>
  );
}
