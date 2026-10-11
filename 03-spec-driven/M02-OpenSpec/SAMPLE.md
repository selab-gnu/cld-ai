# 예제 실행 및 프롬프트 — 할 일 관리 앱을 OpenSpec으로 만들기

> 이 문서는 **복사 → 붙여넣기 → 결과 확인** 만으로 끝까지 따라 할 수 있도록 작성되었다.
> 각 단계의 의미와 규칙은 [GUIDE.md](GUIDE.md) 의 같은 번호 단계를 참고한다.
> 예상 소요 시간: 약 40~60분 (AI 응답 시간 포함)

**완성 결과물**
- 할 일을 추가·완료·삭제하고, 전체/진행 중/완료로 필터링하며, 새로 고침해도 데이터가 남는 웹 앱 + 자동 테스트
- 앱의 현재 동작을 설명하는 기준 명세 `openspec/specs/todo-list/spec.md`
- 변경 이력 `openspec/changes/archive/YYYY-MM-DD-add-todo-list/`

| 표시 | 입력하는 곳 |
| --- | --- |
| 🖥️ **터미널** | macOS 터미널(zsh/bash) |
| 🤖 **Claude Code** | `claude` 를 실행한 뒤 나오는 채팅 입력창 |

> 이 실습에서는 경로가 문서와 똑같이 나오도록 **변경 이름 `add-todo-list`**, **기능 이름 `todo-list`** 를 프롬프트에서 지정한다.

---

## 0단계: 준비물 확인

🖥️ **터미널**

```bash
node --version      # v20.19.0 이상
git --version
python3 --version
claude --version    # Claude Code 설치 확인
```

없는 도구 설치 (macOS 기준):

```bash
brew install node                                 # Node.js
curl -fsSL https://claude.ai/install.sh | bash    # Claude Code (설치 후 claude 를 한 번 실행해 로그인)
```

✅ **확인**: 모든 명령이 버전 번호를 출력한다.

---

## 1단계: OpenSpec 설치와 프로젝트 만들기

🖥️ **터미널** — 실습할 상위 폴더(예: `~/git`)로 이동한 뒤 한 줄씩 실행

```bash
# 1) openspec CLI 설치
npm install -g @fission-ai/openspec@latest
openspec --version

# 2) 프로젝트 폴더 + git 저장소
mkdir my-todo-openspec && cd my-todo-openspec
git init

# 3) Claude Code용 + 한국어 산출물로 초기화
openspec init --tools claude --language "Korean (ko-KR)"

# 4) 결과 확인 (.claude 는 숨김 폴더라 ls -a 또는 경로를 직접 지정)
ls .claude/commands/opsx
ls .claude/skills
find openspec
```

✅ **확인**
- [ ] 초기화 화면에 `6 skills and 6 commands in .claude/` 가 보인다.
- [ ] `ls .claude/commands/opsx` 결과:
  ```
  apply.md  archive.md  explore.md  propose.md  sync.md  update.md
  ```
- [ ] `ls .claude/skills` 결과:
  ```
  openspec-apply-change  openspec-archive-change  openspec-explore
  openspec-propose       openspec-sync-specs      openspec-update-change
  ```
- [ ] `find openspec` 결과:
  ```
  openspec
  openspec/changes
  openspec/changes/archive
  openspec/changes/archive/.gitkeep
  openspec/config.yaml
  openspec/specs
  openspec/specs/.gitkeep
  ```

> 💡 Finder에서 `.claude` 가 안 보이면 `⌘ + Shift + .` 를 누른다.

---

## 2단계: 프로젝트 맥락 설정

🖥️ **터미널** — 아래 블록을 통째로 복사해 붙여 넣으면 `config.yaml` 이 교체된다.

```bash
cat > openspec/config.yaml <<'EOF'
schema: spec-driven

context: |
  Language: Korean (ko-KR)
  All artifacts must be written in Korean (ko-KR).
  Keep OpenSpec structural headings and SHALL/MUST keywords in English.

  프로젝트: 초보자 학습용 할 일 관리 웹 앱 (혼자 쓰는 개인용)
  기술 스택: 빌드 도구·프레임워크 없이 순수 HTML/CSS/JavaScript(ES 모듈)
  구조: index.html, src/todo.js(순수 함수 로직), src/storage.js(localStorage 저장), src/app.js(화면·이벤트)
  테스트: tests/*.test.js 에 Node.js 내장 테스트 러너(node --test). package.json 에는 "type": "module" 만 두고 외부 의존성 없음
  실행: python3 -m http.server 8000
  원칙: 모든 기능은 키보드만으로 사용 가능. 데이터는 브라우저 localStorage 에만 저장하고 외부로 전송하지 않음

rules:
  proposal:
    - 범위 밖(Out of scope) 항목을 반드시 적는다
  tasks:
    - 각 작업 그룹에 해당 기능의 단위 테스트 작업을 포함한다
    - 각 작업에는 완료를 확인하는 방법(테스트 또는 명령)을 적는다
EOF

# 초기 상태 커밋
git add -A && git commit -m "chore: init OpenSpec"
```

✅ **확인**
- [ ] `cat openspec/config.yaml` 에 위 내용이 보인다.
- [ ] `git log --oneline` 에 커밋 1개가 있다.

---

## 3단계: Claude Code CLI를 실행

🖥️ **터미널** — 반드시 `my-todo-openspec` 폴더 **안에서** 실행한다.

```bash
claude
```

🤖 **Claude Code** — 입력창에 `/opsx` 까지만 쳐 보면 자동 완성 목록에 OpenSpec 명령이 나타난다.

✅ **확인**: `/opsx:explore`, `/opsx:propose`, `/opsx:apply`, `/opsx:update`, `/opsx:sync`, `/opsx:archive` 가 보인다.

> 💡 Claude Code가 파일 쓰기나 명령 실행 권한을 물어보면 내용을 읽고 허용한다.

---

## 4단계: 프롬프트가 뜨면 자연어로 지시

아래 프롬프트를 **순서대로 하나씩** 붙여 넣는다. 각 단계가 끝나면 ✅ 확인 항목을 점검한 뒤 다음으로 넘어간다.

### 4-1. (선택) 생각 정리 — `/opsx:explore`

🤖 **Claude Code**

```text
/opsx:explore 혼자 쓰는 할 일 관리 앱의 첫 버전에 꼭 필요한 기능과 빼도 되는 기능을 같이 정리해 줘. 새로 고침해도 데이터가 남아야 한다는 점은 꼭 지키고 싶어.
```

AI와 몇 번 대화한 뒤, 변경을 시작하겠냐고 물으면 이렇게 답한다.

```text
아니요, 정리한 내용으로 propose를 직접 실행할게요.
```

✅ **확인**
- [ ] AI가 코드나 파일을 만들지 않았다. (🖥️ `openspec list` → `No active changes found.`)

### 4-2. 변경 제안 — `/opsx:propose`

🤖 **Claude Code**

```text
/opsx:propose 변경 이름은 add-todo-list, 새 기능(capability) 이름은 todo-list 로 해 줘. 혼자 쓰는 간단한 할 일 관리 앱의 첫 버전이다. 사용자는 할 일을 입력해 목록에 추가하고, 완료 여부를 체크하거나 해제하고, 필요 없는 할 일을 삭제할 수 있다. 목록은 '전체 / 진행 중 / 완료'로 걸러 볼 수 있고, 남은 할 일 개수가 항상 보인다. 빈 값이나 공백만 입력하면 추가하지 않는다. 페이지를 새로 고치거나 브라우저를 다시 열어도 목록이 그대로 남아 있어야 한다. 로그인, 여러 사용자, 마감일은 이번 범위가 아니다.
```

AI가 proposal → specs → design → tasks 순서로 문서를 만들고 `/opsx:apply` 를 안내하며 멈춘다.

✅ **확인** — 아래 구조가 생겼다.

```
openspec/changes/add-todo-list/
├── .openspec.yaml
├── proposal.md
├── specs/
│   └── todo-list/
│       └── spec.md
├── design.md
└── tasks.md
```

- [ ] proposal.md 가 한국어이고, `## Why`, `## What Changes`, `## Capabilities`, `## Impact` 가 있다.
- [ ] proposal.md 에 범위 밖(로그인·여러 사용자·마감일)이 적혀 있다.
- [ ] specs/todo-list/spec.md 가 `## ADDED Requirements` 로 시작하고, 요구사항마다 `#### Scenario:` 가 있다.

### 4-3. 검토와 검증 — 터미널 + `/opsx:update`

🖥️ **터미널** (새 탭을 열고 `cd my-todo-openspec`)

```bash
openspec status --change add-todo-list
openspec validate add-todo-list --strict
```

✅ 기대 출력

```
Progress: 4/4 artifacts complete

[x] proposal
[x] specs
[x] design
[x] tasks

All planning artifacts complete!
```

```
Change 'add-todo-list' is valid
```

이제 문서를 직접 읽어 본다. (편집기로 열거나 `openspec show add-todo-list`)
아래 두 가지는 이 실습에서 **명세에 반드시 들어가게** 해 보자. 이미 있으면 건너뛴다.

🤖 **Claude Code**

```text
/opsx:update add-todo-list - 할 일 텍스트는 최대 200자까지만 허용하고, 삭제할 때는 확인 창 없이 바로 삭제한다. 관련 명세 시나리오와 작업도 맞춰 줘.
```

AI가 문서별로 수정안을 보여 주며 "적용할까요?"라고 물으면 내용을 확인하고 `yes` 로 답한다.

✅ **확인**
- [ ] spec.md 에 200자 제한과 즉시 삭제 시나리오가 있다.
- [ ] tasks.md 에도 관련 작업(또는 테스트)이 반영되었다.
- [ ] 🖥️ `openspec validate add-todo-list --strict` 를 다시 실행해도 `is valid` 이다.

validate가 실패하면 오류 메시지를 그대로 붙여 넣는다.

```text
openspec validate add-todo-list --strict 결과가 아래와 같아. 형식에 맞게 고쳐 줘.
(오류 메시지 붙여 넣기)
```

### 4-4. 구현 — `/opsx:apply`

🤖 **Claude Code**

```text
/opsx:apply add-todo-list
```

- 파일 생성과 `node --test` 실행 권한을 허용한다.
- 중간에 멈추면 같은 명령을 다시 입력하면 이어서 진행한다.

✅ **확인**
- [ ] tasks.md 의 모든 작업이 `- [x]` 로 바뀌었다.
- [ ] `index.html`, `src/`, `tests/`, `package.json` 이 생겼다.
- [ ] AI가 "보관 전에 검토·검증하라"고 안내했다 → 다음 5단계에서 직접 확인한다.

---

## 5단계: 결과 확인 및 실행

🖥️ **터미널** (두 번째 탭)

```bash
# 1) 테스트
node --test

# 2) 앱 실행
python3 -m http.server 8000
```

브라우저에서 **http://localhost:8000** 을 열고, 명세(`openspec/changes/add-todo-list/specs/todo-list/spec.md`)의 시나리오와 비교하며 직접 해 본다.

| # | 동작 | 기대 결과 |
| --- | --- | --- |
| 1 | "우유 사기" 입력 후 Enter | 목록에 추가, 남은 개수 1 |
| 2 | 공백만 입력 후 Enter | 추가되지 않음 |
| 3 | 201자 이상 입력 | 추가되지 않거나 200자에서 입력이 막힘 |
| 4 | "우유 사기" 체크 | 완료 표시, 남은 개수 0 |
| 5 | "진행 중" 필터 | 완료된 항목이 숨겨짐 |
| 6 | 새로 고침(⌘R) | 목록과 완료 상태 유지 |
| 7 | 삭제 버튼 | 확인 창 없이 즉시 사라짐 |
| 8 | 마우스 없이 Tab/Enter/Space 로 1~7 반복 | 모두 가능 |

✅ **확인**
- [ ] `node --test` 결과가 `# fail 0` 이다.
- [ ] 위 표의 8가지가 모두 기대대로 동작한다. 다르면 Claude Code에 "시나리오 N이 명세와 다르게 동작해. 고쳐 줘"라고 요청한다.

확인이 끝나면 서버는 `Ctrl+C` 로 끈다.

---

## 6단계: 명세에 병합하고 보관 — `/opsx:archive`

🤖 **Claude Code**

```text
/opsx:archive add-todo-list
```

`Delta specs: Not yet synced → Sync now?` 라고 물으면:

```text
yes
```

🖥️ **터미널**

```bash
openspec list
openspec list --specs
find openspec -type f | sort
```

✅ **확인**
- [ ] `openspec list` → `No active changes found.`
- [ ] `openspec list --specs` 에 `todo-list` 와 요구사항 개수가 보인다.
- [ ] `find` 결과에 아래 파일들이 있다(날짜는 실행한 날).
  ```
  openspec/changes/archive/2026-10-11-add-todo-list/.openspec.yaml
  openspec/changes/archive/2026-10-11-add-todo-list/design.md
  openspec/changes/archive/2026-10-11-add-todo-list/proposal.md
  openspec/changes/archive/2026-10-11-add-todo-list/specs/todo-list/spec.md
  openspec/changes/archive/2026-10-11-add-todo-list/tasks.md
  openspec/config.yaml
  openspec/specs/todo-list/spec.md
  ```
- [ ] `openspec/specs/todo-list/spec.md` 맨 위 `## Purpose` 가 `TBD - created by archiving change add-todo-list…` 로 되어 있다. 아래처럼 다듬는다.

🤖 **Claude Code**

```text
openspec/specs/todo-list/spec.md 의 Purpose 를 "혼자 쓰는 사용자가 할 일을 추가·완료·삭제·필터링하고, 브라우저를 다시 열어도 목록이 유지되도록 하는 기능" 이라는 뜻으로 한두 문장으로 고쳐 줘.
```

🖥️ **터미널** — 커밋

```bash
git add -A && git commit -m "feat: add todo list (OpenSpec change add-todo-list)"
```

---

## 7단계: (도전) 두 번째 변경 — 기존 명세를 수정하기

OpenSpec의 진가는 **이미 있는 기준 명세를 델타로 수정**할 때 드러난다. 마감일 기능을 추가해 보자.

### 7-1. 제안

🤖 **Claude Code**

```text
/opsx:propose 변경 이름은 add-due-date 로 하고, 기존 기능 todo-list 를 수정하는 변경으로 만들어 줘. 사용자는 할 일을 추가할 때 선택적으로 마감일을 지정할 수 있다. 마감일이 지난 미완료 할 일은 눈에 띄게 표시된다. 목록을 마감일이 가까운 순으로 정렬해 볼 수 있다. 기존에 저장된 마감일 없는 할 일도 그대로 보여야 한다. 알림 기능은 범위 밖이다.
```

✅ **확인**

```
openspec/changes/add-due-date/
├── proposal.md          ← Capabilities → Modified Capabilities 에 todo-list
├── specs/todo-list/spec.md   ← ## ADDED Requirements (+ 필요하면 ## MODIFIED Requirements)
├── design.md
└── tasks.md
```

- [ ] proposal.md 의 **Modified Capabilities** 에 `todo-list` 가 있다. (New Capabilities 가 아님)
- [ ] 델타 명세에 `## ADDED Requirements` 가 있고, 기존 요구사항(예: 할 일 추가)을 바꿨다면 `## MODIFIED Requirements` 에 **전체 내용**이 들어 있다.

### 7-2. 검증 → 구현 → 확인 → 보관

🖥️ **터미널**

```bash
openspec validate add-due-date --strict
openspec show add-due-date
```

🤖 **Claude Code**

```text
/opsx:apply add-due-date
```

🖥️ **터미널**

```bash
node --test
python3 -m http.server 8000      # 브라우저에서 마감일 지정·지난 마감 표시·정렬 확인 후 Ctrl+C
```

🤖 **Claude Code**

```text
/opsx:archive add-due-date
```

✅ **확인**
- [ ] `openspec/specs/todo-list/spec.md` 에 마감일 관련 요구사항이 **합쳐졌다**. (파일은 여전히 하나)
- [ ] `openspec/changes/archive/` 아래에 변경 2개(`…-add-todo-list`, `…-add-due-date`)가 있다.
- [ ] 예전에 추가한 마감일 없는 할 일도 화면에 정상 표시된다.
- [ ] `git add -A && git commit -m "feat: add due date (OpenSpec change add-due-date)"`

> 🎯 여기까지 했다면 OpenSpec의 핵심 순환 **propose → (update) → apply → archive** 를 두 번 돌렸고, `openspec/specs/` 가 항상 "지금의 앱"을 설명하도록 유지했다.

---

## 문제 해결

| 증상 | 해결 |
| --- | --- |
| `openspec: command not found` | 터미널을 새로 열거나 `npm prefix -g` 의 `bin` 경로를 PATH에 추가 |
| Claude Code에 `/opsx:` 명령이 안 보임 | `my-todo-openspec` 폴더 안에서 `claude` 를 실행했는지 확인(`pwd`). 실행 도중 init 했다면 Claude Code 재시작 |
| 문서가 영어로 나옴 | 2단계 `config.yaml` 의 언어 설정 3줄 확인 |
| 변경 폴더 이름이 문서와 다름 | propose 프롬프트 첫 문장(변경 이름·기능 이름 지정)을 빼먹지 않았는지 확인. 이미 만들어졌다면 그 이름으로 계속 진행해도 된다 |
| `validate` 실패 | 오류 메시지를 Claude Code에 붙여 넣고 고쳐 달라고 요청. 흔한 원인: `#### Scenario` 의 `#` 개수, 시나리오 없는 요구사항, SHALL/MUST 누락 |
| 브라우저 화면이 비어 있음 | `index.html` 을 더블클릭하지 말고 `python3 -m http.server 8000` 주소로 접속 |
| `node --test` 에서 import 오류 | `package.json` 에 `"type": "module"` 이 있는지 확인 |
| archive 했는데 잘못된 것 같음 | 커밋하기 전이라면 git으로 직전 커밋 상태로 되돌릴 수 있다. `git status` 로 바뀐 파일을 확인한 뒤 Claude Code에 "직전 커밋 상태로 openspec 폴더를 되돌려 줘"라고 요청한다. 그래서 **단계마다 커밋**해 두는 것이 좋다 |

> 📝 AI가 생성하는 문서와 코드는 실행할 때마다 조금씩 달라진다. 문장 표현이나 요구사항 개수가 이 문서와 달라도, **✅ 확인 항목**을 만족하면 정상이다.
