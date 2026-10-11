# 개념

## Kiro란?

**Kiro** 는 "프로토타입에서 프로덕션까지" 를 내세우는 AI 개발 환경이다. VS Code와 비슷한 데스크톱 IDE 안에 AI 에이전트가 들어 있고, 스펙 주도 개발에 필요한 세 가지를 기본 기능으로 제공한다.

| 기능 | 하는 일 | 저장 위치 | M01·M02에서 비슷한 것 |
| --- | --- | --- | --- |
| **Steering** (스티어링) | 프로젝트의 목적·기술·구조·규칙을 AI에게 항상 알려 줌 | `.kiro/steering/*.md` | constitution.md / config.yaml |
| **Specs** (스펙) | 기능 하나를 요구사항 → 설계 → 작업으로 계획하고 실행 | `.kiro/specs/<기능>/` | specs/001-… / openspec/changes/ |
| **Hooks** (에이전트 훅) | 파일 저장·작업 완료 같은 사건에 맞춰 자동으로 명령·프롬프트 실행 | `.kiro/hooks/*.json` | — |

> 이 밖에 MCP(외부 도구 연결), Skills, Custom agents, Checkpoints 등이 있지만 이 모듈에서는 위 세 가지만 다룬다.

## Spec 하나의 산출물

Kiro의 Feature Spec 은 세 단계로 진행하고, 단계마다 문서가 하나씩 생긴다. **각 단계가 끝나면 사람이 검토하고 다음 단계로 진행**한다.

```
 requirements.md  ──►  design.md  ──►  tasks.md  ──►  작업 실행 (Run all Tasks)
   무엇을 · 왜          어떻게           실행 목록         코드 생성
   (EARS 형식)       (구조·흐름·테스트)   (번호 붙은 작업)
```

| 문서 | 내용 |
| --- | --- |
| `requirements.md` | 사용자 스토리 + **EARS 형식** 인수 조건 |
| `design.md` | 기술 구조, 컴포넌트, 데이터 모델, 흐름(시퀀스 다이어그램), 오류 처리, 테스트 전략 |
| `tasks.md` | 번호가 붙은 구현 작업 목록. 실행하면 상태가 진행 중 → 완료로 바뀜 |

| 진행 방식 | 순서 | 언제 쓰나 |
| --- | --- | --- |
| **Requirements-First** (이 모듈) | 요구사항 → 설계 → 작업 | 원하는 동작부터 정할 때 (대부분) |
| Design-First | 설계 → 요구사항 → 작업 | 이미 정해진 구조·성능 조건이 있을 때 |
| Quick Spec | 질문에 먼저 답하면 세 문서를 승인 없이 한 번에 | 잘 아는 작은 기능 |
| Bugfix Spec | `bugfix.md`(현재·기대·유지할 동작) → 설계 → 작업 | 버그 수정 |

## EARS 형식 — Kiro 요구사항의 문법

**EARS**(Easy Approach to Requirements Syntax)는 요구사항을 "조건 → 시스템 동작" 의 정해진 틀로 쓰는 방법이다. 모호한 문장이 줄고, 각 문장이 그대로 테스트 항목이 된다.

```
WHEN [어떤 일이 일어나면]  THE SYSTEM SHALL [시스템은 이렇게 해야 한다]
```

| 나쁜 예 (모호함) | EARS 예 (테스트 가능) |
| --- | --- |
| 빈 할 일은 막아야 한다 | WHEN 사용자가 공백만 입력하고 추가하면 THE SYSTEM SHALL 할 일을 추가하지 않고 안내 문구를 표시한다 |
| 데이터가 남아야 한다 | WHEN 사용자가 페이지를 새로 고치면 THE SYSTEM SHALL 이전 할 일 목록과 완료 상태를 그대로 표시한다 |

> M02 OpenSpec과 달리 Kiro는 형식 검사 도구가 따로 없다. 대신 **Analyze Requirements** 로 요구사항의 빈틈을 점검할 수 있다.

## 화면 구성 — 어디를 누르나

```
┌──┬──────────────────┬────────────────────────────┬──────────────────────┐
│👻│ Kiro 패널          │ 편집기                      │ 채팅 창               │
│  │ ├ Specs      [+]  │ requirements.md / tasks.md │ [Spec] 버튼           │
│  │ ├ Agent Hooks[+]  │ (작업 실행 버튼 · Sync Files)│ 대화 입력창 · #spec   │
│  │ ├ Steering   [+]  │                            │                      │
│  │ └ MCP Servers     │                            │                      │
└──┴──────────────────┴────────────────────────────┴──────────────────────┘
 ↑ 왼쪽 활동 막대의 유령(Ghost) 아이콘 = Kiro 패널 열기
```

| 하고 싶은 일 | 누르는 곳 |
| --- | --- |
| Kiro 패널 열기 | 왼쪽 활동 막대의 **Kiro 유령 아이콘** |
| 스티어링 만들기 | Kiro 패널 › Steering › **Generate Steering Docs** 또는 **+** |
| Spec 시작 | 채팅 창의 **Spec** 버튼, 또는 Kiro 패널 › Specs › **+** |
| 작업 실행 | `tasks.md` 의 작업 항목 클릭, 또는 **Run all Tasks** |
| 문서끼리 맞추기 | `tasks.md` 에서 **Sync Files** |
| Spec을 대화에 불러오기 | 채팅에 `#spec` 입력 → 목록에서 선택 (예: `#spec:todo-list`) |
| Hook 만들기 | Kiro 패널 › Agent Hooks › **+** › **Ask Kiro to create a hook** |

> 📌 버튼 이름은 공식 문서(2026-10-07) 기준이다. 버전에 따라 문구가 조금 다르면 같은 역할의 버튼을 찾는다.

## 이 가이드의 단계

| 단계 | 내용 | 주로 쓰는 곳 |
| --- | --- | --- |
| 1 | 설치와 프로젝트 열기 | kiro.dev, Kiro IDE |
| 2 | 스티어링: 프로젝트 규칙 알려 주기 | `.kiro/steering/` |
| 3 | Spec 시작과 요구사항(requirements.md) | 채팅 **Spec** 버튼 |
| 4 | 설계(design.md) | Spec 채팅 |
| 5 | 작업 목록(tasks.md) | Spec 채팅, 편집기 |
| 6 | 작업 실행 — 앱 만들기 | **Run all Tasks** |
| 7 | Agent Hook — 저장하면 테스트 자동 실행 | Kiro 패널 › Agent Hooks |
| 8 | (도전) 기존 Spec에 마감일 기능 추가 | `#spec:todo-list`, **Sync Files** |

> 📌 실습 예제: M01·M02와 같은 **"할 일 관리 웹 앱"** 을 Kiro로 만든다. 프로젝트 폴더는 `my-todo-kiro`, Spec 이름은 `todo-list` 로 맞춘다. 완성된 앱을 실행·사용·확인하는 방법은 [SAMPLE.md](SAMPLE.md) 에 있다.

---

# 1 단계: 설치와 프로젝트 열기

**목적** — Kiro IDE를 설치·로그인하고, 실습용 빈 프로젝트 폴더를 Kiro로 연다.

**입력**

### 1-1. Kiro 설치와 로그인

1. 브라우저에서 **https://kiro.dev** → **Downloads** 에서 macOS 설치 파일을 받는다. (Intel·Apple Silicon 모두 지원)
2. 받은 파일을 열어 안내대로 설치한다. (응용 프로그램 폴더에 Kiro가 생긴다)
3. Kiro를 실행하고 **Google / GitHub / AWS Builder ID / 조직 계정** 중 하나로 로그인한다.
4. VS Code 설정·확장을 가져올지 물으면 원하는 대로 고른다. (VS Code를 안 쓰면 건너뛰고 테마만 고른다)

### 1-2. 프로젝트 폴더 만들기 (터미널)

```bash
mkdir -p ~/git/my-todo-kiro && cd ~/git/my-todo-kiro
git init
```

### 1-3. Kiro로 폴더 열기

아래 셋 중 하나:

- Kiro 메뉴 **File › Open Folder** → `my-todo-kiro` 선택
- Finder에서 `my-todo-kiro` 폴더를 Kiro 창으로 끌어다 놓기
- 터미널에서 `kiro .` (셸 명령이 설치된 경우)

그다음 왼쪽 활동 막대의 **Kiro 유령 아이콘**을 눌러 Kiro 패널을 연다. 채팅 창이 함께 열린다.

## 규칙

- 반드시 **프로젝트 폴더를 연 상태**에서 작업한다. Kiro는 연 폴더 안에 `.kiro/` 를 만든다.
- 폴더를 열 때 "이 폴더의 작성자를 신뢰하는가" 를 물으면 내가 만든 폴더이므로 신뢰를 선택한다.
- Kiro 안의 터미널은 메뉴 **Terminal › New Terminal** (또는 **⌃ + `**)로 연다. 이후 터미널 명령은 여기서 해도 된다.

## 산출물

```
my-todo-kiro/
└── .git/          ← 아직 .kiro/ 는 없다 (2단계에서 생김)
```

## 체크리스트

- [ ] Kiro에 로그인되어 있다.
- [ ] Kiro 창 제목·탐색기에 `my-todo-kiro` 가 보인다.
- [ ] Kiro 패널에 **Specs**, **Agent Hooks**, **Steering** 영역이 보인다.
- [ ] 채팅 창에 **Spec** 버튼이 보인다.

---

# 2 단계: 스티어링(Steering) — 프로젝트 규칙 알려 주기

**목적** — AI가 모든 대화와 Spec에서 참고할 **제품 목적(product)·기술 스택(tech)·폴더 구조(structure)** 를 파일로 적는다. M01의 헌법, M02의 config.yaml 에 해당한다.

**입력** — 두 가지 방법 중 하나

**방법 A (권장, 빈 프로젝트): 파일을 직접 만든다** — Kiro 터미널에 아래 블록을 통째로 붙여 넣는다.

```bash
mkdir -p .kiro/steering

cat > .kiro/steering/product.md <<'EOF'
# 제품 (Product)

- 이름: 할 일 목록 (my-todo-kiro)
- 대상: 혼자 쓰는 개인 사용자. 초보자 학습용 예제
- 핵심 기능: 할 일 추가·완료·삭제, 전체/진행 중/완료 필터, 남은 개수 표시, 새로 고침 후에도 유지
- 범위 밖: 로그인, 여러 사용자, 서버 저장, 알림
- 문서·화면 문구·커밋 메시지는 모두 한국어로 쓴다
EOF

cat > .kiro/steering/tech.md <<'EOF'
# 기술 (Tech)

- 빌드 도구·프레임워크 없이 순수 HTML / CSS / JavaScript(ES 모듈)
- 저장: 브라우저 localStorage 만 사용. 외부로 데이터를 보내지 않는다
- 테스트: Node.js 내장 테스트 러너 `node --test`. 외부 테스트 라이브러리 금지
- package.json 에는 "type": "module" 만 두고 의존성은 없다 (npm install 불필요)
- 로컬 실행: `python3 -m http.server 8000` 후 http://localhost:8000
- 접근성: 모든 기능은 키보드만으로 사용 가능, 초점 테두리가 보여야 한다
EOF

cat > .kiro/steering/structure.md <<'EOF'
# 구조 (Structure)

- index.html            : 화면
- src/todo.js           : 할 일 데이터 처리 순수 함수 (DOM·localStorage 사용 금지, 테스트 대상)
- src/storage.js        : localStorage 읽기·쓰기 (localStorage 를 쓰는 유일한 파일)
- src/app.js            : 화면 그리기와 이벤트 처리
- src/style.css         : 스타일
- tests/todo.test.js    : src/todo.js 단위 테스트
- 새 로직은 먼저 src/todo.js 에 순수 함수로 만들고 테스트를 함께 추가한다
EOF
```

**방법 B: Kiro가 만들게 한다** — Kiro 패널 › **Steering** › **Generate Steering Docs** (또는 **+** › **Foundation steering files**). 코드가 이미 있는 프로젝트에서 유용하다. 빈 폴더에서는 내용이 거의 없으므로, 생성된 세 파일을 위 방법 A의 내용으로 고친다.

## 규칙

- 스티어링에는 **AI가 코드만 봐서는 알 수 없는 것**(목적, 범위 밖, 기술 제약, 규칙)을 적는다.
- 파일 맨 위에 front matter가 없으면 기본값 `inclusion: always` — **모든 대화에 자동 포함**된다.
- 특정 파일을 다룰 때만 쓰는 규칙은 front matter로 범위를 좁힐 수 있다.

```markdown
---
inclusion: fileMatch
fileMatchPattern: "tests/**/*.js"
---
# 테스트 작성 규칙
- 테스트 이름은 "함수명: 기대 동작" 형식의 한국어로 쓴다
```

| inclusion | 언제 포함되나 |
| --- | --- |
| `always` (기본) | 항상 |
| `fileMatch` | `fileMatchPattern` 에 맞는 파일을 다룰 때 |
| `manual` | 채팅에서 `#파일이름` 으로 부를 때만 |
| `auto` | 요청 내용이 `description` 과 맞을 때 (`name`, `description` 필수) |

- 모든 프로젝트에 공통인 규칙은 `~/.kiro/steering/`(전역)에 둘 수 있다. 전역과 프로젝트가 충돌하면 **프로젝트 규칙이 우선**한다.

## 산출물

```
my-todo-kiro/
└── .kiro/
    └── steering/
        ├── product.md
        ├── tech.md
        └── structure.md
```

## 체크리스트

- [ ] Kiro 패널 › **Steering** 에 `product`, `tech`, `structure` 세 파일이 보인다.
- [ ] 각 파일에 목적·범위 밖, 기술 제약·테스트·실행 방법, 폴더 구조가 적혀 있다.
- [ ] "문서·화면 문구는 한국어" 규칙이 들어 있다.
- [ ] 🖥️ `git add -A && git commit -m "chore: add Kiro steering"` 로 커밋했다.

---

# 3 단계: Spec 시작과 요구사항 (requirements.md)

**목적** — 만들 기능을 자연어로 설명해 Spec을 시작하고, Kiro가 만든 **요구사항(사용자 스토리 + EARS 인수 조건)** 을 검토·수정한다.

**입력**

1. 채팅 창의 **Spec** 버튼을 누른다. (또는 Kiro 패널 › Specs › **+**)
2. 무엇을 할지 물으면 **Feature** → **Requirements-First** 를 고른다.
3. 아래 내용을 입력한다.

```text
Spec 이름은 todo-list 로 해 줘. 혼자 쓰는 간단한 할 일 관리 웹 앱의 첫 버전이다.
- 사용자는 할 일을 입력해 목록 끝에 추가할 수 있다. Enter 키와 추가 버튼 모두 된다.
- 빈 값이나 공백만 입력하면 추가하지 않고 안내 문구를 보여 준다. 할 일은 최대 200자다.
- 할 일의 완료 여부를 체크하거나 해제할 수 있고, 필요 없는 할 일은 확인 창 없이 바로 삭제한다.
- 목록은 '전체 / 진행 중 / 완료' 로 걸러 볼 수 있고, 남은(완료하지 않은) 할 일 개수가 항상 보인다.
- 페이지를 새로 고치거나 브라우저를 다시 열어도 목록과 완료 상태가 그대로 남아 있어야 한다.
- 모든 기능은 키보드만으로 쓸 수 있어야 한다.
- 로그인, 여러 사용자, 마감일은 이번 범위가 아니다.
요구사항은 한국어로 쓰고, 인수 조건은 EARS 형식(WHEN … THE SYSTEM SHALL …)으로 써 줘.
```

4. `requirements.md` 가 열리면 읽어 본다. 고칠 점은 채팅으로 요청하거나 파일을 직접 고친다.

```text
요구사항 3번에 "같은 내용의 할 일이 이미 있으면 그대로 추가하되 안내 문구를 보여 준다" 를 추가해 줘.
```

5. (선택) 채팅 옵션이나 편집기의 **Continue** 드롭다운에서 **Analyze Requirements** 를 실행해 빠진 경우·모순을 점검한다.
6. 만족하면 채팅에서 다음 단계(설계)로 진행한다. (진행 버튼을 누르거나 "설계 단계로 진행해 줘" 라고 입력)

## 규칙

- 이 단계에서는 **무엇을·왜** 만 다룬다. 파일 이름·라이브러리 같은 기술 얘기는 4단계(설계)와 스티어링이 맡는다.
- 인수 조건 하나는 **테스트 하나로 확인할 수 있을 만큼** 구체적이어야 한다. "적절히", "빠르게" 같은 말이 있으면 숫자나 관찰 가능한 결과로 바꿔 달라고 한다.
- 요구사항을 승인하기 전에 범위 밖(로그인·여러 사용자·마감일)이 빠졌는지 확인한다.
- Spec 이름은 Kiro가 정할 수 있다. 다르게 만들어지면 그 이름으로 진행해도 되지만, 이 문서와 맞추려면 `todo-list` 로 바꿔 달라고 한다.

## 산출물

```
.kiro/specs/todo-list/
└── requirements.md
```

예시(발췌, 실제 출력은 매번 조금씩 다르다):

```markdown
### 요구사항 1: 할 일 추가

**사용자 스토리:** 사용자로서, 해야 할 일을 빠르게 적어 두고 싶다. 잊지 않기 위해서다.

#### 인수 조건

1. WHEN 사용자가 내용을 입력하고 Enter 키를 누르면 THE SYSTEM SHALL 목록 끝에 미완료 할 일로 추가한다
2. WHEN 사용자가 공백만 입력하고 추가하면 THE SYSTEM SHALL 할 일을 추가하지 않고 "할 일 내용을 입력해 주세요" 를 표시한다
3. WHEN 입력 내용이 200자를 넘으면 THE SYSTEM SHALL 추가하지 않고 글자 수 초과 안내를 표시한다
```

## 체크리스트

- [ ] `.kiro/specs/todo-list/requirements.md` 가 생겼다.
- [ ] 요구사항마다 **사용자 스토리**와 **EARS 형식 인수 조건**이 있다.
- [ ] 입력 규칙(빈 값·200자·중복), 완료, 즉시 삭제, 필터, 남은 개수, 새로 고침 유지, 키보드 사용이 모두 들어 있다.
- [ ] 범위 밖 항목이 요구사항에 섞여 있지 않다.
- [ ] 문서가 한국어다 (2단계 스티어링이 반영됨).

---

# 4 단계: 설계 (design.md)

**목적** — 승인한 요구사항을 바탕으로 Kiro가 만든 **기술 설계**를 검토한다. 스티어링(tech·structure)이 그대로 반영되었는지가 핵심이다.

**입력** — 3단계에서 진행하면 Kiro가 `design.md` 를 만든다. 읽어 보고 필요하면 수정을 요청한다.

```text
design.md 의 데이터 모델에서 할 일 id 는 문자열 대신 1부터 증가하는 정수로 바꿔 줘. 저장된 데이터가 깨졌을 때는 앱이 멈추지 않고 빈 목록으로 시작하도록 오류 처리에 추가해 줘.
```

만족하면 다음 단계(작업 목록)로 진행한다.

## 규칙

- 검토 순서: **구조(파일 나눔) → 데이터 모델 → 흐름 → 오류 처리 → 테스트 전략**
- 스티어링과 다른 기술(React, 외부 라이브러리, 서버 등)이 나오면 바로 지적한다. Kiro가 스티어링을 어긴 것이다.
- 설계를 바꾸다 **요구사항 자체가 바뀌면** 3단계 문서도 함께 고쳐 달라고 한다.

## 산출물

```
.kiro/specs/todo-list/
├── requirements.md
└── design.md          ← 개요, 아키텍처, 컴포넌트와 인터페이스, 데이터 모델,
                          (시퀀스 다이어그램), 오류 처리, 테스트 전략
```

## 체크리스트

- [ ] `design.md` 의 파일 구조가 스티어링 `structure.md` 와 같다 (`src/todo.js`, `src/storage.js`, `src/app.js`, `tests/todo.test.js`).
- [ ] 저장 방식이 localStorage, 테스트가 `node --test` 다.
- [ ] 데이터 모델(예: `{ id, text, completed }`)이 정의되어 있다.
- [ ] 저장 실패·데이터 손상 같은 오류 처리가 있다.
- [ ] 요구사항의 각 항목을 어떤 테스트로 확인할지 테스트 전략이 있다.

---

# 5 단계: 작업 목록 (tasks.md)

**목적** — 설계를 **번호 붙은 실행 단위 작업**으로 쪼갠 `tasks.md` 를 검토한다.

**입력** — 4단계에서 진행하면 Kiro가 `tasks.md` 를 만든다. 필요하면 요청한다.

```text
tasks.md 에서 각 기능 작업 바로 앞에 해당 순수 함수의 단위 테스트 작업이 오도록 순서를 바꿔 줘.
```

## 규칙

- 작업마다 **어떤 요구사항을 만족시키는지**(요구사항 번호)가 적혀 있는지 본다. 없는 요구사항이 있으면 작업이 빠진 것이다.
- 테스트 작업이 기능 작업과 함께 있는지 확인한다 (스티어링: 새 로직은 테스트와 함께).
- 문서를 직접 고쳤거나 요구사항·설계를 바꿨다면 `tasks.md` 의 **Sync Files** 로 작업 목록을 다시 맞춘다.

## 산출물

```
.kiro/specs/todo-list/
├── requirements.md
├── design.md
└── tasks.md
```

예시(발췌):

```markdown
- [ ] 1. 프로젝트 기본 구조 만들기
  - index.html, src/, tests/, package.json("type": "module") 생성
  - _요구사항: 전체_

- [ ] 2. 할 일 추가 로직
- [ ] 2.1 addTodo 단위 테스트 작성 (빈 값·공백·200자·중복)
  - _요구사항: 1.1, 1.2, 1.3_
- [ ] 2.2 src/todo.js 에 addTodo 구현
  - _요구사항: 1.1, 1.2, 1.3_
```

## 체크리스트

- [ ] `tasks.md` 의 모든 작업에 번호가 있고, 요구사항 번호가 연결되어 있다.
- [ ] 요구사항 문서의 모든 항목이 어떤 작업엔가 연결되어 있다.
- [ ] 테스트 작업이 포함되어 있다.
- [ ] 🖥️ `git add -A && git commit -m "docs: todo-list spec"` 로 구현 전 상태를 커밋했다.

---

# 6 단계: 작업 실행 — 앱 만들기

**목적** — `tasks.md` 의 작업을 실행해 코드를 만들고, 작업 상태를 완료로 바꾼다.

**입력** — `tasks.md` 를 연 편집기에서 둘 중 하나

- **하나씩**: 작업 항목(예: `1.`)을 클릭해 실행 → 결과를 확인하고 다음 작업
- **한꺼번에**: **Run all Tasks** — 서로 의존하지 않는 작업은 묶어서(wave) 동시에, 의존하는 작업은 순서대로 실행

채팅에서 특정 작업만 지시할 수도 있다.

```text
#spec:todo-list 작업 2.1 과 2.2 를 진행해 줘.
```

## 규칙

- 처음이라면 **하나씩** 실행하며 무엇이 만들어지는지 본다. 익숙해지면 Run all Tasks 를 쓴다.
- Kiro가 명령 실행(`node --test` 등)이나 파일 변경 승인을 물으면 내용을 확인하고 허용한다.
- 작업 상태는 **진행 중(In Progress) → 완료(Done)** 로 자동으로 바뀐다. 중간에 멈추면 남은 작업만 다시 실행하면 된다.
- 구현 중 설계를 바꿔야 하면 코드부터 고치지 말고 `#spec:todo-list` 로 **설계·요구사항을 먼저 고친 뒤** Sync Files → 실행한다.
- 이미 끝난 작업이 완료로 표시되지 않았다면 **Sync Files** 를 누르거나 "어떤 작업이 끝났는지 확인해 줘" 라고 요청한다.

## 산출물

```
my-todo-kiro/
├── index.html
├── package.json            {"type": "module"}
├── src/  todo.js  storage.js  app.js  style.css
├── tests/ todo.test.js
└── .kiro/specs/todo-list/tasks.md   ← 모든 작업 완료
```

## 체크리스트

- [ ] `tasks.md` 의 모든 작업이 완료로 표시되어 있다.
- [ ] 🖥️ `node --test` 가 `# fail 0` 으로 통과한다.
- [ ] [SAMPLE.md](SAMPLE.md) 의 순서대로 앱을 실행하고, 모든 시나리오가 요구사항대로 동작함을 확인했다.
- [ ] 🖥️ `git add -A && git commit -m "feat: todo list (Kiro spec todo-list)"`

---

# 7 단계: Agent Hook — 저장하면 테스트 자동 실행

**목적** — 반복 작업을 자동화한다. **에이전트가 `src/` 나 `tests/` 의 JavaScript 파일을 저장할 때마다 `node --test` 를 실행**하는 Hook을 만든다.

**입력**

1. Kiro 패널 › **Agent Hooks** › **+** → **Ask Kiro to create a hook**
2. 아래 내용을 입력한다.

```text
src 또는 tests 폴더의 .js 파일이 저장되면 프로젝트 루트에서 node --test 를 실행하는 hook 을 만들어 줘. 이름은 "저장 시 테스트 실행" 으로 해 줘.
```

3. Kiro가 보여 주는 설정(이벤트 종류, 파일 패턴, 동작)을 확인하고 저장한다.

Kiro가 만드는 파일은 대략 다음과 같다(예시 — 필드 값은 Kiro가 정한다):

```json
{
  "version": "v1",
  "hooks": [
    {
      "name": "저장 시 테스트 실행",
      "description": "src/ 또는 tests/ 의 .js 파일 저장 후 단위 테스트 실행",
      "trigger": "PostFileSave",
      "matcher": "^(src|tests)/.*\\.js$",
      "action": { "type": "command", "command": "node --test" },
      "timeout": 60
    }
  ]
}
```

4. 확인: 채팅에서 작은 수정을 요청해 Hook이 도는지 본다.

```text
src/todo.js 의 countActive 함수 위에 "진행 중인 할 일의 개수를 돌려준다" 라는 주석을 달아 줘.
```

## 규칙

- Hook의 동작은 두 가지다. **command** = 셸 명령 실행(테스트·린트), **agent** = 대화에 프롬프트를 넣어 AI에게 일을 시킴(예: "테스트 파일도 갱신해 줘").
- 파일 이벤트 Hook은 **에이전트가 파일을 만들거나 저장·삭제할 때** 동작한다. 패턴(matcher)을 좁게 잡아 불필요한 실행을 줄인다.
- 그 밖의 이벤트: 프롬프트 제출, 에이전트 응답 종료, 세션 시작, 도구 사용 전·후, **Spec 작업 실행 전·후** 등.
- Hook 파일도 코드처럼 git에 커밋해 팀과 공유한다.

## 산출물

```
.kiro/hooks/
└── <이름>.json        ← 예: run-tests-on-save.json
```

## 체크리스트

- [ ] Kiro 패널 › **Agent Hooks** 에 "저장 시 테스트 실행" 이 보이고 켜져 있다.
- [ ] `.kiro/hooks/` 에 JSON 파일이 생겼다.
- [ ] 에이전트가 `src/todo.js` 를 저장했을 때 `node --test` 가 자동으로 실행되고 결과가 보였다.
- [ ] 🖥️ 커밋했다.

---

# 8 단계: (도전) 기존 Spec에 마감일 기능 추가

**목적** — 이미 완성된 Spec을 **고쳐서** 기능을 늘린다. M02 OpenSpec이 델타 명세를 따로 만들었던 것과 달리, Kiro는 **같은 Spec 문서를 갱신하고 Sync Files 로 작업을 맞추는** 방식이다.

**입력** — 순서대로

1. 요구사항 추가

```text
#spec:todo-list 요구사항에 마감일 기능을 추가해 줘. 사용자는 할 일을 추가할 때 선택적으로 마감일을 지정할 수 있다. 마감일이 지난 미완료 할 일은 눈에 띄게 표시된다. 목록을 마감일이 가까운 순으로 정렬해 볼 수 있다. 예전에 저장된 마감일 없는 할 일도 그대로 보여야 한다. 알림은 범위 밖이다. 인수 조건은 EARS 형식으로 써 줘.
```

2. 설계 갱신

```text
#spec:todo-list 바뀐 요구사항에 맞게 design.md 를 갱신해 줘. 마감일은 HTML date 입력과 YYYY-MM-DD 문자열로 저장하고, 마감일 없는 기존 데이터도 읽을 수 있어야 한다.
```

3. `tasks.md` 를 열고 **Sync Files** → 새 요구사항에 해당하는 작업이 추가된다.
4. 새 작업 실행 (작업 클릭 또는 **Run all Tasks** — 미완료 작업만 실행된다)
5. 7단계 Hook이 테스트를 자동으로 돌리는지 확인하고, [SAMPLE.md 8단계](SAMPLE.md#8단계-도전-마감일-기능-써-보기)로 앱을 확인한다.

## 규칙

- 기존 기능의 요구사항을 바꾸지 않았는지 확인한다. 바뀌어야 한다면 바뀐 요구사항이 명시적으로 드러나게 고쳐 달라고 한다.
- 저장 데이터 형식이 바뀌므로 **예전 데이터 호환**(마감일 없는 할 일)을 요구사항·테스트에 반드시 넣는다.
- 기능이 크게 다르면 Spec을 새로 만든다 (Kiro 권장: **기능 하나에 Spec 하나**).

## 산출물

```
.kiro/specs/todo-list/
├── requirements.md   ← 마감일 요구사항 추가
├── design.md         ← 마감일 데이터·화면 설계 추가
└── tasks.md          ← Sync Files 로 새 작업 추가 → 실행 후 완료
```

## 체크리스트

- [ ] `requirements.md` 에 마감일 요구사항(EARS)이 추가되었다.
- [ ] `design.md` 에 마감일 저장 형식과 기존 데이터 호환 방법이 있다.
- [ ] Sync Files 후 새 작업이 생겼고 모두 완료되었다.
- [ ] `node --test` 가 통과하고, SAMPLE 8단계(마감일)와 5단계(기존 기능) 시나리오가 모두 동작한다.
- [ ] 🖥️ 커밋했다.

---

# 부록 A. 팀 규칙 스티어링 조각

`.kiro/steering/sdd-rules.md` 로 저장하면 Spec 밖에서 대화할 때도 같은 흐름을 지킨다. (front matter가 없으므로 항상 포함)

```markdown
# 스펙 주도 개발 규칙

- 동작을 바꾸는 요청을 받으면 코드를 바로 고치지 말고, 해당 Spec(.kiro/specs/<기능>/)의 requirements.md 부터 고치자고 제안한다.
- 요구사항의 인수 조건은 EARS 형식(WHEN … THE SYSTEM SHALL …)으로 쓴다.
- 요구사항·설계를 바꾼 뒤에는 tasks.md 를 Sync Files 로 맞춘 다음 구현한다.
- 구현은 tasks.md 의 순서와 번호를 따르고, 작업마다 관련 테스트를 함께 작성한다.
- 작업을 마치면 node --test 를 실행해 결과를 보고한다.
- 문서·화면 문구·커밋 메시지는 한국어로 쓴다.
```

> 다른 AI 도구와 규칙을 함께 쓰려면 프로젝트 루트의 `AGENTS.md` 에 같은 내용을 두어도 된다. Kiro는 `AGENTS.md` 를 항상 포함한다.

# 부록 B. 자주 겪는 문제

| 증상 | 원인 / 해결 |
| --- | --- |
| Kiro 패널이 안 보인다 | 왼쪽 활동 막대의 유령 아이콘 클릭. 그래도 없으면 메뉴 View 에서 Kiro 패널 열기 |
| `.kiro` 폴더가 Finder에 안 보인다 | 숨김 폴더. Finder `⌘ + Shift + .`, 터미널 `ls -a` |
| 요구사항이 영어로 나온다 | `.kiro/steering/product.md` 에 한국어 규칙이 있는지 확인. 프롬프트에 "한국어로" 를 덧붙인다 |
| 스티어링과 다른 기술(React 등)이 설계에 나온다 | `tech.md` 가 있는지, front matter를 `manual` 로 잘못 두지 않았는지 확인 후 "tech.md 를 따르도록 design.md 를 고쳐 줘" |
| Spec 폴더 이름이 문서와 다르다 | Kiro가 이름을 정했다. 그대로 진행하거나 처음 프롬프트에 "Spec 이름은 todo-list" 를 넣는다 |
| 요구사항을 고쳤는데 작업이 그대로다 | `tasks.md` 에서 **Sync Files** |
| 작업은 끝났는데 완료 표시가 안 된다 | **Sync Files** 또는 "#spec:todo-list 어떤 작업이 끝났는지 확인해 줘" |
| Hook이 실행되지 않는다 | Agent Hooks 에서 켜져 있는지, 파일 패턴이 실제 경로와 맞는지 확인. 파일 이벤트 Hook은 **에이전트가 저장한 파일**에 반응한다 |
| `node: command not found` (Hook·터미널) | Node.js 설치 후 Kiro를 다시 시작 |
| 브라우저 화면이 비어 있다 | `file://` 로 열면 ES 모듈이 막힌다. `python3 -m http.server 8000` 주소로 접속 |

# 부록 C. 용어 정리

| 용어 | 뜻 |
| --- | --- |
| Steering (스티어링) | AI에게 항상 알려 주는 프로젝트 규칙 파일. `.kiro/steering/*.md` |
| Foundation files | 기본 스티어링 3종: product.md(제품), tech.md(기술), structure.md(구조) |
| Spec | 기능 하나의 계획 묶음. `.kiro/specs/<기능>/` 의 requirements · design · tasks |
| Feature / Bugfix Spec | 새 기능용 / 버그 수정용 Spec |
| Requirements-First / Design-First | 요구사항부터 / 설계부터 시작하는 Spec 진행 방식 |
| Quick Spec | 승인 단계 없이 세 문서를 한 번에 만드는 방식 |
| EARS | WHEN … THE SYSTEM SHALL … 형식의 요구사항 작성법 |
| Analyze Requirements | 요구사항의 빈틈·모순 점검 |
| Run all Tasks / wave | 모든 미완료 작업 실행 / 동시에 실행되는 작업 묶음 |
| Sync Files | 요구사항·설계·작업 문서와 실제 상태를 다시 맞추기 |
| `#spec:<이름>` | 채팅에 해당 Spec 세 문서를 맥락으로 불러오기 |
| Agent Hook | 이벤트(파일 저장, 작업 완료 등)에 맞춰 명령·프롬프트를 자동 실행. `.kiro/hooks/*.json` |
| MCP | 외부 도구·API를 Kiro 에이전트에 연결하는 표준 |
