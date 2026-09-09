# 개념

**graphify**는 코드, 문서, PDF, SQL 스키마, 이미지, 영상까지 하나의 저장소를 **질의 가능한 지식 그래프**로 변환해 주는 도구다. AI 코딩 어시스턴트(Claude Code, Cursor, Codex, Gemini CLI 등)에 `/graphify`라는 스킬로 등록되며, 코드는 tree-sitter 기반 AST로 **로컬에서 결정적으로** 파싱하고(LLM 호출 없음, 외부 전송 없음), 문서·PDF·이미지 등은 AI 어시스턴트의 모델을 통해 의미 기반으로 파싱한다.

핵심 아이디어는 두 가지다.

- **모든 연결에는 근거가 있다.** 각 엣지는 소스에서 명시적으로 확인된 것(`EXTRACTED`)인지, graphify가 추론한 것(`INFERRED`)인지 태그가 붙는다.
- **벡터 스토어가 아니라 진짜 그래프다.** 임베딩 검색 대신 그래프를 순회하며 질문하고, 두 개념 사이의 경로를 추적하고, 하나의 개념을 설명할 수 있다.

이 가이드는 graphify를 한 번도 써본 적 없는 초보자가 설치부터 그래프 생성, 질의, 팀 협업 설정까지 순서대로 따라 할 수 있도록 구성했다.

---

# 1 단계: 사전 준비 확인하기

## 규칙

- Python 3.10 이상이 설치되어 있어야 한다. `python --version`으로 확인한다.
- 패키지 관리자는 `uv`(권장) 또는 `pipx` 중 하나를 사용한다. 둘 다 없다면 다음 중 하나로 설치한다.
  - macOS(Homebrew): `brew install python@3.12 uv`
  - Windows: `winget install astral-sh.uv`
  - Ubuntu/Debian: `curl -LsSf https://astral.sh/uv/install.sh | sh`
- `pip install`을 직접 사용하는 것은 되도록 피한다. graphify는 실행 시점에 `graphify-out/.graphify_python`에서 파이썬 환경을 찾는데, `pip`으로 설치한 환경과 실제 실행 환경이 다르면 `ModuleNotFoundError`가 발생할 수 있다. `uv tool install` / `pipx install`은 자체 격리 환경을 쓰기 때문에 이 문제가 없다.

## 산출물

- 로컬 환경에 Python 3.10+ 및 `uv`(또는 `pipx`) 설치 완료.

## 체크리스트
[ ] `python --version` 결과가 3.10 이상인지 확인한다.
[ ] `uv --version`(또는 `pipx --version`)이 정상 출력되는지 확인한다.
[ ] 사용 중인 AI 코딩 어시스턴트(Claude Code, Cursor, Codex, Gemini CLI 등)를 확정한다.

---

# 2 단계: graphify CLI 설치하기

## 규칙

- 설치 명령은 다음 중 하나를 사용한다.
  ```
  uv tool install graphifyy      # 권장
  # 또는
  pipx install graphifyy
  ```
- **PyPI 패키지 이름은 `graphifyy`(y가 두 번)이지만, 실행 명령어는 `graphify`다.** 이름이 비슷한 다른 `graphify*` 패키지는 무관한 패키지이므로 혼동하지 않는다.
- `uvx graphify ...` 처럼 설치 없이 바로 실행하려면 패키지명을 명시해야 한다: `uvx --from graphifyy graphify install`. `uvx graphify ...`만 쓰면 실패한다.
- 설치 후 `graphify: command not found`가 뜨면 PATH 문제다.
  - uv: `uv tool update-shell` 실행 후 새 터미널 열기
  - pipx: `pipx ensurepath` 실행 후 새 터미널 열기

## 산출물

- 터미널에서 `graphify` 명령을 바로 호출할 수 있는 상태.

## 체크리스트
[ ] `uv tool install graphifyy` (또는 `pipx install graphifyy`)를 실행한다.
[ ] `graphify --version`으로 설치를 확인한다.
[ ] 명령을 찾지 못하면 PATH를 갱신하고 새 터미널을 연다.

---

# 3 단계: AI 어시스턴트에 스킬 등록하기

## 규칙

- 스킬 등록 명령: `graphify install`
- 기본은 사용자 프로필 전역에 등록되며, 현재 저장소에만 등록하려면 `--project`를 추가한다.
  ```
  graphify install --project
  graphify install --project --platform codex
  ```
- Claude Code 외 다른 플랫폼을 쓴다면 `--platform` 옵션으로 지정한다(예: `--platform cursor`, `--platform codex`, `--platform gemini`). 플랫폼별 전용 명령(`graphify cursor install` 등)도 있다.
- PowerShell 사용자는 이후 `/graphify .` 대신 **`graphify .`**(슬래시 없이)를 입력해야 한다. PowerShell에서 `/`는 경로 구분자로 해석되기 때문이다.

## 산출물

- `.claude/skills/graphify/SKILL.md`(또는 해당 플랫폼 경로)에 스킬 파일 생성.
- 프로젝트 스코프로 설치한 경우, 커밋해야 할 파일에 대한 `git add` 안내 문구 출력.

## 체크리스트
[ ] `graphify install`(또는 플랫폼별 명령)을 실행한다.
[ ] 사용 중인 AI 어시스턴트를 열어 `/graphify` 명령이 인식되는지 확인한다.
[ ] 프로젝트 스코프로 설치했다면 안내된 파일을 git에 커밋한다.

---

# 4 단계: 첫 그래프 생성하기

## 규칙

- 튜토리얼로 연습할 저장소로 이동한 뒤, AI 어시스턴트 안에서 다음을 입력한다.
  ```
  /graphify .
  ```
- 코드 파일은 API 키 없이 로컬 AST 파싱만으로 처리된다. 문서·PDF·이미지·영상까지 포함하려면 AI 어시스턴트의 모델(또는 설정된 API 키)을 통한 의미 분석이 필요하다.
- 코드만 색인하고 싶다면(문서/PDF/이미지 건너뛰기): `graphify extract ./raw --code-only`
- 특정 폴더만 대상으로 하려면 `.` 대신 경로를 지정한다: `/graphify ./docs`
- 저장소 루트에 `.graphifyignore` 파일을 만들면(`.gitignore`와 동일한 문법) 색인에서 제외할 파일/폴더를 지정할 수 있다. `.gitignore`는 자동으로 존중되며, 두 파일이 겹치면 `.graphifyignore`가 우선한다.

## 산출물

`graphify-out/` 폴더에 다음 세 파일이 생성된다.
- `graph.html` — 브라우저에서 열어 노드를 클릭·필터·검색할 수 있는 시각화
- `GRAPH_REPORT.md` — 핵심 개념, 의외의 연결, 추천 질문 요약
- `graph.json` — 파일을 다시 읽지 않고도 질의할 수 있는 전체 그래프 데이터

## 체크리스트
[ ] 연습용 저장소 루트에서 `/graphify .`를 실행한다.
[ ] `graphify-out/graph.html`을 브라우저로 열어 그래프가 보이는지 확인한다.
[ ] `graphify-out/GRAPH_REPORT.md`를 열어 핵심 개념 요약을 읽어본다.

---

# 5 단계: 리포트와 그래프 이해하기

## 규칙

- `GRAPH_REPORT.md`에는 다음 항목이 들어 있다.
  - **God nodes** — 가장 많이 연결된, 즉 모든 것이 거쳐 가는 핵심 개념
  - **Communities** — 그래프를 하위 시스템 단위로 나눈 군집(Leiden 알고리즘)
  - **Surprising connections** — 서로 다른 파일·모듈에 있는데도 연결된 부분
  - **The "why"** — `# NOTE:`, `# WHY:`, `# HACK:` 같은 주석과 설계 문서의 근거가 별도 노드로 추출됨
  - **Suggested questions** — 이 그래프로 답할 수 있는 질문 4~5개
- 모든 엣지에는 신뢰도 태그(`EXTRACTED`/`INFERRED`/`AMBIGUOUS`)가 붙어 있어, 소스에서 직접 읽은 것과 추론된 것을 구분할 수 있다.
- 노드가 5000개를 넘어 `graph.html`이 너무 무거워지면 `--no-viz`로 HTML 생성을 생략하고 `graph.json`만 사용한다.

## 산출물

- 저장소 구조와 핵심 개념에 대한 1차 이해.
- 다음 단계(질의)에서 사용할 구체적인 질문 목록.

## 체크리스트
[ ] `GRAPH_REPORT.md`의 God nodes 목록을 확인한다.
[ ] Suggested questions 중 하나를 골라 다음 단계에서 실제로 질의해 본다.
[ ] `graph.html`에서 커뮤니티(색상별 군집)를 하나 클릭해 살펴본다.

---

# 6 단계: 그래프에 질의하기

## 규칙

- 자연어 질문: `graphify query "질문 내용"`
- 두 개념 사이의 최단 경로: `graphify path "개념A" "개념B"`
- 하나의 개념 설명: `graphify explain "개념명"`
- AI 어시스턴트 안에서도 동일하게 `/graphify query ...` 형태로 사용할 수 있다.
- 반복적으로 도구 호출을 통해 접근하려면 MCP 서버로 그래프를 노출할 수 있다.
  ```
  python -m graphify.serve graphify-out/graph.json
  ```
- 질의 로그는 기본적으로 저장되지 않는다(`GRAPHIFY_QUERY_LOG_ENABLE=1`로 켜야 `~/.cache/graphify-queries.log`에 기록됨).

## 산출물

- 특정 개념에 대한 소스 위치, 연결 관계, 신뢰도 태그가 포함된 답변.
- 두 개념 간 관계를 보여주는 경로(hop) 목록.

## 체크리스트
[ ] `graphify explain "<핵심 개념 하나>"`를 실행해 결과를 확인한다.
[ ] `graphify path "<개념A>" "<개념B>"`로 두 개념의 연결 경로를 확인한다.
[ ] `graphify query "<자연어 질문>"`으로 5단계에서 고른 질문에 답을 얻는다.

---

# 7 단계: 최신 상태 유지 및 팀 협업 설정하기

## 규칙

- `graphify-out/`은 git에 커밋해서 팀 전체가 같은 그래프에서 시작하는 것을 권장한다. 단, `graphify-out/cost.json`은 로컬 전용이므로 `.gitignore`에 추가한다.
- 클론 직후 한 번 `graphify hook install`을 실행하면:
  - `git commit` 시 자동으로 그래프 재빌드(AST만 사용, API 비용 없음)
  - `git checkout`/`git switch` 시 자동 재빌드
  - `graph.json` 병합 충돌을 방지하는 git merge driver 설치
- `git pull`/`git merge` 이후에는 **직접** `graphify update .`를 실행해야 한다(자동화되지 않는 유일한 단계). 아래처럼 alias로 묶으면 편하다.
  ```
  git config --global alias.gpull '!git pull && graphify update .'
  ```
- 문서나 논문이 바뀌었을 때는 `/graphify --update`로 해당 노드만 갱신한다(코드와 문서는 독립적으로 갱신됨).
- 리팩터링으로 파일이 줄었는데 그래프 노드 수가 그대로라면 `--force`(또는 `GRAPHIFY_FORCE=1`)로 강제 재빌드한다.

## 산출물

- `git commit` / `git checkout`만으로 항상 최신 상태를 유지하는 그래프.
- 팀원 간 충돌 없이 공유되는 `graph.json`.

## 체크리스트
[ ] 클론한 저장소에서 `graphify hook install`을 한 번 실행한다.
[ ] `.gitignore`에 `graphify-out/cost.json`을 추가한다.
[ ] `git pull` 이후 `graphify update .`를 실행하는 습관(또는 alias)을 설정한다.
[ ] `graphify hook status`로 훅이 활성화되어 있는지 확인한다.
