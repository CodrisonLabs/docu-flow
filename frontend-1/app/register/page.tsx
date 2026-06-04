"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
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
      await api.auth.register({ name, email, password });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to register");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Account created"
        subtitle="You will be redirected to the login page..."
      >
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <CheckCircle2 className="size-12 text-primary animate-in zoom-in duration-300" />
          <p className="text-sm font-medium">Registration successful</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Enter your information to get started"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Name
          </label>
          <Input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-xl border-border bg-transparent px-3 py-2 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
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
              <span>Creating account...</span>
            </div>
          ) : (
            "Register"
          )}
        </Button>
        <div className="text-center text-sm text-muted-foreground pt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
