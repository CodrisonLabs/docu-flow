"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useConversations() {
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: api.conversations.list,
  });

  const createMutation = useMutation({
    mutationFn: api.conversations.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.conversations.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    conversations,
    isLoading,
    createConversation: createMutation.mutateAsync,
    deleteConversation: deleteMutation.mutateAsync,
  };
}
