# M02 가이드 — Hermes Agent Hello World

> 목표: **설치 → 첫 대화 → 파일 만들기 → 기억시키기**까지, 명령어 몇 줄로 Hermes Agent를 처음 써 본다.
> 소요 시간: 약 20~30분 · 준비물: 인터넷이 되는 PC, LLM API 키 1개
> 참고: <https://github.com/nousresearch/hermes-agent>

---

# 개념

**Hermes Agent**는 Nous Research가 만든 무료 오픈소스 AI 에이전트입니다. 내 컴퓨터의 **터미널**에서 실행되며, ChatGPT처럼 대화할 수 있을 뿐 아니라 **직접 파일을 만들고 명령을 실행**할 수 있습니다.

| 일반 챗봇 | Hermes Agent |
|---|---|
| 답을 **알려 준다** | 답을 알려 주고, **직접 실행**까지 한다 (파일 생성, 명령 실행) |
| 대화가 끝나면 잊는다 | 중요한 내용을 **기억 파일**에 저장해 다음에도 기억한다 |
| 한 회사의 모델만 쓴다 | OpenRouter·OpenAI·Anthropic 등 **모델을 골라 쓴다** |

이번 튜토리얼에서 쓸 명령어는 이것뿐입니다.

| 명령어 | 하는 일 |
|---|---|
| `hermes` | 에이전트와 대화 시작 |
| `hermes model` | 사용할 AI 모델 고르기 |
| `hermes -c` | 지난 대화 이어서 하기 |
| `hermes doctor` | 문제가 생겼을 때 진단 |

대화창 안에서 쓰는 명령어(슬래시 명령)는 `/help`(도움말), `/new`(새 대화), `/quit`(종료) 세 개만 기억하면 됩니다.

> 💡 **표기 규칙**: 코드 블록의 `$`는 터미널 입력 표시이므로 `$` 뒤부터 입력합니다. `>`는 Hermes 대화창에 입력하는 문장입니다.

---

# 1 단계: 설치하기

터미널을 엽니다. (macOS: `Spotlight(⌘+Space)` → "터미널" / Windows: 시작 메뉴 → "PowerShell")

**macOS · Linux · WSL2**
```bash
$ curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
$ source ~/.zshrc        # macOS. Linux는 source ~/.bashrc
```

**Windows (PowerShell)**
```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```
설치가 끝나면 PowerShell 창을 닫고 새로 엽니다.

설치 확인:
```bash
$ hermes --version
```

## 규칙
- 설치 명령은 위 공식 주소만 사용한다.
- `command not found: hermes`가 나오면 터미널을 **닫았다가 다시 열고** 한 번 더 시도한다.

## 산출물
- `hermes` 명령이 실행되는 터미널

## 체크리스트
- [ ] `hermes --version`이 버전 번호를 출력한다.

---

# 2 단계: AI 모델 연결하기

Hermes는 "몸"이고, 실제로 생각하는 "두뇌"는 LLM(언어 모델)입니다. 두뇌를 연결해 줍니다.

1. API 키를 하나 준비합니다. 처음이라면 **OpenRouter**를 추천합니다. (한 키로 여러 모델 사용 가능)
   - <https://openrouter.ai/keys> → 로그인 → **Create Key** → 키 복사 (`sk-or-...`)
   - 소액(예: 5달러)을 충전해 둡니다.

2. 모델 선택 화면을 엽니다.
   ```bash
   $ hermes model
   ```
3. 목록에서 **OpenRouter** 번호를 입력하고 Enter → API 키 붙여 넣기 → 원하는 모델 선택.

## 규칙
- API 키는 남에게 보여 주거나 캡처해서 공유하지 않는다.
- 처음에는 추천(기본) 모델을 그대로 고른다.

## 산출물
- 연결된 AI 모델 (설정은 `~/.hermes/` 폴더에 자동 저장됨)

## 체크리스트
- [ ] `hermes model`을 다시 실행했을 때 고른 Provider 옆에 `currently active`가 보인다.

---

# 3 단계: Hello World — 첫 대화

```bash
$ hermes
```
배너에 내가 고른 모델 이름이 보이면 준비 완료입니다. 다음과 같이 입력해 봅니다.

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

# 4 단계: 에이전트에게 일 시키기 — 파일 만들고 실행하기

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

# 5 단계: 기억시키기 — 다음 대화에서도 기억하나?

일반 챗봇과 달리 Hermes는 기억을 **파일로 저장**합니다.

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
$ cat ~/.hermes/memories/USER.md
```

## 규칙
- 기억시킬 내용은 "**기억해줘:**"로 시작해 분명하게 말한다. 지나가듯 한 말은 저장되지 않을 수 있다.
- 비밀번호·API 키 같은 민감 정보는 기억시키지 않는다.

## 산출물
- `~/.hermes/memories/USER.md`에 저장된 내 정보

## 체크리스트
- [ ] `/new` 후에도 에이전트가 내 이름을 기억한다.
- [ ] `USER.md` 파일에 내용이 들어 있다.

---

# 6 단계: 이어서 하기 · 한 줄 질문 · 문제 해결

**지난 대화 이어서 하기**
```bash
$ hermes -c
```
```text
> 아까 만든 hello.py를 "Hello, 선아!"로 바꿔줘.
```

**대화창 없이 한 번만 묻기** (답만 출력하고 끝남)
```bash
$ hermes -z "Hello World를 영어·일본어·스페인어로 알려줘"
```

**문제가 생기면**
```bash
$ hermes doctor
```

| 증상 | 해결 |
|---|---|
| `command not found: hermes` | 터미널을 닫았다 다시 열기 |
| 답이 오지 않거나 인증 오류 | `hermes model`로 API 키 다시 입력, OpenRouter 잔액 확인 |
| 이상하게 동작함 | `hermes doctor` 실행 후 안내 따르기 |
| 최신 버전으로 올리고 싶음 | `hermes update` |

## 규칙
- 오류가 나면 먼저 `hermes doctor`를 실행하고, 그 결과를 읽은 뒤 다음 행동을 정한다.

## 산출물
- 이어진 대화로 수정된 `hello.py`

## 체크리스트
- [ ] `hermes -c`로 이전 대화를 이어서 했다.
- [ ] `hermes -z`로 한 줄 질문에 답을 받았다.
- [ ] `hermes doctor`를 한 번 실행해 보았다.

---

## 다음 단계

Hello World를 마쳤다면 [M01](../M01/README.md)에서 Telegram·GitHub와 연결해 **PR 자동 리뷰 에이전트**를 만들어 봅니다.
