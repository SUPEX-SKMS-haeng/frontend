# agent-template-apps-frontend

React + TypeScript 기반 프론트엔드 애플리케이션

## 기술 스택

React 19 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Jotai · jotai-tanstack-query · Axios · react-i18next · lucide-react · Streamdown

## 시작하기

### 사전 요구사항

- Node.js 18+
- pnpm

### 설치 및 실행

```bash
# 패키지 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 빌드 미리보기
pnpm preview

# 린트
pnpm lint
```

## 상세 문서

| 문서 | 설명 |
|------|------|
| [CLAUDE.md](./CLAUDE.md) | 프로젝트 개요 및 핵심 규칙 |
| [코딩 표준 / 디렉토리 구조](./.claude/rules/coding-standards.md) | 디렉토리 구조, 네이밍, 컴포넌트 책임 분리, Mock 데이터 규칙 |
| [상태 관리 패턴](./.claude/rules/state-management.md) | Jotai 클라이언트 상태, jotai-tanstack-query API 상태 패턴 |
| [Git 컨벤션](./.claude/rules/git-convention.md) | 브랜치 네이밍, 커밋 메시지 포맷 |
| [에이전트 워크플로우](./.claude/rules/agent-workflow.md) | Foundation → Publishing → UI 3단계 작업 프로세스 |
