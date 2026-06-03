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
import { getFirstAvailableModel } from "@/lib/models";
import type { Message } from "@/lib/types";

type ChatSession = {
  conversationId: number | null;
  setConversationId: (id: number | null) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  appendMessage: (message: Message) => void;
  clearMessages: () => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  selectedProvider: string;
  setSelectedProvider: (provider: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableProviders: string[];
  setAvailableProviders: (providers: string[]) => void;
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
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4.1");
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);

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

        const result = await api.conversations.chat(activeConversationId, {
          message: trimmed,
          model: selectedModel,
          provider: selectedProvider,
        });

        appendMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.response,
          model: selectedModel,
          provider: selectedProvider,
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
    [appendMessage, conversationId, selectedModel, selectedProvider]
  );

  useEffect(() => {
    const fallback = getFirstAvailableModel(availableProviders);

    if (!fallback) return;

    const providerIsAvailable = availableProviders.includes(selectedProvider);

    if (!providerIsAvailable) {
      setSelectedProvider(fallback.provider);
      setSelectedModel(fallback.model);
    }
  }, [availableProviders, selectedProvider]);

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
      selectedProvider,
      setSelectedProvider,
      selectedModel,
      setSelectedModel,
      availableProviders,
      setAvailableProviders,
      sendMessage,
      loadConversationMessages,
    }),
    [
      appendMessage,
      clearMessages,
      conversationId,
      isLoading,
      loadConversationMessages,
      messages,
      selectedModel,
      selectedProvider,
      availableProviders,
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