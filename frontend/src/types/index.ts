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

export interface Story {
  id: string;
  title: string;
  body: string;
  date: Date;
  author?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  files?: UploadedFile[];
}

export interface UploadedFile {
  url: string; // Server URL
  previewUrl: string; // Browser-generated URL for preview
  type: string;
  name: string;
}

export interface CategoryInfo {
  label: string;
  icon: string;
  acceptedTypes: string;
  color: string;
}

export type MockSentenceKeys = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface TypewriterTextProps {
  text: string;
  typingSpeed?: number;
  startDelay?: number;
  showCursor?: boolean;
  isComplete?: boolean;
  onComplete?: () => void;
  className?: string;
}

export interface InViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export interface CircularProgressContainerProps {
  containerWidth?: number;
  rtl?: boolean;
}

export interface AnimatedCircularProgressProps {
  percentage: number;
  label: string;
  size: number;
  thickness: number;
  accentColor: string;
  trackColor: string;
  textColor: string;
  isInView: boolean;
  delay?: number;
}
