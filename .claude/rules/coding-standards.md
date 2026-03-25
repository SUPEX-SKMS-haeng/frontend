# 코딩 표준 / 디렉토리 구조

## 디렉토리 구조

```
src/
  api/              # API 함수
  assets/           # 정적 자원 (이미지, 아이콘, 폰트 등)
  components/
    layout/         # LNB, Sidebar 등 레이아웃 컴포넌트
    ui/             # 기능 무관 순수 기초 컴포넌트 (shadcn/ui 기반, 여러 feature 공통 사용)
    features/       # 도메인별 핵심 컴포넌트
      {도메인}/     # chat | admin | auth 등
  data/             # Mock 데이터 (API 연동 전 개발 단계용)
  hooks/            # 커스텀 훅
  lib/              # 외부 라이브러리 설정 및 래퍼
  locale/           # react-i18next 언어 설정
  pages/            # 독립 전체화면 페이지만 (404, 403, 500 등)
  routes/           # React Router 라우트 정의
  store/            # Jotai atom 정의
  types/            # 도메인별 타입 정의
  utils/            # 유틸리티 함수
```

### 컴포넌트 위치 판단 기준

- `components/ui/` — 기능과 무관한 순수 UI 컴포넌트 (Modal 껍데기 등)
- `components/features/{도메인}/` — ui/ 컴포넌트를 조합해 특정 도메인 기능을 구현
- `pages/` — 레이아웃 밖에서 단독 렌더링되는 독립 전체화면 페이지만

---

## 코딩 표준

- **문법**: 함수형 컴포넌트 + 화살표 함수만 사용
- **TypeScript**: strict 모드 준수. `any` 사용 금지. Props와 데이터 모델은 `interface` 선호
- **네이밍**: 컴포넌트·파일명은 `PascalCase`, 훅·유틸·변수명은 `camelCase`
- **Import**: 절대 경로(`@/`) 사용 — 상대 경로 import 금지
- **Import 순서**: ① 표준 라이브러리 → ② 서드파티 패키지 → ③ 로컬 모듈(`@/`)

### 컴포넌트 책임 분리

| 레이어        | 역할                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------- |
| `components/` | UI 렌더링만. 조건부 렌더링·이벤트 핸들러 연결 정도만 포함                                 |
| `hooks/`      | 비즈니스 로직. API 호출, 데이터 가공, 파생 상태, 사용자 인터랙션                          |
| `store/`      | 전역 상태. 여러 컴포넌트·훅이 공유하는 Jotai atom만. 단일 컴포넌트 전용 상태는 `useState` |

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

- 백엔드 API 응답: `snake_case`
- 프론트엔드 모델: `camelCase` (반드시 변환, snake_case 직접 사용 금지)
- 변환 위치: Axios 응답 interceptor에서 전역 처리
- 요청 페이로드(POST/PATCH): 전송 전 camelCase → snake_case 재변환
- API 응답 원본(snake_case) 타입은 별도 정의하지 않음. camelCase 타입만 정의

---

## 워크플로우 제약

- 새 UI 컴포넌트 작성 시 `components/ui/` 기초 컴포넌트를 먼저 조합
- 기존 폴더 구조와 네이밍 규칙 절대 변경 금지
- 일반 화면 추가 → `components/features/{도메인}/`에 작성 후 `routes/`에서 Layout과 조합
- `pages/`에는 독립 전체화면 페이지만 추가

---

## Mock 데이터 규칙

- 현재는 **Mock 데이터만 사용** (실제 API 연동 불필요)
- 위치: `src/data/`
- 형식: camelCase 프론트엔드 타입 기준으로 작성 (이미 변환된 상태)
- Figma 디자인에 표시된 데이터를 기반으로 작성
- Mock 데이터 사용 시에도 로딩·에러 상태를 실제 API처럼 시뮬레이션
