export type User = {
  id: number;
  name: string;
  email: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: "bearer";
};

export type Conversation = {
  id: number;
  title: string;
  created_at: string;
};

export type ApiKey = {
  id: number;
  provider: string;
};

export type Namespace = {
  id: number;
  name: string;
  pinecone_ref: string;
  created_at: string;
};

export type KnowledgeBase = {
  id: number;
  created_at: string;
  namespaces: Namespace[];
};

export type ChatRequest = {
  message: string;
  model: string;
  provider: string;
  namespace_id?: number | null;
  file_base64?: string | null;
  file_mime_type?: string | null;
};

export type ConversationCreate = {
  title: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type ApiKeyCreate = {
  provider: string;
  key: string;
};

export type NamespaceCreate = {
  name: string;
};

export type MessageRole = "user" | "assistant" | "system";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt?: string;
  model?: string;
  provider?: string;
  sources?: string[];
};