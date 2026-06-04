"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
import { Database, Plus, Cpu, Sparkles } from "lucide-react";

export default function NewChatPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedNamespace, setSelectedNamespace] = useState<number | undefined>(undefined);
  const [isStarting, setIsStarting] = useState(false);

  const { data: apiKeys = [] } = useQuery({
    queryKey: ["apiKeys"],
    queryFn: api.apiKeys.list,
  });

  const { data: namespaces = [] } = useQuery({
    queryKey: ["namespaces"],
    queryFn: api.kb.listNamespaces,
  });

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

  const handleSubmit = async (msg: { text: string; files: any[] }) => {
    if (!msg.text && msg.files.length === 0) return;
    setIsStarting(true);

    let file_base64: string | undefined;
    let file_mime_type: string | undefined;

    if (msg.files.length > 0) {
      const file = msg.files[0];
      if (file.url.startsWith("data:")) {
        file_base64 = file.url.split(",")[1];
        file_mime_type = file.mediaType;
      }
    }

    try {
      // 1. Generate a title from the first message
      const title = msg.text ? msg.text.slice(0, 30) + (msg.text.length > 30 ? "..." : "") : "New Conversation";
      
      // 2. Create the conversation
      const conv = await api.conversations.create(title);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      // 3. Optimistically set the message in cache
      queryClient.setQueryData(["messages", conv.id], () => [
        { id: Date.now(), role: "user", content: msg.text, created_at: new Date().toISOString() }
      ]);

      // 4. Send the chat request
      api.conversations.chat(conv.id, { 
        message: msg.text, 
        model: selectedModel,
        provider: selectedProvider,
        namespace_id: selectedNamespace,
        file_base64, 
        file_mime_type 
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["messages", conv.id] });
      }).catch(console.error);

      // 5. Redirect to the new chat
      router.push(`/chat/${conv.id}`);
    } catch (err) {
      console.error(err);
      setIsStarting(false);
    }
  };

  const handleModelSelect = (modelId: string, provider: string) => {
    setSelectedModel(modelId);
    setSelectedProvider(provider);
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background relative">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full space-y-4 text-center pb-8">
          <div className="size-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto border border-primary/10">
            <Sparkles className="size-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">How can I help you today?</h1>
        </div>
      </div>

      {/* Input */}
      <div className="bg-background p-4 pb-6 absolute bottom-0 left-0 right-0">
        <div className="max-w-3xl mx-auto w-full border border-border rounded-2xl bg-card shadow-sm overflow-hidden focus-within:border-primary/30 transition-colors">
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
              <PromptInputSubmit status={isStarting ? "submitted" : undefined} className="bg-primary text-primary-foreground rounded-md shadow-none" />
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
