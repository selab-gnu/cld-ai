# M01 가이드 — Hermes Agent Hello World

> 목표: **설치 → 첫 대화 → 파일 만들기 → 기억시키기**까지, 명령어 몇 줄로 Hermes Agent를 처음 써 본다.
> 소요 시간: 약 20분 · 준비물: 인터넷이 되는 PC
> 참고: <https://github.com/nousresearch/hermes-agent>

---

# 개념

**Hermes Agent**는 Nous Research가 만든 무료 오픈소스 AI 에이전트입니다. 내 컴퓨터의 **터미널**에서 실행되며, 대화만 하는 것이 아니라 **직접 파일을 만들고 명령을 실행**할 수 있습니다.

| 일반 챗봇 | Hermes Agent |
|---|---|
| 답을 **알려 준다** | 답을 알려 주고, **직접 실행**까지 한다 (파일 생성, 명령 실행) |
| 대화가 끝나면 잊는다 | 중요한 내용을 **기억 파일**에 저장해 다음에도 기억한다 |

이번 튜토리얼에서 쓰는 명령어는 이것뿐입니다.

| 명령어 | 하는 일 |
|---|---|
| `hermes` | 에이전트와 대화 시작 |
| `hermes -c` | 지난 대화 이어서 하기 |
| `hermes doctor` | 문제가 생겼을 때 진단 |

대화창 안에서는 `/help`(도움말), `/new`(새 대화), `/quit`(종료) 세 개만 기억하면 됩니다.

> 💡 **표기 규칙**: 코드 블록의 `$`는 터미널 입력 표시이므로 `$` 뒤부터 입력합니다. `>`는 Hermes 대화창에 입력하는 문장입니다.

---

# 1 단계: 설치하기

터미널을 엽니다. (macOS: `⌘+Space` → "터미널" / Windows: 시작 메뉴 → "PowerShell")

**macOS · Linux · WSL2**
```bash
$ curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

**Windows (PowerShell)**
```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

설치가 끝나면 셸을 다시 불러옵니다.
```bash
$ source ~/.zshrc        # macOS
$ source ~/.bashrc       # Linux · WSL2
```
Windows는 PowerShell 창을 닫고 새로 엽니다.

## 규칙
- 설치 명령은 위 공식 주소만 사용한다.
- `command not found: hermes`가 나오면 터미널을 **닫았다가 다시 열고** 한 번 더 시도한다.

## 산출물
- `hermes` 명령이 실행되는 터미널

## 체크리스트
- [ ] `hermes --version`이 버전 번호를 출력한다.

---

# 2 단계: Hello World — 첫 대화

```bash
$ hermes
```
배너가 뜨고 입력 프롬프트가 나오면 준비 완료입니다. 다음과 같이 입력해 봅니다.

```text
> 안녕! "Hello, World!"라고 한 줄로만 대답해줘.
```
```text
Hello, World!
```

이어서 몇 가지를 더 해 봅니다.
```text
> 너는 무엇을 할 수 있는지 3줄로 소개해줘.
> /help
```
`/help`를 입력하면 쓸 수 있는 명령어 목록이 나옵니다. 대화를 끝낼 때는 `/quit`(또는 `Ctrl+C`)을 입력합니다.

## 규칙
- 질문은 **구체적이고 확인하기 쉽게** 한다. ("뭐든 해줘" ✗ → "3줄로 소개해줘" ✓)

## 산출물
- 에이전트와 나눈 첫 대화

## 체크리스트
- [ ] 에이전트가 `Hello, World!`라고 답했다.
- [ ] `/help`로 명령어 목록을 확인했다.
- [ ] `/quit`으로 대화를 종료했다.

---

# 3 단계: 에이전트에게 일 시키기 — 파일 만들고 실행하기

Hermes의 진짜 차이는 **직접 실행**한다는 점입니다. 연습 폴더를 만들고 그 안에서 시작합니다.

```bash
$ mkdir hermes-hello
$ cd hermes-hello
$ hermes
```

```text
> 현재 폴더에 hello.py 파일을 만들어줘. 실행하면 "Hello, Hermes!"를 출력하게 하고, 만든 다음 직접 실행해서 결과를 보여줘.
```

에이전트가 **파일 생성 → 명령 실행** 도구를 쓰는 과정이 화면에 나타납니다. 명령 실행 전에 승인을 물으면 내용을 읽어 보고 허용합니다.

```text
Hello, Hermes!
```

`/quit`으로 나온 뒤 내 눈으로도 확인합니다.
```bash
$ ls
hello.py
$ python3 hello.py        # Windows는 python hello.py
Hello, Hermes!
```

## 규칙
- 에이전트는 실제로 파일을 만들고 지울 수 있다. **연습 전용 폴더**에서 시작한다.
- 승인을 묻는 명령은 **읽어 보고** 허용한다. 모르는 삭제(`rm`) 명령은 거절한다.

## 산출물
- `hermes-hello/hello.py`

## 체크리스트
- [ ] `hello.py` 파일이 생겼다.
- [ ] 직접 실행했을 때 `Hello, Hermes!`가 출력된다.

---

# 4 단계: 기억시키기 — 다음 대화에서도 기억하나?

Hermes는 기억을 **파일로 저장**합니다.

```bash
$ hermes
```
```text
> 기억해줘: 내 이름은 선아이고, 답변은 항상 한국어로 짧게 해줘.
```
에이전트가 "기억했다"고 답하면 **새 대화**를 시작해 확인합니다.
```text
> /new
> 내 이름이 뭐야?
```
```text
선아님이에요.
```

저장된 기억은 파일로 직접 볼 수 있습니다. (`/quit` 후)
```bash
$ cat ~/.hermes/memories/MEMORY.md
```

## 규칙
- 기억시킬 내용은 "**기억해줘:**"로 시작해 분명하게 말한다. 지나가듯 한 말은 저장되지 않을 수 있다.
- 비밀번호·API 키 같은 민감 정보는 기억시키지 않는다.

## 산출물
- `~/.hermes/memories/MEMORY.md`에 저장된 내 정보

## 체크리스트
- [ ] `/new` 후에도 에이전트가 내 이름을 기억한다.
- [ ] `MEMORY.md` 파일에 내용이 들어 있다.

---

# 5 단계: 이어서 하기 · 문제 해결

**지난 대화 이어서 하기**
```bash
$ hermes -c
```
```text
> 아까 만든 hello.py를 "Hello, 선아!"로 바꿔줘.
```

**문제가 생기면**
```bash
$ hermes doctor
```

| 증상 | 해결 |
|---|---|
| `command not found: hermes` | 터미널을 닫았다 다시 열기 |
| 이상하게 동작하거나 오류가 남 | `hermes doctor` 실행 후 안내 따르기 |
| 최신 버전으로 올리고 싶음 | `hermes update` |

## 규칙
- 오류가 나면 먼저 `hermes doctor`를 실행하고, 그 결과를 읽은 뒤 다음 행동을 정한다.

## 산출물
- 이어진 대화로 수정된 `hello.py`

## 체크리스트
- [ ] `hermes -c`로 이전 대화를 이어서 했다.
- [ ] `hermes doctor`를 한 번 실행해 보았다.

---

## 다음 단계: Claude 모델로 바꾸기

Hermes는 "몸"이고, 실제로 생각하는 "두뇌"는 AI 모델입니다. 이번에는 두뇌를 Anthropic의 **Claude**로 바꿔 봅니다. 방법은 두 가지입니다.

| 방법 | 언제 쓰나 |
|---|---|
| **A. `hermes model`** (터미널) | Claude를 **처음** 연결할 때, 기본 모델로 계속 쓰고 싶을 때 |
| **B. `/model`** (대화창 안) | 대화하는 도중에 모델을 **바로 바꾸고** 싶을 때 |

> 💡 `/model`은 이미 연결해 둔 Provider 사이에서만 바꿀 수 있습니다. Claude를 처음 쓴다면 **A부터** 진행합니다.

### 준비: Anthropic API 키 발급

1. <https://console.anthropic.com/> 에 접속해 로그인(회원가입)합니다.
2. **Settings → Billing**에서 크레딧을 충전합니다. (예: 5달러)
3. **Settings → API Keys → Create Key**를 누르고 이름(예: `hermes`)을 입력합니다.
4. `sk-ant-...`로 시작하는 키를 **복사해 둡니다.** (창을 닫으면 다시 볼 수 없습니다.)

> Claude **Max** 요금제를 쓰고 Claude Code에 로그인되어 있다면, API 키 대신 아래 4번에서 **OAuth(Claude Code 로그인)** 방식을 고를 수 있습니다.

### A. `hermes model`로 바꾸기

**① 모델 선택 화면 열기** — 대화 중이라면 `/quit`으로 나온 뒤 터미널에 입력합니다.
```bash
$ hermes model
```

**② 현재 상태 확인** — 맨 위에 지금 쓰는 모델과 Provider가 보입니다.
```text
Current model:    openai/gpt-5.4
Active provider:  OpenRouter

Select provider:
Select by number, Enter to confirm.
  (o) 1. Nous Portal
  (●) 2. OpenRouter (Pay-per-use API aggregator)  ← currently active
  ...
  (o) 6. Anthropic (Claude models via API key or Claude Code)
  (o) 7. OpenAI
  ...
```

**③ Anthropic 선택** — 목록에서 **Anthropic** 번호(위 화면에서는 `6`)를 입력하고 Enter를 누릅니다.
```text
6
```

**④ 인증 방식 선택** — **API key**를 고르고, 준비 단계에서 복사한 키를 붙여 넣은 뒤 Enter를 누릅니다.
```text
sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx
```
(붙여 넣어도 화면에 글자가 보이지 않을 수 있습니다. 정상입니다.)

**⑤ 모델 선택** — Claude 모델 목록이 나오면 번호로 고릅니다. 처음에는 **Sonnet** 계열(예: `claude-sonnet-4-6`)을 추천합니다. 빠르고 비용이 적당합니다.

**⑥ 확인** — `hermes model`을 다시 실행해 Anthropic 옆에 `currently active`가 붙어 있는지 봅니다. 확인했으면 `Ctrl+C`로 빠져나옵니다.
```text
Active provider:  Anthropic
  (●) 6. Anthropic (Claude models via API key or Claude Code)  ← currently active
```

**⑦ 대화로 확인**
```bash
$ hermes
```
```text
> 지금 너는 어떤 회사의 어떤 모델이야? 한 줄로 답해줘.
```
→ Anthropic의 Claude라고 답하면 성공입니다.

### B. 대화 중에 `/model`로 바꾸기

**① Hermes 실행**
```bash
$ hermes
```

**② `/model` 입력** — 대화창에 슬래시 명령을 입력하고 Enter를 누릅니다.
```text
> /model
```

**③ Anthropic 선택** — Provider 목록이 나오면 **Anthropic**을 고릅니다. (방향키 또는 번호 입력 → Enter)

**④ 모델 선택** — Claude 모델 목록에서 원하는 모델을 고르고 Enter를 누릅니다.

**⑤ 확인** — 바로 질문해서 바뀌었는지 확인합니다.
```text
> 지금 너는 어떤 모델이야?
```

> ⌨️ **빠른 방법**: 목록을 거치지 않고 `/model provider:모델이름` 형식으로 한 번에 바꿀 수도 있습니다.
> ```text
> > /model anthropic:claude-sonnet-4-6
> ```

## 규칙
- API 키는 남에게 보여 주거나 캡처해서 공유하지 않는다. 유출되면 Console에서 바로 **삭제(Revoke)** 한다.
- 비용이 걱정되면 Console의 **Billing → Limits**에서 월 사용 한도를 먼저 정한다.
- `/model`로 바꾼 모델은 **지금 대화에만** 적용될 수 있다. 계속 쓸 기본 모델은 `hermes model`로 정한다.

## 산출물
- Anthropic(Claude)으로 연결된 Hermes

## 체크리스트
- [ ] Anthropic Console에서 API 키를 발급했다.
- [ ] `hermes model` 화면에서 Anthropic이 `currently active`이다.
- [ ] 대화창에서 `/model`로 모델 목록을 열어 보았다.
- [ ] "어떤 모델이야?"라고 물었을 때 Claude라고 답한다.

> 화면의 메뉴 문구와 번호는 Hermes 버전에 따라 조금 다를 수 있습니다. 목록에서 **Anthropic**이라는 글자를 찾아 고르면 됩니다.


