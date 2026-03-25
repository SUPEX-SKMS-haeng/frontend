# API Connect — 백엔드 API → 프론트엔드 연동

백엔드 FastAPI 소스를 읽고, 프론트엔드 타입/API/상태관리/훅/컴포넌트 연결까지
Foundation → UI 전 과정을 순서대로 수행한다.

## 사용법

`/api-connect $ARGUMENTS`

예시:
- `/api-connect user` — 도메인명으로 자동 탐색
- `/api-connect ../backend/app/routers/user.py` — 파일 경로 직접 지정
- `/api-connect user --component UserListTable` — 연결할 컴포넌트 명시

---

## Step 1 — 백엔드 소스 분석

### 파일 탐색 (FastAPI 기준)

CLAUDE.md의 "백엔드 연동 정보"에서 경로를 참조한다.
도메인명만 받은 경우 아래 순서로 탐색:
1. `{백엔드 루트}/{라우터}/{domain}.py`
2. `{백엔드 루트}/{스키마}/{domain}.py`
3. `{백엔드 루트}/{모델}/{domain}.py`

읽어야 할 파일:
- 라우터 파일 — 엔드포인트 정의 (method, path, 파라미터)
- 스키마 파일 — Pydantic 모델 (타입 정의)
- 모델 파일 — DB 모델 (필요 시 참조)

### 추출할 정보

| 항목 | 예시 |
|------|------|
| Method + Path | `GET /api/v1/users` |
| Path Params | `user_id: int` |
| Query Params | `page: int, size: int` |
| Request Body | `CreateUserRequest` |
| Response Model | `UserResponse`, `List[UserResponse]` |
| 인증 | `Depends(get_current_user)` 여부 |

추출 결과를 출력하고 확인 요청. **다음 단계 진행 전 승인 필수.**

---

## Step 2 — types/ 정의

위치: `src/types/{domain}.ts`

규칙:
- 모든 필드 camelCase (Pydantic snake_case → camelCase 변환)
- `any` 금지, `interface` 선호
- **Request/Response 래퍼 타입은 별도 정의하지 않음**
  - Response: 도메인 타입 하나만 정의 (예: `User`). Axios interceptor가 snake_case → camelCase 자동 변환하므로 앱 전체에서 이 타입을 그대로 사용
  - Request: 기존 도메인 타입 또는 `Partial<User>` 등을 파라미터로 받음. Axios interceptor가 body(`data`)와 query params(`params`) 모두 camelCase → snake_case 자동 변환하므로 api 함수 내 변환 로직 추가 금지
  - `CreateUserRequest`, `UserResponse` 같은 중복 래퍼 타입 생성 금지
- Pagination 응답이 있으면 제네릭 활용:
```typescript
interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
```
- named export만

작성 후 코드 출력 및 확인 요청. **승인 전 다음 단계 금지.**

---

## Step 3 — api/ 정의

위치: `src/api/{domain}.ts`

규칙:
- `@/lib/axios`의 api 인스턴스 import (직접 `axios` import 금지)
- 함수명: 동사+명사 (`getUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser`)
- 파라미터/반환 타입: Step 2의 interface 사용
- Query string 직렬화 필요 시 `qs` 사용
- named export만
- Axios interceptor가 snake_case → camelCase 자동 변환하므로 API 함수 내 변환 로직 추가 금지

작성 후 코드 출력 및 확인 요청. **승인 전 다음 단계 금지.**

---

## Step 4 — store/ atom 정의

위치: `src/store/{domain}Atom.ts`

규칙:
- `atomWithQuery`, `atomWithMutation`만 사용
- `useQuery` / `useMutation` 직접 import 절대 금지
- queryKey 네이밍:
  - 목록: `['{domain}s']`
  - 단건: `['{domain}', id]` — id가 atom인 경우 `get(idAtom)` 활용
- CRUD가 모두 있는 경우, CUD mutation의 `onSuccess`에서 반드시 관련 query를 invalidate하여 목록을 자동 갱신
- named export만

```typescript
// 참고 패턴
import { queryClient } from '@/lib/queryClient';

export const usersAtom = atomWithQuery(() => ({
  queryKey: ['users'],
  queryFn: getUsers,
}));

export const createUserAtom = atomWithMutation(() => ({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
}));

export const updateUserAtom = atomWithMutation(() => ({
  mutationFn: updateUser,
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

작성 후 코드 출력 및 확인 요청. **승인 전 다음 단계 금지.**

---

## Step 5 — hooks/ 작성

위치: `src/hooks/use{Domain}.ts`

규칙:
- store atom을 `useAtom`으로 구독
- 컴포넌트가 필요로 하는 인터페이스만 반환 (atom 구조를 그대로 노출하지 않음)
- 기존 Mock 훅의 반환 인터페이스를 최대한 유지하여 컴포넌트 변경 최소화
- isLoading, error 상태 포함

```typescript
// 참고 패턴
export const useUsers = () => {
  const [{ data, isLoading, error }] = useAtom(usersAtom);
  const [, createUser] = useAtom(createUserAtom);

  return {
    users: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    createUser: createUser.mutate,
  };
};
```

작성 후 코드 출력 및 확인 요청. **승인 전 다음 단계 금지.**

---

## Step 6 — 컴포넌트 연결

대상 컴포넌트: `$ARGUMENTS`에서 `--component`로 명시한 경우 해당 파일, 미명시 시 관련 컴포넌트 탐색 후 확인 요청.

작업 내용:
- 하드코딩 더미 데이터 → Step 5 훅 import로 교체
- 빈 이벤트 핸들러(`() => {}`) → 훅의 mutation 함수 연결
- isLoading → shadcn/ui Skeleton 또는 로딩 처리
- error → 에러 UI 처리 (toast or 인라인 메시지)
- 하드코딩 문자열 → `t()` 교체 + locale 파일에 키 추가

금지:
- 마크업/레이아웃 구조 변경
- 비즈니스 로직을 컴포넌트 안에 직접 작성
- `any` 타입 사용

작성 후 변경된 부분만 diff 형태로 출력 및 최종 확인 요청.

---

## 전체 완료 체크리스트

- [ ] types/ — Pydantic 모델과 1:1 대응, 필드 camelCase
- [ ] api/ — `@/lib/axios` 사용, 함수명 동사+명사
- [ ] store/ — `atomWithQuery`/`atomWithMutation`만 사용
- [ ] hooks/ — 기존 Mock 훅 반환 인터페이스 유지
- [ ] 컴포넌트 — 하드코딩 제거, 훅 연결 완료
- [ ] `any` 타입 없음
- [ ] `pnpm tsc --noEmit` 통과
- [ ] Mock 데이터 파일(`data/`)은 삭제하지 않음

---

## 주의사항

- 백엔드 경로를 찾을 수 없으면 사용자에게 경로를 질문
- Mock → 실제 API 전환 시 hooks의 반환 인터페이스를 최대한 유지하여 컴포넌트 변경 최소화
- 각 Step마다 사용자 승인을 받고 다음으로 진행 (한 번에 전부 작성하지 않음)
