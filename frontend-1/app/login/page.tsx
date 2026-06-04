"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, setToken } from "@/lib/api";
import { Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.auth.login({ email, password });
      setToken(res.access_token);
      setSuccess(true);
      
      // Use window.location.href for a full reload to ensure auth state is picked up correctly
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (err: any) {
      setError(err.message || "Failed to login");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Welcome back"
        subtitle="Redirecting you to your workspace..."
      >
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <CheckCircle2 className="size-12 text-primary animate-in zoom-in duration-300" />
          <p className="text-sm font-medium">Authentication successful</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Login"
      subtitle="Enter your credentials to access your account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Email
          </label>
          <Input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-xl border-border bg-transparent px-3 py-2 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Password
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-xl border-border bg-transparent px-3 py-2 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        {error && <p className="text-xs text-destructive text-center">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-none border-none h-11 font-medium transition-all"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              <span>Authenticating...</span>
            </div>
          ) : (
            "Login"
          )}
        </Button>
        <div className="text-center text-sm text-muted-foreground pt-2">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Register
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
