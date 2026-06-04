"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useConversations } from "@/hooks/use-conversations";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Settings, 
  Database, 
  LogOut,
  Trash2,
  Plus,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  User,
  KeyRound,
  Fingerprint,
  LayoutGrid,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { conversations, isLoading, createConversation, deleteConversation } = useConversations();
  const { logout, user } = useAuth();
  
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const SidebarItem = ({ href, icon: Icon, label, onClick }: { href?: string, icon: any, label: string, onClick?: () => void }) => {
    const isActive = href ? pathname === href : false;
    const content = href ? (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
          isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
          isCollapsed && "justify-center px-0"
        )}
      >
        <Icon className="size-4 shrink-0" />
        {!isCollapsed && <span>{label}</span>}
      </Link>
    ) : (
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent text-muted-foreground",
          isCollapsed && "justify-center px-0"
        )}
      >
        <Icon className="size-4 shrink-0" />
        {!isCollapsed && <span>{label}</span>}
      </button>
    );

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const handleNewChat = () => {
    router.push('/chat');
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      await deleteConversation(deleteId);
      if (pathname === `/chat/${deleteId}`) {
        router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      const message = err.message || "Failed to delete conversation.";
      alert(`${message}\n\nNote: If this is an IntegrityError (NOT NULL constraint), the backend models need 'cascade="all, delete-orphan"' added to the messages relationship.`);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className={cn(
      "flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Top Bar */}
      <div className={cn(
        "flex items-center p-4",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="size-5 text-primary" />
            <span className="truncate">DocuFlow</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="px-3 py-2 space-y-1 flex-none">
          {/* 1. New Chat */}
          <div className="pb-2">
            {isCollapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleNewChat}
                    variant="outline" 
                    className="w-full justify-center px-0 border-border shadow-none rounded-md"
                  >
                    <Plus className="size-4 shrink-0" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  New Chat
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button 
                onClick={handleNewChat}
                variant="outline" 
                className="w-full justify-start gap-2 border-border shadow-none rounded-md"
              >
                <Plus className="size-4 shrink-0" />
                <span>New Chat</span>
              </Button>
            )}
          </div>

          {/* 2. Search Chats */}
          <SidebarItem 
            icon={Search} 
            label="Search chats" 
            onClick={() => {}} // Implementation can be added later
          />

          {/* 3. Knowledge Base */}
          <SidebarItem href="/kb" icon={Database} label="Knowledge Base" />
        </div>

        {!isCollapsed && (
          <div className="px-6 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex-none">
            Recent Chats
          </div>
        )}

        {/* 4. Conversation List */}
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 py-2">
            {[...conversations].sort((a, b) => b.id - a.id).map((conv) => {
              const isActive = pathname === `/chat/${conv.id}`;
              const content = (
                <div
                  className={cn(
                    "group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent cursor-pointer",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    isCollapsed && "justify-center px-0"
                  )}
                  onClick={() => router.push(`/chat/${conv.id}`)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className="size-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{conv.title}</span>}
                  </div>
                  {!isCollapsed && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteId(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  )}
                </div>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={conv.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      {content}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {conv.title}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <React.Fragment key={conv.id}>{content}</React.Fragment>;
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Bottom Bar */}
      <div className={cn(
        "border-t border-border p-4 flex",
        isCollapsed ? "justify-center" : "justify-start"
      )}>
        <DropdownMenu>
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button className="outline-none">
                    <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {user?.name?.slice(0, 2).toUpperCase() || <User className="size-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">
                {user?.name || "User"}
              </TooltipContent>
            </Tooltip>
          ) : (
            <DropdownMenuTrigger asChild>
              <button className="outline-none">
                <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {user?.name?.slice(0, 2).toUpperCase() || <User className="size-4" />}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
          )}
          <DropdownMenuContent align={isCollapsed ? "center" : "start"} side="right" className="w-56 mb-2">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Account
            </div>
            <DropdownMenuItem className="cursor-pointer">
              <Fingerprint className="mr-2 size-4" />
              <span>Personalization</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 size-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => router.push("/settings")}
            >
              <Settings className="mr-2 size-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => router.push("/keys")}
            >
              <KeyRound className="mr-2 size-4" />
              <span>API Keys</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={logout}
            >
              <LogOut className="mr-2 size-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border">
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteId(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={isDeleting}
              className="rounded-xl shadow-none"
            >
              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
