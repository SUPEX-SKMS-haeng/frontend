# 상태 관리 패턴

## 클라이언트 상태 — Jotai

```typescript
// store/userAtom.ts
import { atom } from "jotai";
import type { User } from "@/types/user";

// ✅ 여러 컴포넌트·훅이 공유하는 상태만 atom으로 정의
export const selectedUserAtom = atom<User | null>(null);

// ❌ 단일 컴포넌트 전용 상태는 atom 금지 → useState 사용
```

---

## API 상태 — jotai-tanstack-query

`useQuery`, `useMutation`을 직접 사용하지 않습니다.
반드시 `atomWithQuery`, `atomWithMutation`을 사용합니다.

```typescript
// store/userAtom.ts
import { atomWithQuery, atomWithMutation } from "jotai-tanstack-query";
import { getUsers, deleteUser } from "@/api/user";

// ✅ 올바른 패턴
export const usersAtom = atomWithQuery(() => ({
  queryKey: ["users"],
  queryFn: getUsers,
}));

export const deleteUserAtom = atomWithMutation(() => ({
  mutationFn: deleteUser,
}));

// ❌ 금지
// import { useQuery, useMutation } from '@tanstack/react-query'
```
