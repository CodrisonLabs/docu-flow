import type {
  ApiKey,
  ApiKeyCreate,
  ChatRequest,
  Conversation,
  ConversationCreate,
  KnowledgeBase,
  LoginRequest,
  Message,
  Namespace,
  NamespaceCreate,
  RegisterRequest,
  TokenResponse,
  User,
} from "./types";
import { getToken, removeToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
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

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401) removeToken();

    const errorMessage =
      typeof data === "string"
        ? data
        : typeof data === "object" && data !== null && "detail" in data
          ? String((data as { detail?: unknown }).detail ?? response.statusText)
          : response.statusText;

    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

export const api = {
  auth: {
    register: (body: RegisterRequest) =>
      request<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    login: (body: LoginRequest) =>
      request<TokenResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    me: () => request<User>("/users/me"),
  },

  conversations: {
    list: () => request<Conversation[]>("/conversations"),

    create: (body: ConversationCreate) =>
      request<Conversation>("/conversations", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    remove: (conversationId: number) =>
      request<void>(`/conversations/${conversationId}`, {
        method: "DELETE",
      }),

    chat: (conversationId: number, body: ChatRequest) =>
      request<{ response: string }>(`/conversations/${conversationId}/chat`, {
        method: "POST",
        body: JSON.stringify(body),
      }),

    upload: (conversationId: number, file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      return request<unknown>(`/conversations/${conversationId}/upload`, {
        method: "POST",
        body: formData,
      });
    },

    // -- Added: fetch all messages for a given conversation --
    messages: (conversationId: number) =>
      request<Message[]>(`/conversations/${conversationId}/messages`),
  },

  apiKeys: {
    list: () => request<ApiKey[]>("/api-keys"),

    create: (body: ApiKeyCreate) =>
      request<void>("/api-keys", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    remove: (keyId: number) =>
      request<void>(`/api-keys/${keyId}`, {
        method: "DELETE",
      }),
  },

  kb: {
    get: () => request<KnowledgeBase>("/kb"),

    namespaces: {
      list: () => request<Namespace[]>("/kb/namespaces"),

      create: (body: NamespaceCreate) =>
        request<Namespace>("/kb/namespaces", {
          method: "POST",
          body: JSON.stringify(body),
        }),

      remove: (namespaceId: number) =>
        request<void>(`/kb/namespaces/${namespaceId}`, {
          method: "DELETE",
        }),

      documents: (namespaceId: number) =>
        request<unknown>(`/kb/namespaces/${namespaceId}/documents`),

      upload: (namespaceId: number, file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        return request<unknown>(`/kb/namespaces/${namespaceId}/upload`, {
          method: "POST",
          body: formData,
        });
      },
    },
  },
};

export { ApiError };