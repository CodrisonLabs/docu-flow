import {
  ApiKey,
  ApiKeyModel,
  ChatRequest,
  Conversation,
  KnowledgeBase,
  Message,
  Namespace,
  TokenResponse,
  User,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const STORAGE_KEY = "docuflow_token";

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
};

export const setToken = (token: string) => {
  localStorage.setItem(STORAGE_KEY, token);
};

export const removeToken = () => {
  localStorage.removeItem(STORAGE_KEY);
};

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      
      let message = response.statusText;
      if (typeof data === "object" && data !== null) {
        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data.detail)) {
          message = data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ");
        } else if (data.detail) {
          message = JSON.stringify(data.detail);
        } else if (data.message) {
          message = data.message;
        }
      } else if (typeof data === "string" && data.length > 0) {
        message = data;
      }
      
      throw new ApiError(message, response.status, data);
    }

  return data as T;
}

export const api = {
  auth: {
    register: (data: any) => request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    login: (data: any) => request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    me: () => request<User>("/users/me"),
  },
  conversations: {
    list: () => request<Conversation[]>("/conversations"),
    create: (title: string) => request<Conversation>("/conversations", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
    delete: (id: number) => request<void>(`/conversations/${id}`, {
      method: "DELETE",
    }),
    getMessages: (id: number) => request<Message[]>(`/conversations/${id}/messages`),
    chat: (id: number, data: ChatRequest) => request<{ response: string }>(`/conversations/${id}/chat`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    upload: (id: number, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return request<{ filename: string; mime_type: string; base64: string }>(`/conversations/${id}/upload`, {
        method: "POST",
        body: formData,
      });
    },
  },
  apiKeys: {
    list: () => request<ApiKey[]>("/api-keys"),
    create: (provider: string, key: string) => request<void>("/api-keys", {
      method: "POST",
      body: JSON.stringify({ provider, key }),
    }),
    delete: (id: number) => request<void>(`/api-keys/${id}`, {
      method: "DELETE",
    }),
    getModels: (id: number) => request<ApiKeyModel[]>(`/api-keys/${id}/models`),
  },
  kb: {
    get: () => request<KnowledgeBase>("/kb"),
    listNamespaces: () => request<Namespace[]>("/kb/namespaces"),
    createNamespace: (name: string) => request<Namespace>("/kb/namespaces", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
    deleteNamespace: (id: number) => request<void>(`/kb/namespaces/${id}`, {
      method: "DELETE",
    }),
    listDocuments: (namespaceId: number) => request<Document[]>(`/kb/namespaces/${namespaceId}/documents`),
    uploadDocument: (namespaceId: number, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return request<any>(`/kb/namespaces/${namespaceId}/upload`, {
        method: "POST",
        body: formData,
      });
    },
  },
};
