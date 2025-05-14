import type { ReactNode } from "react";

export interface AuthCtx {
  token: string | null;
  login: (t: string) => void;
  logout: () => void;
}

export interface BlogPost {
  id: number;
  author: string;
  content: string;
  likes: number;
  date: string; // ISO date
  category: string;
}

export interface VaultFile {
  filename: string;
  url: string;
  timestamp: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface NavButtonProps {
  to: string;
  label: string;
  icon: ReactNode;
  activeIcon: ReactNode;
  isActive: boolean;
}

export interface LayoutProps {
  children: ReactNode;
}
