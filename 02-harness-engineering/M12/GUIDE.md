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

# 6 단계: 

## 규칙

## 산출물

## 체크리스트
[ ] 확인한다.

# 7 단계: 

## 규칙

## 산출물

## 체크리스트
[ ] 확인한다.

# 8 단계: 

## 규칙

## 산출물

## 체크리스트
[ ] 확인한다.


