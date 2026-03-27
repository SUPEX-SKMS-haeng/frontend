# API Connect — 백엔드 API → 프론트엔드 연동

백엔드 FastAPI 소스를 읽고, 프론트엔드 타입/API/상태관리/훅/컴포넌트 연결까지
Foundation → UI 전 과정을 순서대로 수행한다.

## 사용법

`/api-connect $ARGUMENTS`

예시:
- `/api-connect user` — user 도메인 전체 탐색
- `/api-connect user getUserById` — 특정 API만 지정

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

위치: `src/types/{feature}/{domain}.ts`

- feature는 프로젝트의 features/도메인 구분에 따라 결정 (예: `admin`, `chat`, `auth`)
- 여러 feature가 공통으로 사용하는 타입은 `src/types/common/`에 배치
- feature가 없는 프로젝트는 `src/types/common/`만 사용

규칙:
- 타입/인터페이스 이름은 PascalCase (`User`, `GetUsersResponse`, `CreateUserBody`)
- 필드명은 camelCase (Pydantic snake_case → camelCase 변환)
- `any` 금지, `interface` 선호
- Axios interceptor가 snake_case ↔ camelCase 자동 변환하므로 api 함수 내 변환 로직 추가 금지
- named export만

### Request/Response 타입 정의

같은 도메인에서도 API가 여러 개이므로, **백엔드 API 함수명을 참고하여 타입명을 결정**한다.

**Response 타입:**
- Axios interceptor가 camelCase 변환하므로, **변환된 이후 형태를 기준으로 정의**
- 먼저 도메인 모델(`User` 등)을 정의하고, Response 타입에서 이를 참조
- **응답이 도메인 모델 그 자체면 별도 Response 타입 없이 도메인 모델을 직접 사용** (예: 단건 조회 → `User`)
- **응답에 페이지네이션 등 추가 필드가 있을 때만 Response 타입을 정의**하고, 내부에서 도메인 모델을 참조 (예: `GetUsersResponse { users: User[]; totalCount: number; }`)

**Request 타입:**
- API별로 요청 파라미터가 다르면 각각 정의 (예: `CreateUserBody`, `UpdateUserBody`, `GetUserListParams`)
- body와 params를 구분하여 타입명에 반영:
  - POST/PATCH/PUT body → `{Action}{Domain}Body` (예: `CreateUserBody`, `UpdateUserBody`)
  - GET query params → `{Action}{Domain}Params` (예: `GetUserListParams`, `SearchUserParams`)
- 프론트 api 함수의 파라미터 정의에서 `body` 또는 `params`로 명시하여 역할을 명확히 함

```typescript
// 예시: src/types/admin/user.ts

// --- 도메인 모델 ---
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

// --- Response (추가 필드가 있을 때만 정의) ---
// 단건 조회(getUserById)는 User 직접 사용 → 별도 Response 불필요
export interface GetUsersResponse {
  users: User[];
  totalCount: number;
}

// --- Request (body) ---
export interface CreateUserBody {
  name: string;
  email: string;
  role: string;
}

export interface UpdateUserBody {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

// --- Request (params) ---
export interface GetUserListParams {
  offset: number;
  limit: number;
  searchCategory?: string;
  searchKeyword?: string;
}
```

- Pagination 응답이 공통 구조이면 제네릭 활용 (`src/types/common/`에 배치):
```typescript
// src/types/common/pagination.ts
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
```

작성 후 코드 출력 및 확인 요청. **승인 전 다음 단계 금지.**

---

## Step 3 — api/ 정의

위치: `src/api/{feature}/{domain}.ts`

- feature 구분은 Step 2의 types/와 동일 (예: `api/admin/user.ts`, `api/chat/chat.ts`)

규칙:
- `@/lib/axios`의 api 인스턴스 import (직접 `axios` import 금지)
- 함수명: 동사+명사 (`getUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser`)
- 파라미터/반환 타입: Step 2의 interface 사용
- named export만
- Axios interceptor가 snake_case ↔ camelCase 자동 변환 및 query string 직렬화(`qs`)를 일괄 처리하므로, API 함수 내에서 별도 변환/직렬화 로직 추가 금지
- `URL_PREFIX`는 도메인명 기반으로 정의 (예: user 도메인 → `'/users'`, deployment 도메인 → `'/deployments'`)
- **파라미터 정의에서 `body`와 `params`를 명시적으로 구분**:
  - GET 요청: `params` 파라미터로 받아 `{ params }` 옵션 전달
  - POST/PATCH/PUT 요청: `body` 파라미터로 받아 두 번째 인자로 전달

```typescript
// 예시: src/api/admin/user.ts
import { axiosInstance } from '@/lib/axios';
import type {
  User,
  GetUsersResponse,
  GetUserListParams,
  CreateUserBody,
  UpdateUserBody,
} from '@/types/admin/user';

const URL_PREFIX = '/users';

// GET — params로 전달
export const getUserList = async (
  params: GetUserListParams
): Promise<GetUsersResponse> => {
  const { data } = await axiosInstance.get(URL_PREFIX, { params });
  return data;
};

export const getUserById = async (id: number): Promise<User> => {
  const { data } = await axiosInstance.get(`${URL_PREFIX}/${id}`);
  return data;
};

// POST — body로 전달
export const createUser = async (body: CreateUserBody): Promise<User> => {
  const { data } = await axiosInstance.post(URL_PREFIX, body);
  return data;
};

// PATCH — id + body
export const updateUser = async (
  id: number,
  body: UpdateUserBody
): Promise<User> => {
  const { data } = await axiosInstance.patch(`${URL_PREFIX}/${id}`, body);
  return data;
};

// DELETE
export const deleteUser = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${URL_PREFIX}/${id}`);
};
```

작성 후 코드 출력 및 확인 요청. **승인 전 다음 단계 금지.**

---

## Step 4 — store/ 클라이언트 상태 정의

위치: `src/store/{feature}/{domain}Atom.ts`

- feature 구분은 Step 2의 types/와 동일
- 규칙 및 예시는 @.claude/rules/state-management.md "클라이언트 상태 — Jotai" 참조
- 해당 도메인에 공유할 클라이언트 상태가 없으면 이 Step은 생략 가능

작성 후 코드 출력 및 확인 요청. **승인 전 다음 단계 금지.**

---

## Step 5 — hooks/ 작성

위치: `src/hooks/{feature}/use{Domain}Data.ts`

- feature 구분은 Step 2의 types/와 동일
- `atomWithQuery`/`atomWithMutation` 정의 규칙 및 예시는 @.claude/rules/state-management.md "API 상태 — jotai-tanstack-query" 참조

추가 규칙:
- 기존 Mock 훅의 반환 인터페이스를 최대한 유지하여 컴포넌트 변경 최소화
- isLoading, error 상태 포함

작성 후 코드 출력 및 확인 요청. **승인 전 다음 단계 금지.**

---

## Step 6 — 핸들러 훅 작성

컴포넌트에서 사용하는 이벤트 처리, 폼 유효성 검증, UI 인터랙션 로직을 핸들러 훅으로 작성한다.
핸들러 훅 규칙은 @.claude/rules/coding-standards.md 의 "hooks/ 파일 분류" 섹션을 참조.

- API 호출이 필요한 핸들러는 Step 5의 API atom을 import하여 사용
- 해당 도메인에 핸들러 훅이 필요 없으면 이 Step은 생략 가능

작성 후 코드 출력 및 확인 요청. **승인 전 다음 단계 금지.**

---

## Step 7 — 컴포넌트 연결

Mock 데이터로 구현된 컴포넌트를 실제 백엔드 API로 교체하여 연동을 완성한다.

대상 컴포넌트: Step 5, 6에서 작성한 훅을 사용하는/사용할 컴포넌트를 자동 탐색하여 목록을 출력하고, 사용자가 연결할 컴포넌트를 선택.

작업 내용:
- 하드코딩 더미 데이터 → Step 5 API atom import로 교체
- 빈 이벤트 핸들러(`() => {}`) → Step 6 핸들러 훅의 함수 연결
- isLoading → shadcn/ui Skeleton 또는 로딩 처리
- error → toast로 에러 메시지 표시
- 하드코딩 문자열 → `t()` 교체 + locale 파일에 키 추가

### atom 사용 패턴

컴포넌트에서 atom을 사용하는 패턴은 @.claude/rules/state-management.md "컴포넌트에서 atom 사용" 참조.

금지:
- 마크업/레이아웃 구조 변경
- 복합/공유 로직을 컴포넌트 안에 직접 작성 (단순 로직은 내부 OK, 기준은 @.claude/rules/coding-standards.md 참조)
- `any` 타입 사용

작성 후 변경된 부분만 diff 형태로 출력 및 최종 확인 요청.

---

## 전체 완료 체크리스트

- [ ] types/ — 타입명 PascalCase, 필드명 camelCase, `any` 없음
- [ ] types/ — 응답이 도메인 모델 그 자체면 별도 Response 미정의, 추가 필드 있을 때만 Response 정의
- [ ] api/ — `@/lib/axios` 사용, 함수명 동사+명사, URL_PREFIX 도메인명 기반
- [ ] api/ — 변환/직렬화 로직 없음 (Axios interceptor에서 일괄 처리)
- [ ] store/ — 순수 클라이언트 상태만 정의 (`atomWithQuery`/`atomWithMutation` 미포함)
- [ ] hooks/Data — `atomWithQuery`/`atomWithMutation` 정의, atom명은 API 함수명 + `Atom`
- [ ] hooks/Data — `enabled` 조건이 데이터 흐름에 맞게 설정됨
- [ ] hooks/Handler — 컴포넌트 기능 로직이 핸들러 훅으로 분리됨
- [ ] 컴포넌트 — Mock 데이터 → 실제 API atom으로 교체 완료
- [ ] 컴포넌트 — Query는 `useAtomValue`, Mutation은 `useSetAtom` 사용
- [ ] 컴포넌트 — `data`/`isLoading`/`error` 등 도메인에 맞게 이름 재정의
- [ ] 컴포넌트 — error는 toast로 처리
- [ ] 컴포넌트 — 단순 로직(UI 상태, 포맷팅, 단순 API 1회 호출)만 내부에 작성, 복합/공유 로직은 핸들러 훅으로 분리
- [ ] `any` 타입 없음
- [ ] 모든 import 경로가 `@/` 절대 경로
- [ ] `pnpm tsc --noEmit` 통과
- [ ] Mock 데이터 파일(`data/`)은 삭제하지 않음

---

## 주의사항

- 백엔드 경로를 찾을 수 없으면 사용자에게 경로를 질문
- 각 Step마다 사용자 승인을 받고 다음으로 진행 (한 번에 전부 작성하지 않음)
- 도메인 전체가 아닌 특정 API만 추가하는 경우, 기존 파일에 추가 (새 파일 생성 X)
- 핸들러 훅 규칙은 @.claude/rules/coding-standards.md 의 "hooks/ 파일 분류" 섹션 참조
- store에 공유할 클라이언트 상태가 없으면 Step 4 생략 가능
- 핸들러 훅이 불필요하면 Step 6 생략 가능
