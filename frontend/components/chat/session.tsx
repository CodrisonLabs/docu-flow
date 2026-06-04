"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/lib/api";
import type { ApiKey, ApiKeyModel, Message, ProviderWithModels } from "@/lib/types";

type ChatSession = {
  conversationId: number | null;
  setConversationId: (id: number | null) => void;

  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;

  appendMessage: (message: Message) => void;
  clearMessages: () => void;

  isLoading: boolean;
  setIsLoading: (value: boolean) => void;

  isLoadingProviders: boolean;
  refreshProviders: () => Promise<void>;

  apiKeys: ApiKey[];
  providerModels: ProviderWithModels[];
  selectedApiKeyId: number | null;
  setSelectedApiKeyId: (id: number | null) => void;

  selectedProvider: string;
  selectedModel: string;
  setSelectedModel: (model: string) => void;

  sendMessage: (content: string) => Promise<void>;
  loadConversationMessages: (conversationId: number) => Promise<void>;
};

const ChatSessionContext = createContext<ChatSession | null>(null);

export function ChatSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [providerModels, setProviderModels] = useState<ProviderWithModels[]>([]);
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState("");

  const activeProviderKey = useMemo(() => {
    return providerModels.find((item) => item.id === selectedApiKeyId) ?? null;
  }, [providerModels, selectedApiKeyId]);

  const selectedProvider = activeProviderKey?.provider ?? "";

  const syncSelection = useCallback((nextProviderModels: ProviderWithModels[]) => {
    const firstKey = nextProviderModels[0] ?? null;

    setSelectedApiKeyId((currentId) => {
      if (currentId !== null) {
        const stillExists = nextProviderModels.some((item) => item.id === currentId);
        if (stillExists) return currentId;
      }
      return firstKey?.id ?? null;
    });
  }, []);

  const refreshProviders = useCallback(async () => {
    setIsLoadingProviders(true);

    try {
      const keys = await api.apiKeys.list();
      setApiKeys(keys);

      const withModels: ProviderWithModels[] = await Promise.all(
        keys.map(async (key) => ({
          id: key.id,
          provider: key.provider.toLowerCase(),
          models: await api.apiKeys.models(key.id),
        }))
      );

      setProviderModels(withModels);
      syncSelection(withModels);
    } catch (error) {
      console.error(error);
      setApiKeys([]);
      setProviderModels([]);
      setSelectedApiKeyId(null);
      setSelectedModel("");
    } finally {
      setIsLoadingProviders(false);
    }
  }, [syncSelection]);

  useEffect(() => {
    void refreshProviders();
  }, [refreshProviders]);

  useEffect(() => {
    if (!activeProviderKey) {
      setSelectedModel("");
      return;
    }

    const hasSelectedModel = activeProviderKey.models.some(
      (model) => model.id === selectedModel
    );

    if (!hasSelectedModel) {
      setSelectedModel(activeProviderKey.models[0]?.id ?? "");
    }
  }, [activeProviderKey, selectedModel]);

  const appendMessage = useCallback((message: Message) => {
    setMessages((current) => [...current, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  const loadConversationMessages = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const data = await api.conversations.messages(id);
      setConversationId(id);
      setMessages(data);
    } catch (error) {
      console.error(error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };

      appendMessage(userMessage);
      setIsLoading(true);

      try {
        let activeConversationId = conversationId;

        if (!activeConversationId) {
          const conversation = await api.conversations.create({
            title: trimmed.slice(0, 60),
          });

          activeConversationId = conversation.id;
          setConversationId(conversation.id);
        }

        const provider = activeProviderKey?.provider || "";
        const model = selectedModel || activeProviderKey?.models[0]?.id || "";

        if (!provider || !model) {
          throw new Error("No provider/model is available for chat.");
        }

        const result = await api.conversations.chat(activeConversationId, {
          message: trimmed,
          model,
          provider,
        });

        appendMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.response,
          model,
          provider,
        });
      } catch (error) {
        console.error(error);

        appendMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Something went wrong while contacting the server.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [appendMessage, activeProviderKey, conversationId, selectedModel]
  );

  const value = useMemo<ChatSession>(
    () => ({
      conversationId,
      setConversationId,
      messages,
      setMessages,
      appendMessage,
      clearMessages,
      isLoading,
      setIsLoading,
      isLoadingProviders,
      refreshProviders,
      apiKeys,
      providerModels,
      selectedApiKeyId,
      setSelectedApiKeyId,
      selectedProvider,
      selectedModel,
      setSelectedModel,
      sendMessage,
      loadConversationMessages,
    }),
    [
      appendMessage,
      apiKeys,
      clearMessages,
      conversationId,
      isLoading,
      isLoadingProviders,
      loadConversationMessages,
      messages,
      providerModels,
      refreshProviders,
      selectedApiKeyId,
      selectedModel,
      selectedProvider,
      sendMessage,
    ]
  );

  return (
    <ChatSessionContext.Provider value={value}>
      {children}
    </ChatSessionContext.Provider>
  );
}

export function useChatSession() {
  const context = useContext(ChatSessionContext);

  if (!context) {
    throw new Error("useChatSession must be used within a ChatSessionProvider");
  }

  return context;
}