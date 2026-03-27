# 상태 관리 패턴

## 클라이언트 상태 — Jotai

위치: `src/store/{도메인}/{domain}Atom.ts`

- **순수 클라이언트 상태만 정의** (선택된 항목, 필터 조건, UI 상태 등)
- `atomWithQuery`/`atomWithMutation`은 여기서 정의하지 않음 → `hooks/`에서 정의
- 여러 컴포넌트·훅이 공유하는 상태만 atom으로 정의
- 단일 컴포넌트 전용 상태는 atom 금지 → `useState` 사용
- named export만

```typescript
// store/admin/userAtom.ts
import { atom } from 'jotai';
import type { User } from '@/types/admin/user';

// ✅ 여러 컴포넌트·훅이 공유하는 상태만 atom
export const selectedUserAtom = atom<User | null>(null);
export const userSearchKeywordAtom = atom<string>('');

// ❌ 단일 컴포넌트 전용 상태는 atom 금지 → useState 사용
```

---

## API 상태 — jotai-tanstack-query

### 위치 및 파일 패턴

- 위치: `src/hooks/{도메인}/use{Domain}Data.ts`
- `useQuery`/`useMutation` 직접 import 절대 금지
- 반드시 `atomWithQuery`/`atomWithMutation` 사용
- named export만

### atom 네이밍

- API 함수명 + `Atom` (예: `getUserListAtom`, `createUserAtom`, `deleteUserAtom`)

### queryKey 네이밍

- 목록: `['{domain}s']` (예: `['users']`)
- 단건: `['{domain}', id]` (예: `['user', id]`) — id가 atom인 경우 `get(idAtom)` 활용

### atomWithQuery 패턴

```typescript
import { atomWithQuery } from 'jotai-tanstack-query';
import { getUserList } from '@/api/admin/user';

export const getUserListAtom = atomWithQuery(() => ({
  queryKey: ['users'],
  queryFn: getUserList,
}));
```

- `enabled` 조건: 데이터 흐름을 분석하여 필요한 경우 추가 (예: 단건 조회는 id가 있을 때만, 의존 데이터가 로드된 후에만 등)
- response data mapping이 필요한 경우 hook 내에서 수행

### atomWithMutation 패턴

- CRUD가 모두 있는 경우, CUD mutation의 `onSuccess`에서 반드시 관련 query를 invalidate하여 목록을 자동 갱신

```typescript
import { atomWithMutation } from 'jotai-tanstack-query';
import { queryClient } from '@/lib/queryClient';
import { createUser, deleteUser } from '@/api/admin/user';

export const createUserAtom = atomWithMutation(() => ({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
}));

export const deleteUserAtom = atomWithMutation(() => ({
  mutationFn: deleteUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
}));
```

### 전체 예시

```typescript
// src/hooks/admin/useUserData.ts
import { atomWithQuery, atomWithMutation } from 'jotai-tanstack-query';
import { queryClient } from '@/lib/queryClient';
import { getUserList, createUser, deleteUser } from '@/api/admin/user';

export const getUserListAtom = atomWithQuery(() => ({
  queryKey: ['users'],
  queryFn: getUserList,
}));

export const createUserAtom = atomWithMutation(() => ({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
}));

export const deleteUserAtom = atomWithMutation(() => ({
  mutationFn: deleteUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
}));

// ❌ 금지
// import { useQuery, useMutation } from '@tanstack/react-query'
```

---

## 컴포넌트에서 atom 사용

### Query (읽기) → `useAtomValue`

구조 분해 시 제네릭한 이름(`data`, `isLoading`, `error`)을 **도메인에 맞게 재정의**한다.

```typescript
// ✅ useAtomValue + 이름 재정의
const { data: users, isLoading: isUsersLoading, error: usersError } = useAtomValue(getUserListAtom);
const { data: userDetail, isLoading: isUserDetailLoading } = useAtomValue(getUserByIdAtom);
```

### Mutation (쓰기) → `useSetAtom`

```typescript
// ✅ useSetAtom
const { mutate: createUser } = useSetAtom(createUserAtom);
const { mutate: deleteUser } = useSetAtom(deleteUserAtom);
```

### 금지 패턴

```typescript
// ❌ useAtom 이중 구조 분해 금지
const [{ data, isLoading, error }] = useAtom(getUserListAtom);

// ❌ 제네릭한 이름 그대로 사용 금지
const { data, isLoading, error } = useAtomValue(getUserListAtom);
```

---

## 핸들러 훅에서 API atom 소비

핸들러 훅(`use{Domain}Handler.ts`)에서 API atom을 import하여 사용한다.
핸들러 훅의 파일 분류·분리 기준은 @.claude/rules/coding-standards.md 의 "hooks/ 파일 분류" 섹션 참조.

```typescript
// src/hooks/chat/useChatSendHandler.ts
import { useSetAtom } from 'jotai';
import { sendMessageAtom } from '@/hooks/chat/useChatData';

export const useChatSendHandler = () => {
  const { mutate: sendMessage } = useSetAtom(sendMessageAtom);

  const handleSend = (content: string) => {
    if (!content.trim()) return;
    sendMessage({ content });
  };

  return { handleSend };
};
```
