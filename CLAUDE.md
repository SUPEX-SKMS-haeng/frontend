# 프로젝트 개요

React + TypeScript 프론트엔드. Vite + PNPM.
패키지 설치: `pnpm i {패키지명}`

## 기술 스택 요약

Jotai · jotai-tanstack-query · Axios · Tailwind CSS · shadcn/ui · lucide-react · TanStack Table · dayjs · react-i18next · Streamdown

## 절대 금지

- `useQuery`/`useMutation` 직접 사용 금지 → `atomWithQuery`/`atomWithMutation` 사용
- `any` 타입 금지
- 하드코딩 문자열 금지 → `t()` 사용
- 상대경로 import 금지 → `@/` 절대경로 사용
- snake_case 필드 직접 사용 금지 → Axios interceptor에서 camelCase 변환
- `main`, `develop` 브랜치 직접 커밋 금지 → 반드시 feature 브랜치에서 작업

## 핵심 규칙

- 함수형 컴포넌트 + 화살표 함수만 사용
- Props와 데이터 모델은 `interface` 선호
- 네이밍: 컴포넌트·파일명 `PascalCase`, 훅·유틸·변수명 `camelCase`
- 컴포넌트는 UI 렌더링만, 비즈니스 로직은 `hooks/`로 분리
- 전역 상태는 `store/`에 Jotai atom, 단일 컴포넌트 전용은 `useState`
- 현재 Mock 데이터만 사용 (`src/data/`), 로딩·에러 상태 시뮬레이션 필수

## 백엔드 연동 정보

- 백엔드 루트: `../backend`
- 라우터: `app/routers/`
- 스키마: `app/schemas/`
- 모델: `app/models/`
- API prefix: `/api/v1`

## 참조 문서

- 코딩 표준 / 디렉토리 구조 @.claude/rules/coding-standards.md
- 상태 관리 패턴 @.claude/rules/state-management.md
- Git 컨벤션 @.claude/rules/git-convention.md
- 에이전트 팀 운영 @.claude/rules/agent-workflow.md
