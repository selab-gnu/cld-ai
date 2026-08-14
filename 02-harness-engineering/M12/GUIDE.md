# 개념

`prd.json`에 여러 작업(user story) 추가하고, 작게 쪼개기를 실행합니다. 이 때, `ralph` 스킬이 1차 변환을 해주지만, **실제로 여러 작업을 우선순위대로 처리시키려면 각 story가 "한 번에 끝낼 수 있는 크기"인지 직접 검토·조정**해야 합니다.

`prd.json`에 포함되는 필드의 형태는 다음과 같다.

| 필드 | 설명 |
|---|---|
| `id` | 고유 식별자 (`US-001`, `US-002`, ...) |
| `title` | 짧은 제목 |
| `description` | "As a ..., I want ... so that ..." 형식의 사용자 스토리 |
| `acceptanceCriteria` | **검증 가능한** 완료 조건 목록. 타입체크·테스트 통과, 브라우저 검증 등 |
| `priority` | 처리 순서 (숫자가 작을수록 먼저 처리) |
| `passes` | 완료 여부. 새 작업은 항상 `false`로 시작 |
| `notes` | Ralph가 실행하며 남기는 메모 (처음엔 빈 문자열) |

## 작업을 쪼개는 규칙 (가장 중요)

Ralph의 각 iteration은 **완전히 새로운(맥락 없는) AI 인스턴스**로 시작됩니다. 작업이 하나의 context window 안에서 끝나지 않으면, AI가 컨텍스트를 다 쓰기 전에 마무리하지 못해 코드 품질이 나빠집니다.

**적절한 크기 (Good)**
- DB 컬럼 하나 + 마이그레이션 추가
- 기존 페이지에 UI 컴포넌트 하나 추가
- 서버 액션 하나에 로직 추가
- 리스트에 필터 드롭다운 추가

**너무 큰 크기 (Bad — 반드시 쪼갤 것)**
- "대시보드 전체 만들기"
- "인증 기능 추가"
- "API 리팩토링"

쪼개는 요령:
1. 하나의 story = 하나의 화면 요소, 하나의 API 엔드포인트, 하나의 DB 변경 등 **단일 책임**으로 제한
2. "그리고(and)"가 두 번 이상 들어가는 설명이면 대부분 쪼갤 수 있는 신호
3. DB → 백엔드 로직 → UI 표시 → UI 상호작용 순으로 계층별로 쪼개면 자연스럽게 작아짐 (위 예제의 US-001~US-004가 정확히 이 패턴)
4. 프론트엔드(UI) 작업의 acceptance criteria에는 `"Verify in browser using dev-browser skill"`을 반드시 포함 — Ralph가 실제로 브라우저에서 동작을 확인하게 만드는 문구입니다.

## Ralph가 반복하는 과정
1. PRD의 `branchName`으로 feature 브랜치 생성
2. `passes: false`인 story 중 `priority`가 가장 높은(숫자가 낮은) 것을 선택
3. 해당 story 하나만 구현
4. 품질 체크(typecheck, 테스트) 실행
5. 통과하면 커밋
6. `prd.json`에서 해당 story를 `passes: true`로 갱신
7. `progress.txt`에 학습 내용 기록
8. 모든 story가 `passes: true`가 되거나 최대 iteration에 도달할 때까지 반복

## 전체 흐름 요약

1. `prd`, `ralph` 스킬을 전역 설치 (한 번만)
2. 프로젝트에 `ralph.sh` + `CLAUDE.md` 복사 (프로젝트마다)
3. `prd` 스킬로 PRD 작성 요청 → `tasks/prd-*.md` 생성
4. `ralph` 스킬로 `prd.json`으로 변환
5. **`prd.json`의 각 story를 "한 번에 끝낼 수 있는 크기"로 직접 검토·쪼개기** ← 성공의 핵심
6. `./scripts/ralph/ralph.sh --tool claude [N]` 실행
7. `prd.json`, `progress.txt`, git log로 진행 확인, 실패 시 story를 더 쪼개서 재실행

# 0 단계: 사전 준비

- [ ] Amp CLI 또는 Claude Code(`npm install -g @anthropic-ai/claude-code`)가 설치·인증되어 있음
- [ ] `jq`가 설치되어 있음 (`brew install jq`)
- [ ] 작업할 프로젝트가 git 저장소로 초기화되어 있음 (`git init` 완료, 커밋 가능한 상태)
- [ ] 이미 작은 예제로 Ralph를 1회 이상 돌려본 경험이 있음 (사용자 확인됨)

# 1 단계: `prd`, `ralph` 스킬을 전역으로 설치하기

이미 아래 명령어를 실행하려는 상태이므로, 그대로 진행하면 됩니다.

```bash
cp -r /tmp/ralph/skills/prd ~/.claude/skills/
cp -r /tmp/ralph/skills/ralph ~/.claude/skills/
```

## 규칙
> 참고: 저장소 README 기준 공식 경로는 `skills/prd`, `skills/ralph`(저장소 루트 기준)입니다. `/tmp/ralph`는 저장소를 clone한 위치이므로, 실제로는 본인이 `git clone https://github.com/snarktank/ralph /tmp/ralph`으로 받아둔 경로와 일치해야 합니다.
> 이 스킬들은 **프로젝트별이 아니라 전역(`~/.claude/skills/`)**으로 설치됩니다. 즉 한 번 설치하면 이후 모든 프로젝트에서 재사용 가능합니다.
> Claude Code 마켓플레이스 방식(`/plugin marketplace add snarktank/ralph` → `/plugin install ralph-skills@ralph-marketplace`)을 쓴다면 이 수동 복사는 생략해도 됩니다. 둘 중 하나만 하면 됩니다.

## 산출물
- `~/.claude/skills/prd/`
- `~/.claude/skills/ralph/`

## 체크리스트
- [ ] `ls ~/.claude/skills/` 실행 시 `prd`, `ralph` 폴더가 보임
- [ ] Claude Code를 새로 열었을 때 "create a prd" 같은 표현에 스킬이 자동으로 반응함 (또는 `/prd` 커맨드 사용 가능)

# 2 단계: 작업할 프로젝트에 Ralph 실행 파일 복사하기

전역 스킬(PRD 작성용)과 별개로, **실행 루프 자체**는 프로젝트 폴더 안에 있어야 합니다.

```bash
# 실제로 작업할 프로젝트 루트에서 실행
cd /path/to/your-project
mkdir -p scripts/ralph
cp /tmp/ralph/ralph.sh scripts/ralph/

# Claude Code를 쓴다면:
cp /tmp/ralph/CLAUDE.md scripts/ralph/CLAUDE.md

chmod +x scripts/ralph/ralph.sh
```

## 산출물
- `scripts/ralph/ralph.sh`
- `scripts/ralph/CLAUDE.md` (Claude Code용 프롬프트 템플릿)

## 체크리스트
- [ ] `./scripts/ralph/ralph.sh` 파일에 실행 권한이 있음 (`ls -l` 로 `x` 확인)
- [ ] 현재 위치가 git 저장소 루트임 (`git status` 정상 작동)

# 3 단계: PRD 작성을 AI에게 맡기기 (`prd` 스킬 사용)

이제 이번 튜토리얼의 핵심인 "PRD 작성 자체를 AI에게 맡기기"입니다. Claude Code에서 다음처럼 요청합니다.

```
Load the prd skill and create a PRD for [기능 설명을 여기에]
```

예시:
```
Load the prd skill and create a PRD for adding a task priority system
to my todo app (high/medium/low priority, filter by priority)
```

AI가 몇 가지 **명확화 질문(clarifying questions)**을 던질 것입니다 (예: "우선순위 값은 몇 단계로 나눌까요?", "기본값은 무엇인가요?"). 성실히 답변하세요 — 이 답변의 구체성이 이후 자동 생성되는 작업 단위의 품질을 좌우합니다.

## 규칙
- 질문에 애매하게 답하면 PRD도 애매해지고, 결과적으로 Step 4의 작업 쪼개기도 부정확해집니다. 가능한 한 구체적인 수치·조건·UI 동작을 명시하세요.
- 기능 하나(예: "우선순위 시스템")당 PRD 하나를 만드는 것이 좋습니다. 여러 기능을 한 PRD에 욱여넣지 마세요.

## 산출물
- `tasks/prd-[feature-name].md` (스킬이 자동으로 이 경로에 저장)

## 체크리스트
- [ ] `tasks/prd-*.md` 파일이 생성됨
- [ ] PRD 안에 목표, 사용자 스토리 초안, 범위(In/Out of scope)가 포함되어 있는지 훑어봄

# 4 단계: PRD를 `prd.json`으로 변환하기 (`ralph` 스킬 사용)

```
Load the ralph skill and convert tasks/prd-[feature-name].md to prd.json
```

이 명령이 Markdown PRD를 Ralph가 읽을 수 있는 `prd.json` 형식(user stories 배열)으로 변환해줍니다.

## 산출물
- 프로젝트 루트의 `prd.json`

## 체크리스트
- [ ] `prd.json`이 프로젝트 루트에 생성됨
- [ ] `cat prd.json | jq .` 로 유효한 JSON인지 확인

# 5 단계: `prd.json` 구조 이해하기
공식 예제(`prd.json.example`) 기준 구조는 다음과 같습니다.

```json
{
  "project": "MyApp",
  "branchName": "ralph/task-priority",
  "description": "Task Priority System - Add priority levels to tasks",
  "userStories": [
    {
      "id": "US-001",
      "title": "Add priority field to database",
      "description": "As a developer, I need to store task priority so it persists across sessions.",
      "acceptanceCriteria": [
        "Add priority column to tasks table: 'high' | 'medium' | 'low' (default 'medium')",
        "Generate and run migration successfully",
        "Typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-002",
      "title": "Display priority indicator on task cards",
      "description": "As a user, I want to see task priority at a glance.",
      "acceptanceCriteria": [
        "Each task card shows colored priority badge (red=high, yellow=medium, gray=low)",
        "Priority visible without hovering or clicking",
        "Typecheck passes",
        "Verify in browser using dev-browser skill"
      ],
      "priority": 2,
      "passes": false,
      "notes": ""
    }
  ]
}
```

## 체크리스트
[ ] 공식 예제(`prd.json.example`) 기준 구조를 확인한다.

# 6 단계: 여러 작업 추가

`ralph` 스킬이 변환해준 `prd.json`을 열어서 직접 편집하거나, AI에게 "PRD 내용을 참고해서 prd.json에 나머지 스토리도 추가해줘"라고 요청할 수 있습니다.

```json
{
  "project": "MyApp",
  "branchName": "ralph/task-priority",
  "description": "Task Priority System - Add priority levels to tasks",
  "userStories": [
    {
      "id": "US-001",
      "title": "Add priority field to database",
      "description": "As a developer, I need to store task priority so it persists across sessions.",
      "acceptanceCriteria": [
        "Add priority column to tasks table: 'high' | 'medium' | 'low' (default 'medium')",
        "Generate and run migration successfully",
        "Typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-002",
      "title": "Display priority indicator on task cards",
      "description": "As a user, I want to see task priority at a glance.",
      "acceptanceCriteria": [
        "Each task card shows colored priority badge (red=high, yellow=medium, gray=low)",
        "Priority visible without hovering or clicking",
        "Typecheck passes",
        "Verify in browser using dev-browser skill"
      ],
      "priority": 2,
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-003",
      "title": "Add priority selector to task edit",
      "description": "As a user, I want to change a task's priority when editing it.",
      "acceptanceCriteria": [
        "Priority dropdown in task edit modal",
        "Shows current priority as selected",
        "Saves immediately on selection change",
        "Typecheck passes",
        "Verify in browser using dev-browser skill"
      ],
      "priority": 3,
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-004",
      "title": "Add filter dropdown to list",
      "description": "As a user, I want to filter the task list to see only tasks of a chosen priority.",
      "acceptanceCriteria": [
        "Filter dropdown with options: All | High | Medium | Low",
        "Filter persists in URL params",
        "Empty state message when no tasks match filter",
        "Typecheck passes",
        "Verify in browser using dev-browser skill"
      ],
      "priority": 4,
      "passes": false,
      "notes": ""
    }
  ]
}
```

### 규칙
- `id`는 중복 없이 순차적으로 (`US-001`, `US-002`, ...)
- `priority` 숫자는 처리 순서를 결정 — 의존 관계가 있는 작업(예: DB 컬럼이 먼저 있어야 UI에서 쓸 수 있음)은 숫자를 낮게 설정
- 새로 추가하는 story는 항상 `"passes": false`, `"notes": ""`로 시작
- `acceptanceCriteria`는 사람이 읽고도 "완료됐는지 아닌지" 명확히 판단할 수 있는 문장으로 작성 (모호한 표현 금지)

### 산출물
- 여러 개의 작은 user story가 담긴 `prd.json`

### 체크리스트
- [ ] `cat prd.json | jq '.userStories[] | {id, title, priority, passes}'` 로 목록과 순서를 확인
- [ ] 각 story가 "대시보드 전체" 수준이 아니라 "필터 드롭다운 추가" 수준으로 쪼개져 있는지 재검토
- [ ] UI 관련 story에는 `"Verify in browser using dev-browser skill"` 문구가 포함됨
- [ ] `id`가 중복되지 않음, `priority` 순서가 의존 관계와 맞음

# 7 단계: Ralph 실행하기

```bash
# Claude Code 사용 시
./scripts/ralph/ralph.sh --tool claude [최대_iteration_수]

# 예: 최대 10회 반복
./scripts/ralph/ralph.sh --tool claude 10
```

`max_iterations`를 생략하면 기본값 10회입니다. **story 개수보다 넉넉하게 잡는 것을 권장** (예: story 4개면 iteration 6~8회 정도 — 재시도나 품질 체크 실패 대응 여유분).

## 규칙
- 각 iteration은 완전히 새 AI 인스턴스이므로, 이전 iteration의 기억은 오직 git 커밋 이력·`progress.txt`·`prd.json`을 통해서만 전달됩니다.
- 타입체크/테스트 같은 **피드백 루프가 없으면 Ralph는 사실상 동작하지 않는 것과 같습니다.** 프로젝트에 최소한의 typecheck·test 스크립트가 있는지 실행 전에 확인하세요.

## 산출물
- feature 브랜치에 쌓인 커밋들
- 갱신된 `prd.json` (각 story의 `passes` 값)
- `progress.txt`

## 체크리스트
- [ ] 실행 전 typecheck/테스트 명령이 프로젝트에 존재하고 정상 동작함
- [ ] `git branch`로 새 feature 브랜치가 생성됐는지 확인
- [ ] 실행 완료 후 `<promise>COMPLETE</promise>` 출력 여부 확인 (모든 story 완료 시 표시됨)

# 8 단계: 진행 상황 확인 및 디버깅

```bash
# 어떤 story가 끝났는지 확인
cat prd.json | jq '.userStories[] | {id, title, passes}'

# 이전 iteration들이 남긴 학습 내용 확인
cat progress.txt

# 커밋 이력 확인
git log --oneline -10
```

### 규칙
- 특정 story에서 계속 실패한다면, 그 story가 여전히 너무 크거나 acceptance criteria가 모호할 가능성이 높습니다 → Step 5-2 기준으로 다시 쪼개세요.
- `AGENTS.md`(또는 `CLAUDE.md`)에 Ralph가 남긴 패턴·주의사항은 다음 실행에도 자동으로 읽히므로 삭제하지 말고 누적되게 두세요.

### 체크리스트
- [ ] 실패한 story가 있다면 원인을 `progress.txt`에서 확인
- [ ] 필요 시 해당 story를 더 작은 단위 2~3개로 쪼개서 `prd.json`을 수정 후 재실행


