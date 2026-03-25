import { atom } from 'jotai';
import type { Conversation, Message } from '@/types/chat';
import { mockConversations, mockMessagesMap } from '@/data/chatData';

export const selectedConversationIdAtom = atom<string | null>(null);

export const isSidebarCollapsedAtom = atom<boolean>(false);

export const conversationsAtom = atom<Conversation[]>(mockConversations);

export const messagesMapAtom = atom<Map<string, Message[]>>(mockMessagesMap);
