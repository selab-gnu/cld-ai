# M01 가이드 — Hermes Agent로 GitHub PR 코드 리뷰 에이전트 만들기

> 대상: 터미널을 처음 써 보는 초보자도 따라 할 수 있도록 작성했습니다.
> 소요 시간: 약 60~90분 · 준비물: 인터넷 연결된 PC(macOS / Linux / Windows), GitHub 계정, Telegram 계정, LLM API 키(OpenRouter·OpenAI·Anthropic 등 중 1개)

---

# 개념

## Hermes Agent란?

Hermes Agent는 Nous Research가 만든 **오픈소스 AI 에이전트**입니다. 내 컴퓨터(또는 서버)에서 실행되며, 대화·도구 사용·정기 작업·외부 이벤트(웹훅) 처리를 하나의 프로그램에서 해냅니다.

에이전트가 일하는 흐름은 다음 6단계입니다.

```
1. 유저 입력 ─▶ 2. 추론 · 도구 사용 ─▶ 3. 성공적으로 실행
                                              │
6. 다음 작업에서 재사용(skill) ◀─ 5. Persistent Memory에 저장 ◀─ 4. SKILL.md 생성
```

한 번 성공한 작업 방법을 `SKILL.md`로 정리해 기억에 저장하고, 다음에 비슷한 일이 오면 그 스킬을 꺼내 씁니다. 그래서 **쓸수록 똑똑해지는(자가 개선형) 에이전트**라고 부릅니다.

## Hermes Agent의 장점

| 장점 | 설명 |
|---|---|
| LLM Provider 자유 변경 | OpenRouter, OpenAI, Anthropic, Gemini, 로컬 모델(LM Studio) 등을 `hermes model` 한 줄로 바꿀 수 있습니다. |
| 자가 개선형 스킬 시스템 | 성공한 작업을 스킬로 저장하고 재사용합니다. |
| 상시 실행 게이트웨이 | `hermes gateway`를 켜 두면 정기 작업(cron)을 돌리고, Telegram·Slack 같은 메신저로 언제든 대화할 수 있습니다. |

## 이번 모듈에서 만드는 것: GitHub PR 리뷰 에이전트

Hermes 공식 튜토리얼의 활용 예제입니다. GitHub 저장소에 Pull Request(PR)가 열리면 **에이전트가 자동으로 코드를 읽고 리뷰 댓글을 남깁니다.** 결과는 Telegram으로도 받아볼 수 있습니다.

```
 [개발자]                [GitHub]                    [내 PC]
  PR 생성  ───▶  Webhook 발송 ───▶  ngrok 공개 URL ───▶  hermes gateway (포트 8644)
                                                          │
                                                          ├─ gh pr diff 로 변경 코드 가져오기
                                                          ├─ LLM이 리뷰 작성
                                                          └─▶ GitHub PR 댓글  /  Telegram 메시지
```

| 구성 요소 | 역할 |
|---|---|
| **Hermes Agent** | 리뷰를 수행하는 AI 에이전트 본체 |
| **LLM Provider** | 실제로 코드를 읽고 판단하는 언어 모델 |
| **GitHub CLI (`gh`)** | 에이전트가 PR의 diff를 가져오고 댓글을 다는 도구 |
| **ngrok** | 내 PC의 8644 포트를 인터넷에서 접근 가능한 주소로 열어 주는 터널 |
| **Telegram Bot** | 에이전트와 메신저로 대화하고 결과를 받는 채널 |
| **GitHub Webhook** | PR 이벤트가 생기면 Hermes에 알려 주는 GitHub 설정 |

## 전체 단계 한눈에 보기

| 단계 | 할 일 | 산출물 |
|---|---|---|
| 1 | Hermes Agent 설치 | `hermes` 명령 실행 가능 |
| 2 | LLM Provider 설정 | `hermes model`로 모델 선택 완료 |
| 3 | GitHub CLI 설치·로그인 | `gh auth status` 성공 |
| 4 | ngrok 설치·공개 URL 발급 | `https://xxxx.ngrok-free.app` 주소 |
| 5 | Telegram 봇 생성·`.env` 설정 | 봇 토큰 + 내 Chat ID 등록 |
| 6 | `config.yaml`에 웹훅 라우트 작성 | `github-pr-review` 라우트 |
| 7 | GitHub Webhook 등록·게이트웨이 실행·테스트 | PR에 자동 리뷰 댓글 |

> 💡 **표기 규칙**
> - `$`로 시작하는 줄은 macOS/Linux 터미널, `PS>`로 시작하는 줄은 Windows PowerShell에 입력합니다. (`$`, `PS>` 자체는 입력하지 않습니다.)
> - `<꺾쇠>` 안의 값은 본인 값으로 바꿉니다.
> - 설정 폴더 위치: macOS/Linux는 `~/.hermes/`, Windows는 `%LOCALAPPDATA%\hermes\` (예: `C:\Users\<사용자명>\AppData\Local\hermes\`)

---

# 1 단계: Hermes Agent 설치

**목적** 내 컴퓨터에 Hermes Agent를 설치하고 첫 대화를 해 본다.
**입력** 인터넷 연결, 터미널(macOS: 터미널 앱 / Windows: PowerShell)

## 따라 하기

1. 공식 사이트 <https://hermes-agent.nousresearch.com/> 에서 OS별 설치 방법을 확인합니다. PR 리뷰 에이전트를 **운영할 컴퓨터**에 설치해야 합니다.

2. 설치 명령을 실행합니다.

   **macOS / Linux / WSL2**
   ```bash
   $ curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
   ```

   **Windows (PowerShell)**
   ```powershell
   PS> iex (irm https://hermes-agent.nousresearch.com/install.ps1)
   ```

   > 설치 스크립트가 Python·uv 등 필요한 것을 알아서 받습니다. 직접 Python을 설치할 필요는 없습니다.

3. 셸을 새로 고칩니다. (터미널 창을 닫았다가 다시 열어도 됩니다.)
   ```bash
   $ source ~/.zshrc     # macOS 기본 셸
   $ source ~/.bashrc    # Linux / WSL
   ```

4. 설치를 확인합니다.
   ```bash
   $ hermes --version
   $ hermes doctor        # 빠진 구성 요소가 있으면 고치는 방법까지 알려 줌
   ```

5. (선택) 전체 설정 마법사를 한 번 돌려 봅니다. 2단계에서 모델을 따로 설정하므로 건너뛰어도 됩니다.
   ```bash
   $ hermes setup
   ```

## 규칙

- 에이전트를 **상시 켜 둘 컴퓨터**에 설치한다. (노트북을 닫으면 PR 리뷰도 멈춘다.)
- 설치 스크립트는 반드시 **공식 도메인**(`hermes-agent.nousresearch.com`)에서 받는다.
- `hermes` 명령을 찾을 수 없다면 셸을 새로 고친 뒤 다시 시도하고, 그래도 안 되면 `hermes doctor` 결과를 먼저 확인한다.

## 산출물

- 터미널에서 실행 가능한 `hermes` 명령
- 설정 폴더 `~/.hermes/` (Windows: `%LOCALAPPDATA%\hermes\`)

## 체크리스트

- [ ] `hermes --version`이 버전 번호를 출력한다.
- [ ] `hermes doctor`에 치명적 오류가 없다.
- [ ] 설정 폴더(`~/.hermes/`)가 생성된 것을 확인한다.

---

# 2 단계: LLM Provider 설정

**목적** 에이전트의 "두뇌"가 될 언어 모델을 연결한다.
**입력** LLM API 키 1개 (예: OpenRouter, OpenAI, Anthropic 중 하나)

## 따라 하기

1. 사용할 Provider에서 API 키를 발급합니다.
   - OpenRouter: <https://openrouter.ai/keys> (여러 모델을 한 키로 사용 가능 — 초보자에게 추천)
   - OpenAI: <https://platform.openai.com/api-keys>
   - Anthropic: <https://console.anthropic.com/>

2. 모델 선택 마법사를 실행합니다.
   ```bash
   $ hermes model
   ```
   다음과 같은 화면이 나옵니다.
   ```
   Current model:    openai/gpt-5.4
   Active provider:  OpenRouter

   Select provider:
   Select by number, Enter to confirm.
     (o) 1. Nous Portal
     (●) 2. OpenRouter (Pay-per-use API aggregator)  ← currently active
     (o) 3. Mixture of Agents
     (o) 6. Anthropic (Claude models via API key or Claude Code)
     (o) 7. OpenAI
     ...
   ```

3. 번호를 입력해 Provider를 고르고, 안내에 따라 **API 키 입력 → 모델 선택**을 진행합니다.

4. 키가 `.env`에 저장되었는지 확인합니다. (직접 넣어도 됩니다.)
   ```bash
   # ~/.hermes/.env 예시 (사용하는 Provider의 줄만 있으면 됨)
   OPENROUTER_API_KEY=sk-or-xxxxxxxx
   # OPENAI_API_KEY=sk-xxxxxxxx
   ```

5. 첫 대화로 동작을 확인합니다.
   ```bash
   $ hermes
   > 안녕! 너는 어떤 모델이야? 한 문장으로 답해줘.
   ```
   답이 오면 성공입니다. 종료는 `/exit` 또는 `Ctrl+C`.

## 규칙

- API 키는 **`.env` 파일에만** 저장한다. `config.yaml`, 코드, GitHub에 절대 올리지 않는다.
- 코드 리뷰용이므로 **도구 사용(tool use)을 지원하는 모델**을 고른다. (너무 작은 로컬 모델은 `gh` 명령 실행에 실패할 수 있다.)
- 사용량 과금형 Provider는 대시보드에서 **사용 한도(budget limit)** 를 먼저 설정한다.

## 산출물

- 활성화된 Provider와 모델 (`hermes model` 화면에 `currently active` 표시)
- `~/.hermes/.env`에 저장된 LLM API 키

## 체크리스트

- [ ] `hermes model` 화면에서 원하는 Provider가 `currently active`로 표시된다.
- [ ] `hermes` 대화창에서 질문에 대한 답을 받았다.
- [ ] API 키가 `.env` 외의 곳에 적혀 있지 않은지 확인한다.

---

# 3 단계: GitHub CLI 설치 및 로그인

**목적** 에이전트가 PR의 변경 코드(diff)를 읽고 댓글을 달 수 있도록 GitHub 권한을 준다.
**입력** GitHub 계정, 리뷰할 저장소의 **관리자(Admin) 권한**

## 따라 하기

1. <https://cli.github.com/> 에서 GitHub CLI(`gh`)를 설치합니다.
   ```bash
   $ brew install gh          # macOS (Homebrew)
   PS> winget install GitHub.cli   # Windows
   ```
   Linux는 사이트의 배포판별 안내를 따릅니다.

2. 로그인합니다.
   ```bash
   $ gh auth login
   ```
   질문에 다음과 같이 답하면 가장 쉽습니다.
   ```
   ? Where do you use GitHub?            GitHub.com
   ? What is your preferred protocol?    HTTPS
   ? Authenticate Git with your GitHub credentials?  Yes
   ? How would you like to authenticate? Login with a web browser
   ```
   화면에 나온 8자리 코드를 브라우저에 입력하면 완료됩니다.

3. 로그인 상태를 확인합니다.
   ```bash
   $ gh auth status
   ✓ Logged in to github.com account <내아이디>
   ```

4. 실제로 PR diff를 가져올 수 있는지 시험합니다. (아무 공개 저장소의 PR 번호로 시험 가능)
   ```bash
   $ gh pr list --repo <owner>/<repo>
   $ gh pr diff <PR번호> --repo <owner>/<repo>
   ```

## 규칙

- `gh`는 **`hermes gateway`를 실행할 같은 컴퓨터, 같은 사용자 계정**에서 로그인한다.
- 리뷰 댓글은 로그인한 계정 이름으로 달린다. 팀에서 쓸 때는 봇용 GitHub 계정을 따로 만드는 것을 권장한다.
- 웹훅을 등록하려면 저장소 **Admin 권한**이 필요하다. 연습은 본인 소유 저장소로 한다.

## 산출물

- 로그인된 GitHub CLI (`gh auth status` 성공)

## 체크리스트

- [ ] `gh --version`이 출력된다.
- [ ] `gh auth status`에 `Logged in`이 표시된다.
- [ ] `gh pr diff`로 PR의 변경 내용이 출력된다.

---

# 4 단계: ngrok 설치 및 공개 URL 발급

**목적** GitHub가 내 컴퓨터의 Hermes(포트 8644)에 이벤트를 보낼 수 있도록 인터넷 주소를 만든다.
**입력** ngrok 계정(무료)

> 왜 필요한가요? 내 PC는 보통 공유기 안쪽에 있어서 GitHub가 직접 접속할 수 없습니다. ngrok은 `https://xxxx.ngrok-free.app` → `내 PC:8644`로 연결해 주는 터널입니다.

## 따라 하기

1. <https://dashboard.ngrok.com/get-started/setup> 에서 회원가입·로그인 후 OS에 맞게 ngrok을 설치합니다.
   ```bash
   $ brew install ngrok            # macOS
   PS> winget install ngrok.ngrok  # Windows
   ```

2. 대시보드 왼쪽 메뉴 **Getting Started → Your Authtoken**에서 토큰을 **Copy** 합니다.

3. 토큰을 등록합니다.
   ```bash
   $ ngrok config add-authtoken <복사한_AUTHTOKEN>
   ```

4. 터널을 엽니다. (**이 터미널 창은 계속 켜 둡니다.**)
   ```bash
   $ ngrok http 8644
   ```
   화면에 다음과 같은 줄이 나옵니다.
   ```
   Forwarding   https://a1b2c3d4e5f6.ngrok-free.app -> http://localhost:8644
   ```
   이 `https://...ngrok-free.app` 주소를 메모장에 복사해 둡니다. 7단계에서 사용합니다.

## 규칙

- 포트 번호는 `config.yaml`의 `port`(기본 **8644**)와 반드시 같아야 한다.
- 무료 플랜은 ngrok을 **다시 켤 때마다 주소가 바뀔 수 있다.** 주소가 바뀌면 GitHub Webhook의 Payload URL도 고쳐야 한다. (대시보드의 **Domains** 메뉴에서 무료 고정 도메인을 받아 `ngrok http --url=<고정도메인> 8644`로 쓰면 편하다.)
- Authtoken은 비밀번호처럼 다룬다.

## 산출물

- 공개 URL: `https://<랜덤>.ngrok-free.app`

## 체크리스트

- [ ] `ngrok config add-authtoken` 이 `Authtoken saved` 를 출력했다.
- [ ] `ngrok http 8644` 화면에 `Forwarding https://...` 주소가 보인다.
- [ ] 공개 URL을 메모해 두었다.

---

# 5 단계: Telegram 봇 생성 및 `.env` 설정

**목적** 메신저로 에이전트와 대화하고, 리뷰 결과를 휴대폰으로 받을 수 있게 한다.
**입력** Telegram 계정 (휴대폰 앱 또는 <https://web.telegram.org>)

## 따라 하기

### 5-1. 봇 만들기 (BotFather)

1. Telegram 검색창에서 **`@BotFather`** (파란 체크 표시가 있는 공식 계정)를 찾아 대화를 엽니다.
2. `/newbot` 을 보냅니다.
3. 봇의 **표시 이름**을 입력합니다. 예: `PR bot`
4. 봇의 **사용자명**을 입력합니다. 반드시 `bot`으로 끝나야 합니다. 예: `myname_PR_bot`
5. `Done! Congratulations on your new bot.` 메시지 안의 **HTTP API 토큰**(`123456789:AA...` 형태)을 복사해 따로 저장합니다.
6. 메시지의 `t.me/<봇사용자명>` 링크를 눌러 **내 봇과 대화방을 열고 `/start`를 한 번 보냅니다.** (먼저 말을 걸어야 봇이 나에게 메시지를 보낼 수 있습니다.)

### 5-2. 내 Chat ID 확인

1. <https://t.me/userinfobot> 에 접속해 대화를 시작합니다.
2. 답장에 나오는 `Id: 8661840581` 같은 **숫자**가 내 Chat ID입니다. 복사해 둡니다.

### 5-3. `.env`에 등록

`~/.hermes/.env` (Windows: `%LOCALAPPDATA%\hermes\.env`) 파일을 텍스트 편집기로 열고 다음 줄을 채웁니다.

```bash
$ open -e ~/.hermes/.env          # macOS (텍스트 편집기로 열기)
PS> notepad $env:LOCALAPPDATA\hermes\.env   # Windows
```

```dotenv
# Telegram Bot Token - From @BotFather (https://t.me/BotFather)
TELEGRAM_BOT_TOKEN=123456789:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_ALLOWED_USERS=8661840581

# LLM API 키 (2단계에서 이미 들어가 있으면 그대로 둠)
OPENROUTER_API_KEY=sk-or-xxxxxxxx
```

| 항목 | 넣을 값 |
|---|---|
| `TELEGRAM_BOT_TOKEN` | 5-1에서 받은 봇 HTTP API 토큰 |
| `TELEGRAM_ALLOWED_USERS` | 5-2에서 확인한 내 Chat ID (여러 명이면 쉼표로 구분) |

> 대화형 설정을 원하면 `hermes gateway setup` 을 실행해 Telegram을 선택해도 같은 값이 저장됩니다.

## 규칙

- `TELEGRAM_ALLOWED_USERS`를 **반드시 설정**한다. 비워 두면 봇 주소를 아는 누구나 내 에이전트(=내 PC의 터미널 권한)에 명령할 수 있다.
- 봇 토큰이 유출되면 BotFather에서 `/revoke`로 즉시 재발급한다.
- `.env` 파일은 Git 저장소에 커밋하지 않는다.

## 산출물

- Telegram 봇 1개와 봇 토큰
- 내 Chat ID
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_USERS`가 채워진 `.env`

## 체크리스트

- [ ] BotFather에게서 토큰을 받았다.
- [ ] 내 봇과의 대화방에서 `/start`를 보냈다.
- [ ] `.env`에 토큰과 Chat ID가 들어 있다.

---

# 6 단계: `config.yaml`에 웹훅 라우트 작성

**목적** "PR 이벤트가 들어오면 무엇을 할지"를 에이전트에게 알려 주는 설정을 만든다.
**입력** 4단계 포트 번호(8644), 5단계 Chat ID

## 따라 하기

### 6-1. 웹훅 비밀값(secret) 만들기

GitHub가 보낸 요청이 진짜인지 확인하기 위한 랜덤 문자열입니다.

```bash
$ openssl rand -hex 32
de7af416081967d7b1f56d876aea6798278c1d7f28df7beaca2db1e99da8ff88
```

> Windows에서 `openssl`이 없다면 Git과 함께 설치되는 **Git Bash**에서 실행하거나, PowerShell에서 다음을 실행합니다.
> ```powershell
> PS> -join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
> ```

출력된 64자리 문자열을 복사해 둡니다. (6-2와 7단계에서 **똑같이** 사용)

### 6-2. `config.yaml` 편집

`~/.hermes/config.yaml` (Windows: `%LOCALAPPDATA%\hermes\config.yaml`)을 열고, 파일 맨 아래에 다음 내용을 추가합니다. 이미 `platforms:` 항목이 있으면 그 아래에 `webhook:` 블록만 넣습니다.

```yaml
platforms:
  webhook:
    enabled: true
    extra:
      port: 8644          # 기본값. 다른 프로그램이 쓰고 있으면 변경 (ngrok 포트도 같이 변경)
      rate_limit: 30      # 라우트별 분당 최대 요청 수

      routes:
        github-pr-review:
          secret: "<6-1에서 만든 hex 문자열>"   # GitHub Webhook의 Secret과 정확히 같아야 함
          events:
            - pull_request

          # PR이 열리거나, 새 커밋이 푸시되거나, 다시 열렸을 때만 실행 (토큰 절약)
          filters:
            - field: "action"
              in: ["opened", "synchronize", "reopened"]

          # 에이전트가 터미널에서 gh 명령을 실행할 수 있도록 도구 권한 부여
          toolsets: ["terminal", "web"]

          # {number}, {repository.full_name} 등은 GitHub가 보낸 데이터로 자동 치환됨
          prompt: |
            A pull request event was received (action: {action}).

            PR #{number}: {pull_request.title}
            Author: {pull_request.user.login}
            Branch: {pull_request.head.ref} → {pull_request.base.ref}
            Description: {pull_request.body}
            URL: {pull_request.html_url}

            If the action is "closed" or "labeled", stop here and do not post a comment.

            Otherwise:
            1. Run: gh pr diff {number} --repo {repository.full_name}
            2. Review the code changes for correctness, security issues, and clarity.
            3. Write a concise, actionable review comment in Korean and post it.

          deliver: github_comment
          deliver_extra:
            repo: "{repository.full_name}"
            pr_number: "{number}"
```

### 6-3. 결과를 Telegram으로 받고 싶다면

`deliver` 부분을 아래처럼 바꾸면 PR 댓글 대신 **Telegram 메시지**로 리뷰가 옵니다.

```yaml
          deliver: telegram
          deliver_extra:
            chat_id: "8661840581"     # 5-2에서 확인한 내 Chat ID
```

> `deliver`에는 `github_comment`, `telegram`, `slack`, `discord`, `log` 등을 쓸 수 있습니다. 처음 테스트할 때는 `log`로 두면 아무 곳에도 게시하지 않고 로그에만 남습니다.

### 6-4. 문법 확인

```bash
$ hermes config check
```

## 규칙

- YAML은 **들여쓰기(스페이스 2칸)** 가 의미를 가진다. 탭 문자를 쓰지 않는다.
- `secret` 값은 7단계 GitHub Webhook의 Secret과 **글자 하나까지 똑같아야** 한다.
- 프롬프트에 **`gh pr diff` 실행 지시를 반드시 넣는다.** 웹훅 데이터에는 PR 제목·설명만 있고 코드는 없다.
- `toolsets: ["terminal", "web"]`이 없으면 에이전트가 `gh`를 실행하지 못하고 "diff를 어떻게 가져올까요?"라고 되묻는다.
- PR 제목·본문은 외부인이 쓸 수 있는 내용이다. 인터넷에 공개된 저장소에 연결할 때는 Docker·VM 같은 격리 환경에서 실행하는 것을 권장한다.

## 산출물

- `config.yaml`의 `platforms.webhook.extra.routes.github-pr-review` 라우트
- 웹훅 secret (64자리 hex)

## 체크리스트

- [ ] `openssl rand -hex 32`로 secret을 만들고 메모했다.
- [ ] `config.yaml`에 `github-pr-review` 라우트를 추가했다.
- [ ] `toolsets`와 `filters`를 넣었다.
- [ ] `hermes config check`에서 오류가 없다.

---

# 7 단계: GitHub Webhook 등록 · 게이트웨이 실행 · 테스트

**목적** 모든 조각을 연결하고, 실제 PR에 자동 리뷰가 달리는 것을 확인한다.
**입력** 4단계 ngrok 공개 URL, 6단계 secret, Admin 권한이 있는 GitHub 저장소

## 따라 하기

### 7-1. 게이트웨이 실행 (터미널 ①)

```bash
$ hermes gateway
```
```
┌──────── Hermes Gateway Starting... ────────┐
│ Messaging platforms + cron scheduler       │
│ Press Ctrl+C to stop                       │
└────────────────────────────────────────────┘
[Telegram] Connecting to Telegram (attempt 1/8)...
```
**이 창은 계속 켜 둡니다.** 다른 터미널(②)에서 상태를 확인합니다.

```bash
$ curl http://localhost:8644/health
{"status": "ok", "platform": "webhook"}
```

### 7-2. ngrok 실행 (터미널 ③)

4단계에서 이미 켜 두었다면 그대로 둡니다. 꺼졌다면 다시 실행하고, 주소가 바뀌었는지 확인합니다.
```bash
$ ngrok http 8644
```

### 7-3. (권장) 로컬 서명 테스트

GitHub에 연결하기 전에, 내 PC에서 가짜 PR 이벤트를 보내 라우트가 동작하는지 확인합니다. 이때는 `config.yaml`의 `deliver`를 잠시 `log`로 바꿔 두면 안전합니다.

```bash
SECRET="<6-1에서 만든 hex 문자열>"
BODY='{"action":"opened","number":99,"pull_request":{"title":"Test PR","body":"Adds a feature.","user":{"login":"testuser"},"head":{"ref":"feat/x"},"base":{"ref":"main"},"html_url":"https://github.com/org/repo/pull/99"},"repository":{"full_name":"org/repo"}}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$SECRET" -hex | awk '{print "sha256="$2}')

curl -s -X POST http://localhost:8644/webhooks/github-pr-review \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: pull_request" \
  -H "X-Hub-Signature-256: $SIG" \
  -d "$BODY"
```
`accepted` 응답이 오면 성공입니다. 테스트 후 `deliver`를 `github_comment`(또는 `telegram`)로 되돌리고 게이트웨이를 재시작합니다(`Ctrl+C` 후 `hermes gateway`).

### 7-4. GitHub 저장소에 Webhook 등록

1. 저장소 페이지 → **Settings** → 왼쪽 메뉴 **Webhooks** → **Add webhook**
2. 다음과 같이 입력합니다.

| 항목 | 값 |
|---|---|
| **Payload URL** | `https://<ngrok주소>.ngrok-free.app/webhooks/github-pr-review` |
| **Content type** | `application/json` |
| **Secret** | 6-1에서 만든 hex 문자열 |
| **SSL verification** | Enable SSL verification |
| **Which events…?** | **Let me select individual events** → **Pull requests**만 체크 (Pushes는 해제) |
| **Active** | 체크 |

3. **Add webhook**을 누릅니다. GitHub가 `ping` 이벤트를 보내며, Hermes는 이를 무시합니다(정상).

### 7-5. 실제 PR로 테스트

[SAMPLE.md](./SAMPLE.md)의 예제를 따라 일부러 버그가 있는 코드로 PR을 엽니다. **30~90초** 뒤 PR에 리뷰 댓글이 달리면 완성입니다.

진행 상황은 로그로 볼 수 있습니다.
```bash
$ tail -f ~/.hermes/logs/gateway.log
```

### 7-6. 문제 해결

| 증상 | 원인 | 해결 |
|---|---|---|
| GitHub Recent Deliveries에 **401** | secret 불일치 | `config.yaml`과 Webhook Secret을 같은 값으로 맞춘다 |
| **404** unknown route | URL 경로 오타 | Payload URL 끝이 `/webhooks/github-pr-review`인지 확인 |
| **429** | 요청 과다 | 잠시 기다리거나 `rate_limit` 상향 |
| 연결 실패 / 502 | ngrok 또는 gateway가 꺼짐, 주소 변경 | 두 터미널이 켜져 있는지, ngrok 주소가 Webhook과 같은지 확인 |
| 댓글이 안 달림 | `gh` 미설치·미로그인 | 게이트웨이를 실행한 터미널에서 `gh auth status` 확인 |
| 에이전트가 "diff를 어떻게 가져올까요?" 질문 | 터미널 도구 권한 없음 | 라우트에 `toolsets: ["terminal", "web"]` 추가 |
| PR 설명만 리뷰함 | 프롬프트에 diff 지시 없음 | `gh pr diff ...` 줄 확인 |
| Port in use | 8644 포트 사용 중 | `port`와 `ngrok http` 포트를 함께 변경 |

> 💡 가장 빠른 디버깅 방법: GitHub Webhook 설정 → **Recent Deliveries** 탭에서 각 요청의 응답 코드와 내용을 확인합니다.

### 7-7. (심화) 리뷰 스타일을 스킬로 고정하기

리뷰 형식을 매번 같게 만들고 싶다면 스킬을 만들어 라우트에 연결합니다.

`~/.hermes/skills/pr-review-ko/SKILL.md`
```markdown
---
name: pr-review-ko
description: GitHub PR diff를 한국어로 리뷰할 때 사용하는 체크리스트와 출력 형식
version: 1.0.0
---

# PR 리뷰 규칙
1. 반드시 `gh pr diff`로 실제 변경 코드를 먼저 읽는다.
2. 아래 순서로 확인한다: 버그·정확성 → 보안 → 성능 → 가독성.
3. 출력 형식:
   - **요약** (1~2문장)
   - **🔴 반드시 수정** (파일:줄 — 이유 — 수정 제안)
   - **🟡 개선 제안**
   - **🟢 좋은 점**
4. 문제가 없으면 "LGTM 👍"과 근거를 짧게 남긴다.
5. 추측으로 단정하지 않는다. 확실하지 않으면 질문 형태로 쓴다.
```

`config.yaml`의 라우트에 추가:
```yaml
        github-pr-review:
          skills:
            - pr-review-ko
          # ...기존 설정 유지
```
`hermes skills list`로 스킬이 보이는지 확인한 뒤 게이트웨이를 재시작합니다.

## 규칙

- `hermes gateway`와 `ngrok`, **두 프로그램이 모두 켜져 있어야** 리뷰가 동작한다.
- Webhook 이벤트는 **Pull requests만** 선택한다. "Send me everything"을 고르면 불필요한 실행으로 토큰이 낭비된다.
- 처음에는 **본인 소유의 연습용 저장소**로 테스트한 뒤 팀 저장소에 적용한다.
- secret은 주기적으로 교체하고, 교체할 때는 `config.yaml`과 GitHub 양쪽을 함께 바꾼다.

## 산출물

- GitHub 저장소에 등록된 Webhook
- 실행 중인 `hermes gateway`
- 자동 리뷰 댓글이 달린 PR (또는 Telegram 리뷰 메시지)
- (심화) `~/.hermes/skills/pr-review-ko/SKILL.md`

## 체크리스트

- [ ] `curl http://localhost:8644/health`가 `"status": "ok"`를 반환한다.
- [ ] 로컬 서명 테스트에서 `accepted` 응답을 받았다.
- [ ] GitHub Webhook의 Recent Deliveries에 초록색 체크(2xx)가 보인다.
- [ ] 테스트 PR에 리뷰 댓글(또는 Telegram 메시지)이 도착했다.
- [ ] Telegram 봇에게 말을 걸면 에이전트가 답한다.
