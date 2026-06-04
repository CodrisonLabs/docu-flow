"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  Conversation, 
  ConversationContent, 
  ConversationScrollButton 
} from "@/components/ai-elements/conversation";
import { 
  Message, 
  MessageContent, 
  MessageResponse 
} from "@/components/ai-elements/message";
import { 
  PromptInput, 
  PromptInputBody, 
  PromptInputTextarea, 
  PromptInputFooter, 
  PromptInputSubmit,
  PromptInputHeader,
  PromptInputTools,
  PromptInputSelect,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputButton,
  usePromptInputAttachments
} from "@/components/ai-elements/prompt-input";
import { 
  ModelSelector, 
  ModelSelectorTrigger, 
  ModelSelectorContent, 
  ModelSelectorInput, 
  ModelSelectorList, 
  ModelSelectorEmpty, 
  ModelSelectorGroup, 
  ModelSelectorItem,
  ModelSelectorLogo
} from "@/components/ai-elements/model-selector";
import { 
  Attachments, 
  Attachment, 
  AttachmentPreview, 
  AttachmentInfo, 
  AttachmentRemove 
} from "@/components/ai-elements/attachments";
import { Message as MessageType } from "@/lib/types";
import { Database, Plus, Cpu } from "lucide-react";

export default function ChatPage() {
  const { id } = useParams();
  const convId = parseInt(id as string);
  const queryClient = useQueryClient();

  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedNamespace, setSelectedNamespace] = useState<number | undefined>(undefined);

  // Queries
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", convId],
    queryFn: () => api.conversations.getMessages(convId),
    enabled: !!convId,
  });

  const { data: apiKeys = [] } = useQuery({
    queryKey: ["apiKeys"],
    queryFn: api.apiKeys.list,
  });

  const { data: namespaces = [] } = useQuery({
    queryKey: ["namespaces"],
    queryFn: api.kb.listNamespaces,
  });

  // Fetch models for the first available key if none selected
  const firstKey = apiKeys[0];
  const { data: models = [] } = useQuery({
    queryKey: ["models", firstKey?.id],
    queryFn: () => api.apiKeys.getModels(firstKey.id),
    enabled: !!firstKey && !selectedModel,
  });

  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0].id);
      setSelectedProvider(firstKey.provider);
    }
  }, [models, selectedModel, firstKey]);

  // Mutation
  const chatMutation = useMutation({
    mutationFn: (data: { message: string, file_base64?: string, file_mime_type?: string }) => 
      api.conversations.chat(convId, {
        message: data.message,
        model: selectedModel,
        provider: selectedProvider,
        namespace_id: selectedNamespace,
        file_base64: data.file_base64,
        file_mime_type: data.file_mime_type
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", convId] });
    },
  });

  const handleSubmit = async (msg: { text: string; files: any[] }) => {
    if (!msg.text && msg.files.length === 0) return;

    let file_base64: string | undefined;
    let file_mime_type: string | undefined;

    if (msg.files.length > 0) {
      const file = msg.files[0];
      file_base64 = file.url.split(",")[1];
      file_mime_type = file.mediaType;
    }

    const tempId = Date.now();
    queryClient.setQueryData(["messages", convId], (old: MessageType[] = []) => [
      ...old,
      { id: tempId, role: "user", content: msg.text, created_at: new Date().toISOString() }
    ]);

    try {
      await chatMutation.mutateAsync({ 
        message: msg.text, 
        file_base64, 
        file_mime_type 
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleModelSelect = (modelId: string, provider: string) => {
    setSelectedModel(modelId);
    setSelectedProvider(provider);
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background">
      {/* Messages */}
      <Conversation className="flex-1 min-h-0">
        <ConversationContent className="max-w-3xl mx-auto w-full py-8">
          {messages.map((msg) => (
            <Message key={msg.id} from={msg.role as any}>
              <MessageContent>
                <MessageResponse>{msg.content}</MessageResponse>
                {msg.role === 'assistant' && msg.model && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground opacity-60">
                    <Cpu className="size-3" />
                    {msg.model}
                  </div>
                )}
              </MessageContent>
            </Message>
          ))}
          {chatMutation.isPending && (
            <Message from="assistant">
              <MessageContent>
                <div className="flex gap-1 items-center py-2">
                  <div className="size-1.5 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="size-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="size-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                {selectedModel && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground opacity-60">
                    <Cpu className="size-3" />
                    {selectedModel}
                  </div>
                )}
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input */}
      <div className="bg-background p-4 pb-6">
        <div className="max-w-3xl mx-auto w-full">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputHeader>
              <ChatPromptAttachments />
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea 
                className="bg-transparent border-none shadow-none focus-visible:ring-0 min-h-[44px] py-3"
                placeholder="Ask anything..." 
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger asChild>
                    <PromptInputButton tooltip="Add content">
                      <Plus className="size-4" />
                    </PromptInputButton>
                  </PromptInputActionMenuTrigger>
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments label="Upload files" />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>

                <div className="h-4 w-[1px] bg-border mx-1" />

                <ModelSelector>
                  <ModelSelectorTrigger asChild>
                    <PromptInputButton tooltip="Select model" className="gap-2 px-2 w-auto">
                      <Cpu className="size-4 text-muted-foreground" />
                      <span className="text-xs font-medium max-w-[100px] truncate">{selectedModel || "Model"}</span>
                    </PromptInputButton>
                  </ModelSelectorTrigger>
                  <ModelSelectorContent className="w-80">
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                      {apiKeys.map((key) => (
                        <ModelGroup key={key.id} apiKeyId={key.id} provider={key.provider} onSelect={handleModelSelect} selectedModel={selectedModel} />
                      ))}
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>

                <div className="h-4 w-[1px] bg-border mx-1" />

                <PromptInputSelect value={selectedNamespace?.toString()} onValueChange={(v) => setSelectedNamespace(v ? parseInt(v) : undefined)}>
                  <PromptInputSelectTrigger className="h-8 gap-2 text-xs border-none shadow-none focus:ring-0 hover:bg-accent px-2">
                    <Database className="size-4 text-muted-foreground" />
                    <PromptInputSelectValue placeholder="Knowledge Base" />
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent>
                    {namespaces.map((ns) => (
                      <PromptInputSelectItem key={ns.id} value={ns.id.toString()}>
                        {ns.name}
                      </PromptInputSelectItem>
                    ))}
                  </PromptInputSelectContent>
                </PromptInputSelect>
              </PromptInputTools>
              <PromptInputSubmit status={chatMutation.isPending ? "submitted" : undefined} className="bg-primary text-primary-foreground rounded-md shadow-none" />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

function ModelGroup({ apiKeyId, provider, onSelect, selectedModel }: { 
  apiKeyId: number, 
  provider: string, 
  onSelect: (id: string, provider: string) => void,
  selectedModel: string
}) {
  const { data: models = [] } = useQuery({
    queryKey: ["models", apiKeyId],
    queryFn: () => api.apiKeys.getModels(apiKeyId),
  });

  return (
    <ModelSelectorGroup heading={provider.toUpperCase()}>
      {models.map((m) => (
        <ModelSelectorItem 
          key={m.id} 
          value={m.id} 
          onSelect={() => onSelect(m.id, provider)}
          className={selectedModel === m.id ? "bg-accent" : ""}
        >
          <ModelSelectorLogo provider={provider} className="mr-2" />
          <span>{m.display_name}</span>
        </ModelSelectorItem>
      ))}
    </ModelSelectorGroup>
  );
}

function ChatPromptAttachments() {
  const { files, remove } = usePromptInputAttachments();
  
  if (files.length === 0) return null;

  return (
    <Attachments variant="inline" className="px-3 pt-2">
      {files.map((file) => (
        <Attachment key={file.id} data={file} onRemove={() => remove(file.id)}>
          <AttachmentPreview />
          <AttachmentInfo />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
}
