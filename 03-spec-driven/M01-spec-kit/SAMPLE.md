# 예제 실행 및 프롬프트 — 할 일 관리 앱(my-todo)을 Spec Kit으로 만들기

> 이 문서는 **복사 → 붙여넣기 → 결과 확인** 만으로 끝까지 따라 할 수 있도록 작성되었다.
> 각 단계의 의미와 규칙은 [GUIDE.md](GUIDE.md) 에서 같은 번호의 단계를 참고한다.
> 예상 소요 시간: 약 40~60분 (AI 응답 시간 포함)

**완성 결과물**: 할 일을 추가·완료·삭제하고, 전체/진행 중/완료로 필터링하며, 새로 고침해도 데이터가 남는 웹 앱 + 자동 테스트

| 표시 | 입력하는 곳 |
| --- | --- |
| 🖥️ **터미널** | macOS 터미널(zsh/bash) |
| 🤖 **Claude Code** | `claude` 를 실행한 뒤 나오는 채팅 입력창 |

---

## 0단계: 준비물 확인

🖥️ **터미널**

```bash
python3 --version   # 3.11 이상
git --version
node --version      # v20 이상 (테스트 실행용)
claude --version    # Claude Code 설치 확인
uv --version        # 없으면 아래 설치
```

없는 도구 설치 (macOS 기준):

```bash
brew install uv                                   # uv
curl -fsSL https://claude.ai/install.sh | bash    # Claude Code (설치 후 claude 를 한 번 실행해 로그인)
brew install node                                 # Node.js
```

✅ **확인**: 모든 명령이 버전 번호를 출력한다.

---

## 1단계: Spec Kit 설치와 프로젝트 만들기

🖥️ **터미널** — 실습할 폴더로 이동한 뒤 한 줄씩 실행

```bash
# 1) specify CLI 설치
uv tool install specify-cli
specify version

# 2) Claude Code용 프로젝트 생성
specify init my-todo --integration claude --script sh
cd my-todo

# 3) (권장) git 확장 — 기능별 브랜치 자동 생성
specify extension add git

# 4) 설치 결과 확인
ls .claude/skills
```

✅ **확인**: 마지막 명령 결과에 아래 이름들이 보인다.

```
speckit-analyze      speckit-converge     speckit-git-commit   ...
speckit-checklist    speckit-implement    speckit-plan
speckit-clarify      speckit-constitution speckit-specify      speckit-tasks
```

`specify init` 마지막 화면의 **Next Steps** 상자에 `/speckit-constitution` ~ `/speckit-converge` 순서가 안내되는 것도 확인하자.

---

## 2단계: Claude Code CLI를 실행

🖥️ **터미널** — 반드시 `my-todo` 폴더 **안에서** 실행한다.

```bash
claude
```

🤖 **Claude Code** — 입력창에 `/speckit` 까지만 쳐 보면 자동 완성 목록에 Spec Kit 스킬이 나타난다.

✅ **확인**: `/speckit-constitution`, `/speckit-specify` 등이 목록에 보인다.

> 💡 Claude Code가 파일 쓰기나 명령 실행 권한을 물어보면 내용을 읽고 허용(Yes)한다. 매번 묻는 것이 번거로우면 "이 세션 동안 허용" 옵션을 고른다.

---

## 3단계: 프롬프트가 뜨면 자연어로 지시

아래 프롬프트를 **순서대로 하나씩** 붙여 넣는다. 각 단계가 끝나면 ✅ 확인 항목을 점검한 뒤 다음으로 넘어간다.

### 3-1. 헌법 만들기 — `/speckit-constitution`

🤖 **Claude Code**

```text
/speckit-constitution 이 프로젝트는 초보자 학습용 할 일 관리 웹 앱이다. 다음 원칙을 정해 줘.
1) 단순성: 빌드 도구나 프레임워크 없이 순수 HTML/CSS/JavaScript만 사용한다.
2) 테스트 우선: 핵심 로직은 순수 함수로 분리하고, Node.js 내장 테스트 러너(node --test)로 먼저 테스트를 작성한다.
3) 접근성: 모든 기능은 키보드만으로 사용할 수 있어야 한다.
4) 개인정보 보호: 데이터는 브라우저 localStorage에만 저장하고 외부로 전송하지 않는다.
5) 문서와 화면 문구는 한국어로 작성한다.
```

✅ **확인**
- [ ] `.specify/memory/constitution.md` 에 원칙 5개와 버전 `1.0.0` 이 들어 있다.
- [ ] 파일 안에 `[PRINCIPLE_1_NAME]` 같은 자리표시자가 남아 있지 않다.

### 3-2. 기능 명세 — `/speckit-specify`

🤖 **Claude Code** — 기술 이야기는 하지 않는다는 점에 주목하자.

```text
/speckit-specify 혼자 쓰는 간단한 할 일 관리 앱을 만들고 싶다. 사용자는 할 일을 입력해 목록에 추가하고, 완료 여부를 체크하거나 해제하고, 필요 없는 할 일을 삭제할 수 있다. 목록은 '전체 / 진행 중 / 완료'로 걸러 볼 수 있고, 남은 할 일 개수가 항상 보인다. 페이지를 새로 고치거나 브라우저를 다시 열어도 목록이 그대로 남아 있어야 한다. 로그인이나 여러 사용자 기능은 이번 범위가 아니다.
```

AI가 `Q1:` 처럼 질문(선택지 표)을 보여 주면 `Q1: A` 형식으로 답한다.

✅ **확인**
- [ ] `specs/001-<이름>/spec.md` 와 `checklists/requirements.md` 가 생겼다.
- [ ] spec.md 에 사용자 스토리(P1, P2 …)와 `FR-001` 형식의 요구사항, `SC-001` 형식의 성공 기준이 있다.
- [ ] spec.md 에 HTML·JavaScript·localStorage 같은 **기술 용어가 없다**. 있으면 아래처럼 요청한다.

```text
spec.md 에서 기술 구현 용어를 빼고 사용자 관점의 표현으로 바꿔 줘.
```

### 3-3. 명확화 — `/speckit-clarify`

🤖 **Claude Code**

```text
/speckit-clarify 할 일 입력 규칙(빈 값, 최대 길이, 중복 허용 여부)과 삭제할 때 확인 절차를 중심으로 확인해 줘.
```

질문이 하나씩 나온다. 답이 고민되면 아래 **예시 답변**을 써도 된다.

| 예상 질문 | 예시 답변 |
| --- | --- |
| 공백만 입력하면? | 추가하지 않고 안내 문구 표시 |
| 최대 길이는? | 200자 |
| 같은 내용의 할 일 중복 허용? | 허용 |
| 삭제 시 확인 창? | 확인 없이 즉시 삭제 |
| 목록 정렬 순서? | 추가한 순서(오래된 것 위) |

✅ **확인**
- [ ] spec.md 에 `## Clarifications` → `### Session 날짜` 와 문답 목록이 생겼다.

### 3-4. 기술 계획 — `/speckit-plan`

🤖 **Claude Code** — 이제야 기술을 이야기한다.

```text
/speckit-plan 빌드 도구 없이 순수 HTML, CSS, JavaScript(ES 모듈)로 만든다. 화면은 index.html 하나다. 할 일 데이터를 다루는 로직은 src/todo.js 의 순수 함수로, 저장은 src/storage.js 에서 localStorage를 사용하고, 화면 그리기와 이벤트 처리는 src/app.js 가 맡는다. 테스트는 tests/todo.test.js 에 Node.js 내장 테스트 러너(node --test)로 작성하고, package.json 에는 "type": "module" 만 지정하며 외부 의존성은 두지 않는다. 로컬 실행은 python3 -m http.server 로 한다.
```

✅ **확인**
- [ ] `plan.md`, `research.md`, `data-model.md`, `quickstart.md` 가 생겼다.
- [ ] `plan.md` 의 **Constitution Check** 가 모두 통과로 표시되어 있다.

### 3-5. (선택) 요구사항 체크리스트 — `/speckit-checklist`

🤖 **Claude Code**

```text
/speckit-checklist 사용자 경험(UX)과 데이터 보존 요구사항이 빠짐없고 명확한지 점검하는 체크리스트를 만들어 줘.
```

✅ **확인**
- [ ] `checklists/` 에 새 체크리스트 파일이 생겼다.
- [ ] 파일을 열어 각 항목을 읽어 보고, spec.md 가 그 기준을 만족한다고 판단되는 항목만 직접 `[x]` 로 바꾼다. (만족하지 않으면 spec.md 를 보완하도록 요청)

### 3-6. 작업 분해 — `/speckit-tasks`

🤖 **Claude Code**

```text
/speckit-tasks 헌법의 테스트 우선 원칙에 따라 테스트 작업을 포함해 줘.
```

✅ **확인**
- [ ] `tasks.md` 가 생겼고 `T001`, `T002` … 번호가 붙어 있다.
- [ ] Phase 3 이후가 사용자 스토리별로 나뉘어 있고, 테스트 작업이 구현 작업보다 앞에 있다.

### 3-7. 일관성 점검 — `/speckit-analyze`

🤖 **Claude Code**

```text
/speckit-analyze
```

CRITICAL 또는 HIGH 이슈가 보고되면 다음처럼 요청하고 다시 analyze 한다.

```text
analyze 에서 나온 CRITICAL 과 HIGH 이슈를 해결하도록 spec.md, plan.md, tasks.md 를 수정해 줘.
```

✅ **확인**
- [ ] CRITICAL 이슈가 0건이다.

### 3-8. 구현 — `/speckit-implement`

🤖 **Claude Code**

```text
/speckit-implement
```

- 체크리스트 미완료로 "계속할까요?" 라고 물으면 `yes` 로 진행한다.
- 파일 생성과 `node --test` 실행 권한을 허용한다.

✅ **확인**
- [ ] `tasks.md` 의 작업이 `[X]` 로 바뀌었다.
- [ ] `index.html`, `src/`, `tests/`, `package.json` 이 생겼다.

### 3-9. 수렴 검증 — `/speckit-converge`

🤖 **Claude Code**

```text
/speckit-converge
```

- **✅ Converged** 가 나오면 완료.
- 남은 작업이 `tasks.md` 에 추가되었다고 하면 `/speckit-implement` → `/speckit-converge` 를 다시 실행한다.

✅ **확인**
- [ ] `Converged — the implementation satisfies the spec, plan, and tasks.` 메시지를 받았다.

---

## 4단계: 결과 확인 및 실행

🖥️ **터미널** — Claude Code를 종료(`/exit` 또는 `Ctrl+C` 두 번)하거나 새 터미널 탭에서 `my-todo` 폴더로 이동

```bash
# 1) 산출물 구조 보기
find . -path ./.git -prune -o -type f -print | grep -Ev '^\./\.(claude|specify)/' | sort

# 2) 테스트 실행
node --test

# 3) 앱 실행
python3 -m http.server 8000
```

브라우저에서 **http://localhost:8000** 을 열고 아래 시나리오를 직접 해 본다. (이 시나리오는 `specs/001-*/quickstart.md` 에도 정리되어 있다.)

| # | 동작 | 기대 결과 |
| --- | --- | --- |
| 1 | "우유 사기" 입력 후 Enter | 목록에 추가, 남은 개수 1 |
| 2 | 공백만 입력 후 Enter | 추가되지 않고 안내 문구 |
| 3 | "우유 사기" 체크 | 완료 표시, 남은 개수 0 |
| 4 | "진행 중" 필터 클릭 | 완료된 항목이 숨겨짐 |
| 5 | 새로 고침(⌘R) | 목록과 완료 상태 유지 |
| 6 | 마우스 없이 Tab/Enter/Space 로 1~4 반복 | 모두 가능 |
| 7 | 항목 삭제 | 목록에서 사라짐 |

✅ **확인**
- [ ] `node --test` 결과가 `# fail 0` 이다.
- [ ] 위 표의 7가지가 모두 기대대로 동작한다.
- [ ] (git 확장 사용 시) `git log --oneline` 과 `git branch` 로 `001-...` 브랜치와 커밋 기록을 확인했다.

---

## 5단계: (도전) 두 번째 기능 추가 — 명세부터 다시

SDD의 핵심은 **변경도 명세에서 시작한다**는 것이다. 마감일 기능을 추가해 보자.

🤖 **Claude Code** (`claude` 다시 실행)

```text
/speckit-specify 기존 할 일 앱에 마감일 기능을 추가한다. 사용자는 할 일에 선택적으로 마감일을 지정할 수 있고, 마감일이 지난 미완료 할 일은 눈에 띄게 표시된다. 목록을 마감일이 가까운 순으로 정렬해 볼 수 있다.
```

이어서 3-3 ~ 3-9 와 같은 순서로 진행한다.

```text
/speckit-clarify
```
```text
/speckit-plan 기존 구조(src/todo.js, src/storage.js, src/app.js)를 유지하고, 마감일은 HTML date 입력과 ISO 날짜 문자열(YYYY-MM-DD)로 저장한다. 기존에 저장된 마감일 없는 데이터도 그대로 읽혀야 한다.
```
```text
/speckit-tasks 헌법의 테스트 우선 원칙에 따라 테스트 작업을 포함해 줘.
```
```text
/speckit-analyze
```
```text
/speckit-implement
```
```text
/speckit-converge
```

✅ **확인**
- [ ] `specs/002-<이름>/` 폴더가 새로 생겼다(001 은 그대로 남아 변경 이력이 된다).
- [ ] `.specify/feature.json` 이 002 폴더를 가리킨다.
- [ ] 기존 테스트와 새 테스트가 모두 통과하고, 예전에 저장한 할 일도 정상 표시된다.

---

## 문제 해결

| 증상 | 해결 |
| --- | --- |
| `specify: command not found` | 새 터미널을 열거나 `uv tool update-shell` 실행 후 다시 시도 |
| Claude Code에 `/speckit-...` 가 안 보임 | `my-todo` 폴더 안에서 `claude` 를 실행했는지 확인 (`pwd`) |
| 브라우저 화면이 비어 있음 | `index.html` 을 더블클릭으로 열면 ES 모듈이 막힌다. `python3 -m http.server 8000` 주소로 접속 |
| `node --test` 에서 import 오류 | `package.json` 에 `"type": "module"` 이 있는지 확인. 없으면 Claude Code에 추가를 요청 |
| AI 답변이 앞 단계 내용을 헷갈림 | 모든 산출물이 파일로 남아 있으므로 `/clear` 후 다음 단계 명령을 입력해도 된다 |
| 결과가 마음에 들지 않음 | 해당 산출물 파일을 직접 고치거나, 같은 명령을 수정 지시와 함께 다시 실행 (예: `/speckit-plan 앞의 계획에서 ... 를 바꿔 줘`) |

> 📝 AI가 생성하는 문서와 코드는 실행할 때마다 조금씩 달라진다. 폴더 이름(`001-todo-basic` 등)이나 문장 표현이 이 문서와 달라도, **✅ 확인 항목**을 만족하면 정상이다.
