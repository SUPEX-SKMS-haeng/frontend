export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export type ConversationStatus = 'idle' | 'generating' | 'streaming' | 'error';

export interface Conversation {
  id: string;
  title: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
