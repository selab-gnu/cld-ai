# M01 예제 실행 및 프롬프트 — PR 하나로 자동 리뷰 받아 보기

> 전제: [GUIDE.md](./GUIDE.md) 1~6단계를 마쳤다. (Hermes 설치, 모델 설정, `gh` 로그인, ngrok, Telegram, `config.yaml` 라우트)
> 이 예제에서는 **연습용 저장소**를 새로 만들고, 일부러 버그를 넣은 코드로 PR을 열어 에이전트의 리뷰를 받는다.

---

## 0단계: 연습용 저장소 만들기

```bash
$ cd ~                                  # 작업할 위치 (아무 곳이나 가능)
$ gh repo create hermes-pr-practice --public --add-readme --clone
$ cd hermes-pr-practice
$ git log --oneline                     # "Initial commit" 이 보이면 성공
```

> 저장소 이름은 자유입니다. 이후 `<내아이디>/hermes-pr-practice` 는 본인 값으로 바꿔 읽으세요.

이 저장소에 GUIDE.md **7-4**대로 Webhook을 등록합니다. 웹 화면 대신 명령 한 줄로 등록하려면:

```bash
$ gh api repos/<내아이디>/hermes-pr-practice/hooks \
    -f name=web -F active=true \
    -f "events[]=pull_request" \
    -f "config[url]=https://<ngrok주소>.ngrok-free.app/webhooks/github-pr-review" \
    -f "config[content_type]=json" \
    -f "config[secret]=<config.yaml의 secret과 같은 값>"
```

---

## 1단계: 커밋할 변경 만들기

리뷰 대상이 될 브랜치를 만들고, **일부러 문제를 3가지 넣은** 파이썬 파일을 추가합니다.

```bash
$ git switch -c feat/user-stats
```

`stats.py` 파일을 만들고 아래 내용을 붙여 넣습니다.

```python
import sqlite3

API_KEY = "sk-live-1234567890abcdef"          # (문제 1) 비밀 키가 코드에 하드코딩됨


def average(scores):
    return sum(scores) / len(scores)           # (문제 2) 빈 리스트면 ZeroDivisionError


def find_user(conn: sqlite3.Connection, name: str):
    query = f"SELECT * FROM users WHERE name = '{name}'"   # (문제 3) SQL 인젝션
    return conn.execute(query).fetchone()


if __name__ == "__main__":
    print(average([90, 80, 70]))
```

커밋하고 푸시한 뒤 PR을 만듭니다.

```bash
$ git add stats.py
$ git commit -m "feat: 사용자 점수 통계 함수 추가"
$ git push -u origin feat/user-stats
$ gh pr create --title "feat: 사용자 점수 통계 함수 추가" \
               --body "평균 점수 계산과 사용자 조회 함수를 추가합니다."
```

마지막 명령이 출력한 PR 주소(`https://github.com/<내아이디>/hermes-pr-practice/pull/1`)를 브라우저로 열어 둡니다.

> ⚠️ PR을 만드는 순간 웹훅이 발송됩니다. **2단계의 gateway와 ngrok을 먼저 켜 두었다면** 바로 리뷰가 시작됩니다. 아직 안 켰다면 2단계 후 3단계의 "다시 리뷰 요청" 방법을 사용하세요.

---

## 2단계: Hermes 게이트웨이 실행

터미널 창을 2개 엽니다.

**터미널 ① — 에이전트**
```bash
$ hermes gateway
```

**터미널 ② — 터널**
```bash
$ ngrok http 8644
```

ngrok 주소가 Webhook에 등록한 주소와 같은지 확인합니다. 다르면 GitHub 저장소 **Settings → Webhooks → Edit**에서 Payload URL을 고칩니다.

(선택) 터미널 ③에서 로그를 봅니다.
```bash
$ tail -f ~/.hermes/logs/gateway.log
```

---

## 3단계: 자동 리뷰 확인

PR 페이지에서 **30~90초** 기다리면 댓글이 달립니다. 모델에 따라 문장은 달라지지만, 다음과 같은 형태여야 정상입니다.

```markdown
**요약** 점수 평균과 사용자 조회 함수가 추가되었습니다. 보안 문제 2건과 예외 처리 누락 1건이 있습니다.

**🔴 반드시 수정**
- `stats.py:3` — API 키가 코드에 하드코딩되어 있습니다. 저장소에 노출되므로 키를 폐기하고
  환경 변수(`os.environ["API_KEY"]`)로 읽도록 바꾸세요.
- `stats.py:11` — f-string으로 SQL을 조립해 SQL 인젝션에 취약합니다.
  `conn.execute("SELECT * FROM users WHERE name = ?", (name,))` 처럼 파라미터 바인딩을 쓰세요.

**🟡 개선 제안**
- `stats.py:7` — `scores`가 비어 있으면 `ZeroDivisionError`가 발생합니다. 빈 리스트 처리를 추가하세요.
```

**확인 포인트**

- [ ] 3가지 문제(하드코딩 키, ZeroDivision, SQL 인젝션)를 모두 지적했다 → `gh pr diff`로 **실제 코드를 읽었다**는 증거
- [ ] PR 제목·설명만 반복하는 리뷰라면 → GUIDE 6단계의 `prompt`에 `gh pr diff` 지시와 `toolsets`가 있는지 확인
- [ ] 아무 반응이 없다면 → GitHub **Settings → Webhooks → Recent Deliveries**에서 응답 코드 확인 (GUIDE 7-6 표 참고)

**다시 리뷰 요청하기** — 새 커밋을 푸시하면 `synchronize` 이벤트로 다시 리뷰됩니다. 또는 Recent Deliveries에서 해당 요청의 **Redeliver** 버튼을 누릅니다.

---

## 4단계: 리뷰 반영 후 재리뷰 받기

지적받은 내용을 고쳐서 다시 푸시합니다.

```python
import os
import sqlite3

API_KEY = os.environ.get("API_KEY", "")


def average(scores):
    if not scores:
        return 0.0
    return sum(scores) / len(scores)


def find_user(conn: sqlite3.Connection, name: str):
    return conn.execute("SELECT * FROM users WHERE name = ?", (name,)).fetchone()


if __name__ == "__main__":
    print(average([90, 80, 70]))
```

```bash
$ git commit -am "fix: 리뷰 반영 (환경 변수, 빈 리스트 처리, 파라미터 바인딩)"
$ git push
```

1~2분 뒤 새 리뷰 댓글에서 이전 문제가 해결되었다는 내용(또는 LGTM)이 오면 성공입니다.

---

## 5단계: 프롬프트가 뜨면 자연어로 지시

웹훅 자동 리뷰 외에도, **CLI**(`hermes`) 또는 **Telegram 봇**에게 직접 말로 시킬 수 있습니다. 아래 프롬프트를 그대로 복사해 사용해 보세요.

### 5-1. CLI에서 (터미널에서 `hermes` 실행 후)

```text
gh pr diff 1 --repo <내아이디>/hermes-pr-practice 를 실행해서 변경 내용을 읽고,
버그·보안·가독성 관점으로 한국어 리뷰를 작성해줘. 아직 댓글은 달지 마.
```

```text
방금 리뷰한 내용을 PR #1에 댓글로 달아줘. (gh pr comment 사용)
```

```text
<내아이디>/hermes-pr-practice 에 열려 있는 PR 목록을 보여주고,
각 PR에서 가장 위험해 보이는 변경 한 가지씩만 요약해줘.
```

### 5-2. Telegram 봇에게

내 봇 대화방에서 보냅니다. (`TELEGRAM_ALLOWED_USERS`에 등록된 계정만 응답)

```text
hermes-pr-practice 저장소의 PR #1 리뷰 결과를 3줄로 요약해줘.
```

```text
PR #1 diff에서 보안 문제만 골라서 파일명:줄번호 형식으로 알려줘.
```

```text
매일 오전 9시에 <내아이디>/hermes-pr-practice 의 열린 PR 목록과
리뷰가 아직 안 달린 PR을 정리해서 나에게 보내줘.
```
> 마지막 프롬프트는 Hermes의 **cron 스케줄러**로 등록됩니다. `hermes gateway`가 켜져 있는 동안 매일 실행됩니다.

### 5-3. 에이전트가 되물을 때

에이전트가 이렇게 물으면, 도구 권한이 없어서 diff를 직접 가져오지 못한 상태입니다.

```text
❓ How would you like me to get the PR diff for review?
  1. Run gh pr diff 9 --repo <owner>/<repo> here (if this environment has gh CLI and repo access)
  2. Please paste the PR diff or changed files here for me to review
  3. Cancel (do not proceed)
Reply with the number, the option text, or your own answer.
```

- 대화 중이라면 `1` 을 보내면 됩니다.
- 웹훅 자동 리뷰에서 매번 이런다면 GUIDE 6단계의 라우트에 `toolsets: ["terminal", "web"]`을 추가하고 게이트웨이를 재시작합니다.

---

## 6단계: 정리

연습이 끝나면 비용과 보안을 위해 정리합니다.

```bash
# 게이트웨이·ngrok 종료: 각 터미널에서 Ctrl+C

# 연습 저장소의 웹훅 삭제 (또는 저장소 자체 삭제)
$ gh api repos/<내아이디>/hermes-pr-practice/hooks            # 웹훅 id 확인
$ gh api -X DELETE repos/<내아이디>/hermes-pr-practice/hooks/<id>
```

- [ ] 1단계에서 넣은 가짜 API 키는 실제 키가 아님을 다시 확인한다. (실제 키를 커밋했다면 즉시 폐기)
- [ ] LLM Provider 대시보드에서 사용량을 확인한다.
