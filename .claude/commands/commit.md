# Git Commit

변경사항을 분석하고 컨벤션에 맞는 커밋 메시지를 작성한 뒤 커밋한다.
**커밋 메시지는 한글로 작성**한다.

## 사용법

`/commit` — 자동 분석 후 커밋
`/commit $ARGUMENTS` — 추가 컨텍스트 전달 (예: "채팅 입력 컴포넌트 분리")

## 실행 순서

### 1. 현재 상태 파악

아래 명령어를 병렬 실행:
- `git status` — 변경 파일 목록
- `git diff` — unstaged 변경 내용
- `git diff --cached` — staged 변경 내용
- `git branch --show-current` — 현재 브랜치

### 2. 안전 체크

아래 중 하나라도 해당되면 **즉시 중단하고 경고**:
- 현재 브랜치가 `main` 또는 `develop`
- 변경 파일 중 `.env`, `*.local`, `*secret*`, `*credential*` 포함
- 변경 파일 중 `package-lock.json`, `pnpm-lock.yaml` 만 단독 변경 (의도 확인 필요)

### 3. 스테이징

- 이미 staged 파일이 있으면 그대로 사용
- staged 파일이 없으면 변경 파일 목록을 보여주고, 전체 또는 선택 스테이징을 사용자에게 확인
- `.env`, `*.local` 등 민감 파일은 스테이징에서 자동 제외

### 4. 커밋 메시지 작성

#### 포맷
```
{type}: {작업 내용} ({ticket-id})
```

#### ticket-id 추출
- 브랜치명에서 추출 (예: `feat/FE-123-user-profile` → `FE-123`)
- 추출 불가 시 ticket-id 및 괄호 생략

#### type 판단 기준
| type | 기준 |
|------|------|
| `feat` | 새 파일 추가, 새 기능 구현 |
| `fix` | 버그 수정, 오류 해결 |
| `refactor` | 동작 변경 없는 코드 개선 |
| `style` | 마크업/CSS/포맷팅만 변경 |
| `chore` | 설정, 패키지, 빌드 변경 |
| `docs` | 문서만 변경 |

#### 작성 기준
- 한국어로 작성
- "무엇을"이 아닌 "왜/어떤 목적"에 초점
- 한 줄, 50자 이내 권장
- 변경 범위가 넓으면 본문에 bullet으로 상세 내역 추가

#### 예시
```
feat: 채팅 메시지 컴포넌트 구현 (FE-42)
fix: LNB 채팅방 목록 정렬 오류 수정 (FE-58)
refactor: useChat 훅에서 메시지 필터링 로직 분리
chore: dayjs 의존성 추가
```

### 5. 사용자 확인 후 커밋

- 작성한 커밋 메시지를 출력하고 사용자 승인 후 커밋 실행
- 커밋 실행 후 `git status`로 결과 확인
- pre-commit hook 실패 시: 원인 파악 → 수정 → 새 커밋 생성 (amend 금지)
