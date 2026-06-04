"use client";

import React from "react";
import { Settings, User, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-12 pb-20">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account preferences and workspace configuration.</p>
        </div>

        <div className="grid gap-6">
          <SettingsSection 
            icon={User} 
            title="Profile" 
            description="Manage your personal information and public profile." 
          />
          <SettingsSection 
            icon={Palette} 
            title="Appearance" 
            description="Customize the look and feel of your workspace." 
          />
          <SettingsSection 
            icon={Bell} 
            title="Notifications" 
            description="Choose how you want to be notified of updates." 
          />
          <SettingsSection 
            icon={Shield} 
            title="Security" 
            description="Update your password and secure your account." 
          />
        </div>

        <div className="p-8 border border-dashed border-border rounded-3xl text-center bg-accent/5">
          <p className="text-sm text-muted-foreground italic">
            More settings coming soon as we continue to build DocuFlow.
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="group flex items-start gap-4 p-6 border border-border rounded-2xl bg-card hover:bg-accent/5 transition-all cursor-not-allowed opacity-70">
      <div className="p-3 bg-accent/50 rounded-xl text-accent-foreground group-hover:scale-110 transition-transform">
        <Icon className="size-5" />
      </div>
      <div className="space-y-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
