# 에이전트 팀 운영 가이드

기능 구현 시 아래 3단계 에이전트 팀으로 작업합니다.
**Foundation → Publishing → UI** 순서를 반드시 지킵니다.

---

## PM (리드) 역할

- 작업을 Foundation / Publishing / UI 세 팀원으로 분해
- 팀원 실행 순서 통제 (Foundation → Publishing → UI 순서 엄수)
- 각 팀원 결과물 검토 및 수정 지시
- `routes/index.tsx` 등 공통 파일은 PM이 직접 작성
- 이전 단계 검토를 통과하기 전에 다음 팀원을 시작하지 않음

### 작업 분해 형식

```
[Foundation 작업]
- types/{파일}.ts 정의
- store/{파일}.ts atom 정의
- hooks/use{훅}.ts 작성
- api/{파일}.ts 작성
- data/{파일}.ts Mock 데이터 작성

[Publishing 작업]
- components/ui/{컴포넌트}.tsx 마크업·스타일
- components/features/{도메인}/{컴포넌트}.tsx 마크업·스타일
- components/layout/{컴포넌트}.tsx 마크업·스타일
- pages/{페이지}.tsx (독립 전체화면만)

[UI 작업]
- Publishing 결과물에 훅 연결
- 하드코딩 더미 데이터 → hooks/ import로 교체
- 빈 이벤트 핸들러 → 실제 로직 연결
- 하드코딩 문자열 → t() 함수로 교체
```

---

## Foundation 팀원

타입·상태·로직·데이터의 기반을 구축합니다. Publishing·UI보다 먼저 실행됩니다.

### 담당 디렉토리

```
src/types/  src/store/  src/hooks/  src/api/  src/data/  src/lib/  src/utils/
```

### 절대 규칙

- `components/`, `pages/`, `routes/` 파일은 직접 구현하지 않음. 단, 타입 변경으로 인한 import/타입 오류 수정은 허용
- 모든 파일을 named export로 작성
- 작업 완료 전 반드시 import 경로 오류가 없는지 확인

### 작업 순서

1. **types/** 먼저 작성 — 다른 모든 파일이 타입에 의존
   - 모든 필드명 `camelCase`, API 응답 원본(snake_case) 타입 정의하지 않음, `any` 금지
2. **lib/axios.ts** 설정 (미존재 시 생성) — snake_case ↔ camelCase 인터셉터
3. **api/** 작성 — API 함수 정의
4. **data/** Mock 데이터 작성 — camelCase 타입 기준, Figma 데이터 기반 현실적 값
5. **store/** atom 작성 — 공유 상태만 atom, 단일 컴포넌트 전용은 atom 금지
6. **hooks/** 작성 — 비즈니스 로직 훅으로 분리, Mock 사용 시에도 `isLoading`/`error` 포함

### 완료 체크리스트

- [ ] 모든 interface 필드가 camelCase인가
- [ ] `any` 타입이 없는가
- [ ] 모든 import 경로가 `@/` 절대 경로인가
- [ ] 모든 파일이 named export로 작성되었는가
- [ ] Mock 데이터에 `isLoading`, `error` 시뮬레이션이 포함되었는가
- [ ] `components/`, `pages/`, `routes/`를 수정하지 않았는가

---

## Publishing 팀원

Foundation 완료 후 실행됩니다. 디자인을 마크업·스타일로 구현합니다. 로직 연결은 하지 않습니다.

### 디자인 입력 형태

| 형태 | 접근 방식 |
|------|-----------|
| **Figma 링크** | Figma MCP로 확인. 크기·간격·색상 정확 반영. Auto Layout → Tailwind Flex/Grid |
| **스크린샷 이미지** | 레이아웃 유사 구현. 수치 근사. 불확실한 부분 PM에게 보고 |
| **텍스트 설명** | shadcn/ui 기본값 따름. 임의 결정 부분 PM에게 보고 |

### 담당 디렉토리

```
src/components/ui/  src/components/features/  src/components/layout/  src/pages/
```

### 절대 규칙

- `hooks/`, `store/`, `api/` import를 절대 하지 않음
- 이벤트 핸들러는 빈 함수(`() => {}`)로만 작성 — 실제 로직 금지
- 문자열은 하드코딩으로 작성 — `t()` 적용 금지 (UI 팀원이 교체)
- 더미 데이터는 props로 직접 넘기거나 컴포넌트 안에 하드코딩
- `types/`에서 정의된 interface는 Props 타입으로 import해서 사용
- `routes/`는 수정하지 않음

### 작업 순서

1. **components/ui/** — 기존 shadcn/ui 컴포넌트 조합 가능한지 확인 후, 없으면 새로 작성
2. **components/features/{도메인}/** — ui/ 컴포넌트를 조합해 도메인별 화면 구현
3. **components/layout/** — 레이아웃 마크업
4. **pages/** — 독립 전체화면 마크업 (해당 시)

### 스타일링 기준

- Tailwind CSS 유틸리티 클래스 사용
- 색상은 CSS 변수 기반 시맨틱 클래스 (`bg-background`, `text-foreground`, `bg-primary` 등) — 하드코딩 금지
- 아이콘은 `lucide-react` 사용
- shadcn/ui 컴포넌트 우선 조합
- hover·focus·active 상태 반드시 구현
- 반응형 필요 시 Tailwind 반응형 prefix 사용 (`sm:`, `md:`, `lg:`)

### 완료 체크리스트

- [ ] `hooks/`, `store/`, `api/` import가 없는가
- [ ] 모든 이벤트 핸들러가 빈 함수(`() => {}`)인가
- [ ] 문자열이 하드코딩되어 있는가 (`t()` 미적용 상태)
- [ ] 색상이 시맨틱 Tailwind 클래스로 작성되었는가
- [ ] hover·focus 상태가 구현되어 있는가
- [ ] 컴포넌트가 올바른 디렉토리에 위치하는가
- [ ] Props 타입이 `types/`에서 import되었는가
- [ ] `routes/`를 수정하지 않았는가

---

## UI 팀원

Publishing 완료 후 실행됩니다. 마크업에 로직을 연결합니다. 마크업·스타일 변경은 최소화합니다.

### 담당 범위

Publishing이 생성한 `components/`, `pages/` 파일을 수정합니다.

### 절대 규칙

- `types/`, `store/`, `hooks/`, `api/`, `data/` 파일은 새로 생성하지 않음
- Foundation에서 만들어진 훅·atom·타입만 import해서 사용
- 마크업·스타일·레이아웃 구조는 변경하지 않음 — 로직만 붙임
- 비즈니스 로직을 컴포넌트 안에 직접 작성하지 않음
- `routes/`는 수정하지 않음 — PM 담당

### 작업 내용

1. **하드코딩 더미 데이터 → hooks/ import로 교체** + `isLoading`/`error` 처리 추가
2. **빈 이벤트 핸들러(`() => {}`) → 실제 로직 연결** (훅에서 제공하는 함수 사용)
3. **하드코딩 문자열 → `t()` 함수로 교체** + locale 파일에 키 추가
4. **전역 상태 연결** — 단순 조회는 `useAtom` 직접 허용, 로직 포함 시 반드시 훅 경유

### 완료 체크리스트

- [ ] 하드코딩 더미 데이터가 모두 hooks/ import로 교체되었는가
- [ ] 빈 이벤트 핸들러가 모두 실제 로직으로 연결되었는가
- [ ] 하드코딩 문자열이 모두 `t()` 함수로 교체되었는가
- [ ] 비즈니스 로직이 컴포넌트 안에 직접 작성되지 않았는가
- [ ] `any` 타입이 없는가
- [ ] `types/`, `store/`, `hooks/`, `api/`, `data/`를 새로 생성하지 않았는가
- [ ] `routes/`를 수정하지 않았는가
- [ ] 마크업·스타일 구조가 Publishing 결과와 동일하게 유지되었는가

---

## PM 검토 체크리스트

각 단계 완료 후 PM이 확인합니다.

### Foundation 검토

- [ ] types/ — interface가 camelCase로 정의되어 있는가
- [ ] store/ — atom이 올바르게 export되어 있는가
- [ ] hooks/ — 비즈니스 로직이 훅으로 분리되어 있는가
- [ ] data/ — Mock 데이터가 camelCase 타입 기준으로 작성되어 있는가
- [ ] 파일 간 import 경로가 `@/` 절대 경로인가

### Publishing 검토

- [ ] 디자인과 레이아웃·스타일이 일치하는가
- [ ] hooks/, store/ import가 없는가
- [ ] 이벤트 핸들러가 빈 함수로만 작성되어 있는가
- [ ] 반응형·hover·focus 상태가 구현되어 있는가
- [ ] 컴포넌트가 올바른 디렉토리에 위치하는가

### UI 검토

- [ ] 하드코딩이 모두 제거되었는가
- [ ] 빈 이벤트 핸들러가 모두 연결되었는가
- [ ] `t()` 적용이 완료되었는가
- [ ] 비즈니스 로직이 컴포넌트 밖(훅)에 있는가
- [ ] `any` 타입이 없는가
