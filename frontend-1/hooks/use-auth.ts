"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, getToken, removeToken } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: api.auth.me,
    enabled: !!getToken(),
    retry: false,
  });

  const logout = () => {
    removeToken();
    queryClient.clear();
    router.push("/login");
  };

  useEffect(() => {
    if (!isLoading && !user && !["/login", "/register"].includes(pathname)) {
      router.push("/login");
    }
  }, [user, isLoading, pathname, router]);

  return { user, isLoading, error, logout };
}
