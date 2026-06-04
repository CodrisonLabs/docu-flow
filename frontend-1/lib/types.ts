export interface User {
  id: number;
  name: string;
  email: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
}

export interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  created_at?: string;
}

export interface ChatRequest {
  message: string;
  model: string;
  provider: string;
  namespace_id?: number;
  file_base64?: string;
  file_mime_type?: string;
}

export interface ApiKey {
  id: number;
  provider: string;
}

export interface ApiKeyModel {
  id: string;
  display_name: string;
  description: string;
}

export interface Namespace {
  id: number;
  name: string;
  pinecone_ref: string;
  created_at: string;
}

export interface Document {
  id: number;
  filename: string;
  file_type: string;
  file_url: string;
  created_at: string;
}

export interface KnowledgeBase {
  id: number;
  created_at: string;
  namespaces: Namespace[];
}
