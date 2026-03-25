# GitHub PR 작성

현재 브랜치의 변경사항을 분석하여 GitHub PR을 생성한다.
**모든 내용은 한글로 작성**한다.

## 사용법

`/pr` — 자동 분석 후 PR 생성
`/pr $ARGUMENTS` — 추가 컨텍스트 전달 (예: "채팅 목록 페이지 구현")

## 실행 순서

1. **브랜치 확인** (`git branch --show-current`)
   - main/develop 브랜치면 중단하고 경고

2. **base 브랜치 확인** (기본: main)

3. **변경사항 파악**
   - `git log base..HEAD` 로 커밋 목록 확인
   - `git diff base...HEAD` 로 전체 변경 내용 파악

4. **PR 제목 결정**
   - 형식: `[영역] 타입: 제목 요약`
   - 영역: 변경된 파일 경로에서 도메인 추출 (예: `chat`, `auth`, `layout`)
     - 여러 도메인이 변경된 경우: `[chat,auth]` 형식
     - 도메인 특정이 어려운 경우: `[common]` 사용
   - 타입:
     - `feat`: 새로운 기능 추가
     - `fix`: 버그 수정
     - `refactor`: 코드 리팩토링 (기능 변경 없음)
     - `perf`: 성능 개선
     - `docs`: 문서 수정
     - `style`: 코드 포맷팅
     - `test`: 테스트 코드 추가/수정
     - `chore`: 빌드, 패키지 설정 등
     - `hotfix`: 긴급 버그 수정
   - 커밋 메시지 키워드를 분석하여 가장 대표적인 타입 선택
   - 예시: `[chat] feat: 채팅방 목록 및 메시지 UI 구현`

5. **PR 본문 초안 작성** (아래 포맷 사용)

6. **초안 출력 후 사용자 확인** — 수정 요청 반영

7. **PR 생성**
   - `gh` CLI가 설치되어 있으면: `gh pr create`로 직접 생성
   - `gh` CLI가 없으면: 제목과 본문을 복사 가능한 형태로 출력하고, GitHub 웹에서 PR 생성 페이지 URL을 안내
     - URL 형식: `https://github.com/{owner}/{repo}/compare/{base}...{branch}?expand=1`

---

## PR 본문 포맷

```
## 개요
{변경사항 한 줄 요약}

## 주요 변경 내용
- {주요 변경사항 1}
- {주요 변경사항 2}

## 구현 상세
{핵심 구현 결정사항, 아키텍처 변경, 의존성 추가/변경 등 특이사항}

## 기타
- {그 외 부수적인 변경 사항}

## 스크린샷
> 해당 시 첨부

## 체크리스트
- [ ] 기능 동작 확인
- [ ] 콘솔 에러 없음
- [ ] TypeScript 타입 오류 없음 (`pnpm tsc --noEmit`)
- [ ] i18n 키 누락 없음
- [ ] 불필요한 console.log 제거
- [ ] Breaking changes 여부 확인

## 관련 이슈
Closes #{ticket-id}
```
