import type { UserProfile, Conversation, Message } from '@/types/chat';

export const mockUserProfile: UserProfile = {
  id: 'user-001',
  name: '김민수',
  email: 'minsu.kim@example.com',
  avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=minsu',
};

export const mockConversations: Conversation[] = [
  {
    id: 'conv-001',
    title: 'React 프로젝트 구조 상담',
    status: 'idle',
    createdAt: '2026-03-17T09:00:00Z',
    updatedAt: '2026-03-17T09:15:00Z',
  },
  {
    id: 'conv-002',
    title: 'TypeScript 제네릭 사용법',
    status: 'idle',
    createdAt: '2026-03-18T14:30:00Z',
    updatedAt: '2026-03-18T14:45:00Z',
  },
  {
    id: 'conv-003',
    title: '배포 파이프라인 설정 도움',
    status: 'idle',
    createdAt: '2026-03-19T08:00:00Z',
    updatedAt: '2026-03-19T08:20:00Z',
  },
  {
    id: 'conv-004',
    title: 'Tailwind CSS 커스텀 테마',
    status: 'idle',
    createdAt: '2026-03-19T10:00:00Z',
    updatedAt: '2026-03-19T10:05:00Z',
  },
];

export const mockMessagesMap = new Map<string, Message[]>([
  [
    'conv-001',
    [
      {
        id: 'msg-001',
        conversationId: 'conv-001',
        role: 'user',
        content: '안녕하세요! React 프로젝트 폴더 구조에 대해 질문이 있어요.',
        createdAt: '2026-03-17T09:00:00Z',
      },
      {
        id: 'msg-002',
        conversationId: 'conv-001',
        role: 'assistant',
        content: '안녕하세요! 네, 말씀해 주세요. 어떤 부분이 궁금하신가요?',
        createdAt: '2026-03-17T09:00:05Z',
      },
    ],
  ],
  [
    'conv-002',
    [
      {
        id: 'msg-003',
        conversationId: 'conv-002',
        role: 'user',
        content: 'TypeScript 제네릭을 어떻게 활용하면 좋을까요?',
        createdAt: '2026-03-18T14:30:00Z',
      },
      {
        id: 'msg-004',
        conversationId: 'conv-002',
        role: 'assistant',
        content: '제네릭은 재사용 가능한 컴포넌트나 함수를 만들 때 유용합니다. 예시를 보여드릴게요.',
        createdAt: '2026-03-18T14:30:05Z',
      },
    ],
  ],
  [
    'conv-003',
    [
      {
        id: 'msg-005',
        conversationId: 'conv-003',
        role: 'user',
        content: 'CI/CD 파이프라인을 처음 설정하려고 합니다.',
        createdAt: '2026-03-19T08:00:00Z',
      },
      {
        id: 'msg-006',
        conversationId: 'conv-003',
        role: 'assistant',
        content: '좋습니다! 어떤 플랫폼을 사용하시나요? GitHub Actions를 추천드려요.',
        createdAt: '2026-03-19T08:00:05Z',
      },
    ],
  ],
]);
