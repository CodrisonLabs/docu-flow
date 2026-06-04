"use client";

import React from "react";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="border border-border p-6 sm:p-8 bg-card rounded-lg">
          {children}
        </div>
        <div className="text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
