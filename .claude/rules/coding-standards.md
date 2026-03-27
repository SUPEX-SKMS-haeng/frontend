# 코딩 표준 / 디렉토리 구조

## 디렉토리 구조

```
src/
  api/              # API 함수
    {도메인}/       # chat/ | admin/ | auth/ 등
  assets/           # 정적 자원 (이미지, 아이콘, 폰트 등)
  components/
    layout/         # LNB, Sidebar 등 레이아웃 컴포넌트
      {도메인}/     # chat/ | admin/ 등
    ui/             # 기능 무관 순수 기초 컴포넌트 (shadcn/ui 기반, 여러 feature 공통 사용)
    features/       # 도메인별 핵심 컴포넌트
      {도메인}/     # chat/ | admin/ | auth/ 등
  data/             # Mock 데이터 (API 연동 전 개발 단계용)
  hooks/            # 커스텀 훅
    {도메인}/       # chat/ | admin/ | auth/ 등
    common/         # 도메인 공통 훅 (useAxiosInterceptor.ts, useFetchInterceptor.ts 등 — case 변환, params 직렬화, 공통 에러 처리, Authorization 헤더 설정)
  lib/              # 외부 라이브러리 설정 및 래퍼 (axios.ts — axiosInstance 공통 사용, queryClient.ts 등)
  locale/           # react-i18next 언어 설정
  pages/            # 독립 전체화면 페이지만 (404, 403, 500 등)
  routes/           # React Router 라우트 정의
  store/            # Jotai atom 정의
    {도메인}/       # chat/ | admin/ | auth/ 등
    common/         # 도메인 공통 atom
  types/            # 도메인별 타입 정의
    {도메인}/       # chat/ | admin/ | auth/ 등
    common/         # 여러 도메인 공통 타입 (Pagination 등)
  utils/            # 유틸리티 함수
```

### 컴포넌트 위치 판단 기준

- `components/ui/` — 기능과 무관한 순수 UI 컴포넌트 (Modal 껍데기 등)
- `components/layout/{도메인}/` — 도메인별 레이아웃 셸. 도메인마다 LNB, TopBar, Sidebar 등 구성이 다르므로 각 도메인 폴더에서 독립적으로 정의 (예: chat은 LNB + 채팅 영역, admin은 TopBar + LNB + 콘텐츠 영역)
- `components/features/{도메인}/` — ui/ 컴포넌트를 조합해 특정 도메인 기능을 구현
- `pages/` — 레이아웃 밖에서 단독 렌더링되는 독립 전체화면 페이지만

---

## 코딩 표준

- **문법**: 화살표 함수만 사용
- **TypeScript**: strict 모드 준수. `any` 사용 금지. Props와 데이터 모델은 `interface` 선호
- **네이밍**: 컴포넌트·파일명은 `PascalCase`, 훅·유틸·변수명은 `camelCase`
- **Import**: 절대 경로(`@/`) 사용 — 상대 경로 import 금지
- **Import 순서**: ① 표준 라이브러리 → ② 서드파티 패키지 → ③ 로컬 모듈(`@/`)

### 타입 정의 규칙

- 위치: `src/types/{도메인}/{domain}.ts` — 여러 도메인 공통 타입은 `src/types/common/`
- 타입/인터페이스 이름은 `PascalCase`, 필드명은 `camelCase` (snake_case 원본 타입 정의 금지)
- **도메인 모델 우선 정의** (`User`, `Chat` 등) → Response/Request 타입에서 참조
- **Response**: 응답이 도메인 모델 그 자체면 별도 Response 타입 미정의. 페이지네이션 등 추가 필드가 있을 때만 정의 (예: `GetUsersResponse { users: User[]; totalCount: number; }`)
- **Request body**: `{Action}{Domain}Body` (예: `CreateUserBody`, `UpdateUserBody`)
- **Request params**: `{Action}{Domain}Params` (예: `GetUserListParams`, `SearchUserParams`)
- Pagination 등 공통 구조는 제네릭 활용 (`src/types/common/`에 배치)
- named export만

### API 호출 패턴

- `@/lib/axios`의 `axiosInstance` 사용 필수 — 직접 `axios` import 금지
- 위치: `src/api/{도메인}/{domain}.ts`
- 함수명: 동사+명사 (`getUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser`)
- `URL_PREFIX`는 도메인명 기반으로 정의 (예: `'/users'`, `'/deployments'`)
- **`body` vs `params` 명시적 구분**:
  - GET 요청: `params` 파라미터로 받아 `{ params }` 옵션 전달
  - POST/PATCH/PUT 요청: `body` 파라미터로 받아 두 번째 인자로 전달
- API 함수 내 변환/직렬화 로직 금지 — Axios interceptor(`hooks/common/useAxiosInterceptor.ts`)에서 snake_case ↔ camelCase 변환 및 `qs` 직렬화를 일괄 처리
- named export만

### 컴포넌트 규칙

- 함수형 컴포넌트만 사용 — 클래스 컴포넌트 금지
- Props는 해당 컴포넌트 파일 상단에 `interface`로 선언, 이름은 `{컴포넌트명}Props` (예: `ChatBubbleProps`)
- 파일당 하나의 `export default` 컴포넌트
- `useEffect`에 cleanup 함수 빠뜨리지 않기 (타이머, 구독, 이벤트 리스너 등 해제 필수)

### 스타일링 규칙

- **Tailwind CSS** 전용 — 인라인 `style` 금지
- 글로벌 CSS는 `src/index.css`에서만 정의
- 컴포넌트별 CSS 파일 생성 금지 — Tailwind 유틸리티 클래스 사용
- 색상은 CSS 변수 기반 시맨틱 클래스 사용 (`bg-background`, `text-foreground`, `bg-primary` 등) — 하드코딩 색상값 금지
- 반응형: Tailwind 브레이크포인트 (`sm:`, `md:`, `lg:`) 사용

### 다국어 (i18n) 규칙

- 설정: `src/locale/config.ts`
- UI 텍스트 하드코딩 금지 — locale 파일에 키 정의 후 `t()` 함수로 참조
- 에러 메시지: 백엔드에서 한국어로 반환되므로 그대로 표시 가능 (간혹 예외 있음)

### 컴포넌트 책임 분리

| 레이어        | 역할                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------- |
| `api/`        | 순수 API 함수만. `axiosInstance`로 HTTP 요청 수행, 비즈니스 로직 없음                     |
| `store/`      | 순수 클라이언트 상태만 (선택된 항목, 필터 조건, UI 상태 등). `atomWithQuery`/`atomWithMutation`은 여기서 정의하지 않음 |
| `hooks/`      | 비즈니스 로직. `atomWithQuery`/`atomWithMutation` 정의, 데이터 가공, 파생 상태, 이벤트 처리 |
| `components/` | UI 렌더링만. Query는 `useAtomValue`, Mutation은 `useSetAtom`으로 훅의 atom을 소비. 조건부 렌더링·이벤트 핸들러 연결 정도만 포함 |

> 상태 관리 상세 패턴(Jotai atom, jotai-tanstack-query)은 @.claude/rules/state-management.md 참조

### hooks/ 파일 분류

| 파일 패턴 | 역할 | 예시 |
|-----------|------|------|
| `use{Domain}Data.ts` | API 데이터 조회/변경 atom 정의 (`atomWithQuery`/`atomWithMutation`) | `useUserData.ts`, `useChatData.ts` |
| `use{Domain}Handler.ts` 또는 `use{기능명}Handler.ts` | 컴포넌트에서 사용하는 기능 로직 (이벤트 처리, 유효성 검증, 데이터 가공 등) | `useUserTableHandler.ts`, `useFileUploadHandler.ts`, `useChatSendHandler.ts` |

**컴포넌트 내부 vs 핸들러 훅 분리 기준:**

| 컴포넌트 내부 OK | 핸들러 훅으로 분리 |
|---|---|
| 단순 UI 상태 (`useState`로 open/close, 입력값 등) | 여러 컴포넌트에서 공유하는 로직 |
| 단순 포맷팅/문자열 조합 | 여러 API를 조합하거나 순차 호출하는 로직 |
| API 호출이 단순 1회 호출 + toast 수준 | 유효성 검증 + 데이터 가공 + API 호출이 결합된 복합 로직 |
| | 조건 분기가 많은 이벤트 처리 |

> 원칙: **단일 컴포넌트 전용 + 로직이 단순하면 내부, 공유되거나 복합적이면 훅으로 분리**

**핸들러 훅 규칙:**
- 위치: `src/hooks/{도메인}/use{Domain}Handler.ts` 또는 `use{기능명}Handler.ts`
- 컴포넌트의 복합 이벤트 처리, 폼 유효성 검증, 공유 로직 등을 함수로 제공
- API 호출이 필요한 경우 `use{Domain}Data.ts`의 API atom을 import하여 사용
- named export만
- 핸들러 훅에서 API atom을 소비하는 패턴 및 예시는 @.claude/rules/state-management.md "핸들러 훅에서 API atom 소비" 참조

---

## 라우트 구조

```tsx
// routes/ — Layout + feature 컴포넌트 직접 조합
<Route
  path="/"
  element={
    <ProtectedRoute>
      <ChatLayout>
        <Outlet />
      </ChatLayout>
    </ProtectedRoute>
  }
>
  <Route index element={<Chat />} />
  <Route path="chat" element={<Chat />} />
  <Route path="chat/:chatId" element={<Chat />} />
</Route>

// pages/ — 독립 전체화면만
<Route path="*" element={<NotFoundPage />} />
<Route path="/403" element={<ForbiddenPage />} />
```

---

## 데이터 변환 규칙

- 백엔드 API 응답: `snake_case` → 프론트엔드 모델: `camelCase` (snake_case 직접 사용 금지)
- 변환 주체: `hooks/common/useAxiosInterceptor.ts`에서 Axios interceptor로 전역 처리
  - 응답: snake_case → camelCase 자동 변환
  - 요청 페이로드(POST/PATCH/PUT): camelCase → snake_case 자동 재변환
  - 요청 params: `qs` 직렬화 일괄 처리
- API 함수(`api/`)에서 별도 변환/직렬화 로직 추가 금지 — interceptor가 일괄 처리
- API 응답 원본(snake_case) 타입은 별도 정의하지 않음 — camelCase 타입만 정의 (`types/{도메인}/`)

---

## 워크플로우 제약

- 새 UI 컴포넌트 작성 시 `components/ui/` 기초 컴포넌트를 먼저 조합
- 기존 폴더 구조와 네이밍 규칙 절대 변경 금지
- 일반 화면 추가 → `components/features/{도메인}/`에 작성 후 `routes/`에서 Layout과 조합
- `pages/`에는 독립 전체화면 페이지만 추가
- API 연동 시 Foundation → UI 순서 준수 (types → api → store → hooks → 컴포넌트 연결)

---

## Mock 데이터 규칙

- 현재는 **Mock 데이터만 사용** (실제 API 연동 불필요)
- 위치: `src/data/`
- 형식: camelCase 프론트엔드 타입 기준으로 작성 (이미 변환된 상태)
- Mock 데이터 사용 시에도 로딩·에러 상태를 실제 API처럼 시뮬레이션
- API 연동 완료 후에도 Mock 데이터 파일(`data/`)은 삭제하지 않음
