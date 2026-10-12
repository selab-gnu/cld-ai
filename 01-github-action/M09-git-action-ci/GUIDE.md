# 개념

## CI와 GitHub Actions

**CI(지속적 통합)** 는 "코드를 합칠 때마다 자동으로 확인한다"는 습관을 기계에 맡기는 것이다. 사람이 `node --test` 를 깜빡해도, 저장소가 대신 실행하고 결과를 PR 화면에 ✅ / ❌ 로 보여 준다.

**GitHub Actions** 는 저장소의 `.github/workflows/` 폴더에 있는 YAML 파일을 읽어, 정해진 **이벤트**가 일어나면 GitHub의 가상 컴퓨터에서 명령을 실행한다.

## 구성 요소 — 5개만 알면 된다

```yaml
name: CI                         # ① 워크플로 (workflow) — 파일 하나 = 자동화 하나
on: [push, pull_request]         # ② 이벤트 (event) — 언제 실행할까
jobs:
  test:                          # ③ 잡 (job) — 한 대의 러너에서 실행되는 일 묶음
    runs-on: ubuntu-latest       # ④ 러너 (runner) — 어떤 가상 컴퓨터에서
    steps:                       # ⑤ 스텝 (step) — 위에서 아래로 차례대로
      - uses: actions/checkout@v7      #    액션(action): 남이 만들어 둔 기능을 가져다 씀
      - run: node --test               #    run: 터미널 명령을 그대로 실행
```

| 용어 | 뜻 | 할 일 앱 CI에서 |
| --- | --- | --- |
| 워크플로 | `.github/workflows/*.yml` 파일 하나 | `ci.yml` (테스트), `pages.yml` (배포) |
| 이벤트 | 워크플로를 시작하는 사건 | `push`, `pull_request`, `workflow_dispatch`(손으로 실행) |
| 잡 | 같은 러너에서 실행되는 스텝 묶음. 잡끼리는 기본적으로 **동시에** 실행 | `test` |
| 러너 | GitHub가 빌려주는 깨끗한 가상 컴퓨터. 잡이 끝나면 사라진다 | `ubuntu-latest` |
| 스텝 | 잡 안의 한 줄 작업. `uses`(액션) 또는 `run`(명령) | 코드 가져오기 → Node 설치 → 문법 검사 → 테스트 |
| 액션 | 재사용할 수 있게 만들어 둔 스텝 | `actions/checkout`, `actions/setup-node` |
| 실행(run) | 워크플로가 한 번 돌아간 기록 | Actions 탭의 목록 한 줄 |

> 💡 러너는 **매번 빈 컴퓨터**다. 그래서 항상 ① 코드 가져오기(checkout) ② 필요한 도구 설치(setup-node) 부터 시작한다.

## 이 모듈에서 만드는 것

```
my-todo-ci/                          ← 내 GitHub 공개 저장소
├── .github/workflows/
│   ├── ci.yml                       ← 3~5단계: push·PR 마다 문법 검사 + 테스트 (Node 22·24)
│   └── pages.yml                    ← 8단계(도전): main 테스트 통과 시 GitHub Pages 배포
├── index.html  package.json  README.md(배지)  .gitignore
├── src/   todo.js  storage.js  app.js  style.css
└── tests/ todo.test.js              ← 테스트 34개
+ 저장소 설정: 브랜치 규칙(ruleset) — CI 통과 전에는 main 에 합칠 수 없음 (6단계)
```

## 이 가이드의 단계

| 단계 | 내용 | 주로 하는 일 |
| --- | --- | --- |
| 1 | 준비 — 도구 확인과 할 일 앱 준비 | `gh auth login`, `node --test` |
| 2 | GitHub 저장소 만들고 올리기 | `gh repo create … --push` |
| 3 | 첫 CI 워크플로 | `ci.yml` (최소 버전) → Actions 탭 |
| 4 | 워크플로 다듬기 | PR·수동 실행, 권한, 시간 제한, 매트릭스, 문법 검사 |
| 5 | 테스트 결과 남기기 | 요약(Summary), 결과 파일(Artifact) |
| 6 | PR로 일하기와 브랜치 규칙 | Rulesets — 필수 상태 검사 |
| 7 | 상태 배지 달기 | README 배지 |
| 8 | (도전) GitHub Pages 자동 배포 (CD) | `pages.yml` |

> 📌 완성된 CI가 실제로 어떻게 동작하는지(성공·실패·PR 차단·재실행)는 [SAMPLE.md](SAMPLE.md) 에서 확인한다. 막히면 [workflows/](workflows/) 의 완성본과 비교한다.

| 표시 | 하는 곳 |
| --- | --- |
| 🖥️ **터미널** | macOS 터미널 |
| 📝 **편집기** | VS Code 등 |
| 🌐 **GitHub** | 브라우저의 github.com 저장소 화면 |

---

# 1 단계: 준비 — 도구 확인과 할 일 앱 준비

**목적** — 필요한 도구를 확인하고, CI를 붙일 할 일 앱을 새 폴더 `~/git/my-todo-ci` 에 준비한 뒤 **내 컴퓨터에서 먼저 테스트가 통과**하는지 본다.

**입력** — 🖥️ 터미널

```bash
# 1) 도구 확인
git --version
node --version        # v22 이상
gh --version          # 없으면: brew install gh

# 2) GitHub CLI 로그인 (처음 한 번)
gh auth login
#   ? Where do you use GitHub?            → GitHub.com
#   ? What is your preferred protocol?    → HTTPS
#   ? Authenticate Git with your GitHub credentials? → Yes
#   ? How would you like to authenticate? → Login with a web browser
#   (화면의 8자리 코드를 복사 → Enter → 브라우저에서 붙여 넣고 승인)
gh auth status        # "Logged in to github.com account <내 아이디>" 확인

# 3) 할 일 앱 복사 — 이 모듈의 todo-app 폴더를 새 위치로
cp -R ~/git/cld-ai/01-github-action/M09-git-action-ci/todo-app ~/git/my-todo-ci
cd ~/git/my-todo-ci
ls -a

# 4) 내 컴퓨터에서 먼저 테스트
node --test
```

> 💡 03-spec-driven 모듈에서 직접 만든 할 일 앱이 있으면 그것을 써도 된다. 조건은 두 가지다. ① `package.json` 에 `"type": "module"` 이 있다. ② `node --test` 로 테스트가 돈다. 이 경우 `index.html`, `package.json`, `src/`, `tests/` 만 새 폴더로 복사하고, `todo-app/.gitignore` 도 함께 복사한다.

## 규칙

- **CI에 올리기 전에 내 컴퓨터에서 먼저 통과**시킨다. 로컬에서 실패하는 테스트는 CI에서도 실패한다.
- `.gitignore` 는 이름이 `.` 으로 시작하는 숨김 파일이다. `ls -a` 로 보인다.
- 이 앱은 npm 의존성이 없다. 그래서 `npm install` 단계가 필요 없고 CI도 단순하다.

## 산출물

```
~/git/my-todo-ci/
├── .gitignore        .DS_Store, node_modules/, test-results.xml, _site/
├── README.md
├── index.html
├── package.json      {"type": "module"}
├── src/              app.js  storage.js  style.css  todo.js
└── tests/            todo.test.js
```

`node --test` 출력 (마지막 부분):

```
# tests 34
# pass 34
# fail 0
```

## 체크리스트

- [ ] `gh auth status` 가 로그인 상태다.
- [ ] `~/git/my-todo-ci` 에 위 파일들이 있다.
- [ ] `node --test` 가 `# fail 0` 이다.

---

# 2 단계: GitHub 저장소 만들고 올리기

**목적** — 할 일 앱을 git 저장소로 만들고, GitHub에 **공개 저장소** `my-todo-ci` 를 만들어 올린다.

**입력** — 🖥️ 터미널 (`~/git/my-todo-ci` 안에서)

```bash
git init -b main
git add -A
git commit -m "feat: add todo app"

gh repo create my-todo-ci --public --source=. --remote=origin --push
```

| 옵션 | 의미 |
| --- | --- |
| `--public` | 공개 저장소 (Actions 무료, 브랜치 규칙·Pages 사용 가능) |
| `--source=.` | 지금 폴더를 저장소로 사용 |
| `--remote=origin` | 원격 이름을 `origin` 으로 등록 |
| `--push` | 만든 뒤 바로 push |

확인:

```bash
git remote -v
gh repo view --web       # 브라우저에서 저장소 열기
```

<details>
<summary>gh 없이 웹에서 만드는 방법</summary>

1. 🌐 https://github.com/new → Repository name `my-todo-ci` → **Public** → README·.gitignore 추가는 **체크하지 않음** → **Create repository**
2. 🖥️ 화면에 나온 "…or push an existing repository from the command line" 명령을 실행한다.

```bash
git remote add origin https://github.com/<내 아이디>/my-todo-ci.git
git push -u origin main
```

비밀번호를 물으면 GitHub 비밀번호가 아니라 **개인 액세스 토큰**이 필요하다. 이 경우 `gh auth login` 후 `gh auth setup-git` 을 한 번 실행하는 것이 가장 쉽다.
</details>

## 규칙

- 기본 브랜치 이름은 **`main`** 으로 한다. 이후 워크플로가 `main` 을 기준으로 동작한다.
- 저장소 이름은 이 가이드와 같게 `my-todo-ci` 로 한다. (8단계 Pages 주소가 `…github.io/my-todo-ci/` 가 된다)

## 산출물

- GitHub 저장소 `https://github.com/<내 아이디>/my-todo-ci` (파일 목록에 `src`, `tests`, `index.html` …)
- 첫 커밋 `feat: add todo app`

## 체크리스트

- [ ] 🌐 저장소 화면에 내 파일들이 보인다.
- [ ] 🌐 위쪽 탭에 **Actions** 가 있다. (아직 워크플로가 없으므로 시작 안내 화면이 나온다)

---

# 3 단계: 첫 CI 워크플로

**목적** — 가장 작은 CI를 만든다. **main 에 push 할 때마다** 러너에서 `node --test` 를 실행한다.

**입력** — 📝 편집기에서 새 파일 `.github/workflows/ci.yml` 을 만든다.

```bash
mkdir -p .github/workflows
code .github/workflows/ci.yml      # VS Code 가 없으면 아무 편집기로
```

```yaml
name: CI

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: 코드 가져오기
        uses: actions/checkout@v7

      - name: Node.js 설치
        uses: actions/setup-node@v7
        with:
          node-version: 24

      - name: 단위 테스트
        run: node --test
```

🖥️ 저장하고 올린다.

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow"
git push
```

🌐 **GitHub** — 저장소 → **Actions** 탭

1. 왼쪽에 워크플로 이름 **CI** 가 생겼다.
2. 가운데 목록 맨 위에 방금 커밋 메시지(`ci: add GitHub Actions workflow`)로 실행이 하나 있다. 노란 ● (진행 중) → 초록 ✅ (성공).
3. 그 줄을 클릭 → 왼쪽 **test** 잡 클릭 → 스텝별 로그가 보인다. `단위 테스트` 를 펼쳐 `# pass 34` 를 확인한다.

또는 🖥️ 터미널에서:

```bash
gh run watch          # 진행 중인 실행을 따라가며 보기 (실행을 고르라고 하면 Enter)
gh run list           # 최근 실행 목록
```

## 규칙

- 파일 위치는 정확히 **`.github/workflows/`** 다. `.github` 앞의 점, `workflows` 의 s 를 빠뜨리면 GitHub가 무시한다.
- YAML은 **들여쓰기(스페이스 2칸)** 로 구조를 나타낸다. 탭 문자를 쓰지 않는다. `- name:` 과 그 아래 `uses:` 의 시작 위치를 맞춘다.
- 액션은 `@v7` 처럼 **버전을 붙여** 쓴다. 버전 없이 쓰면 오류, `@main` 은 예고 없이 바뀔 수 있어 쓰지 않는다.
- 로그에 나오는 스텝 중 `Set up job`, `Post …`, `Complete job` 은 GitHub가 자동으로 넣는 것이다.

## 산출물

- `.github/workflows/ci.yml` (최소 버전)
- Actions 탭의 첫 실행 ✅

로그 예시 (`단위 테스트` 스텝):

```
▶ Run node --test
✔ 상수: 최대 글자 수는 200이고 보기는 세 가지다 (1.2ms)
✔ countChars: 빈 문자열은 0자다 (0.2ms)
…
ℹ tests 34
ℹ pass 34
ℹ fail 0
```

## 체크리스트

- [ ] Actions 탭에 **CI** 워크플로가 보인다.
- [ ] 첫 실행이 ✅ 로 끝났다.
- [ ] 로그에서 `Node.js 설치` 스텝이 Node 24 를 설치했고, `단위 테스트` 스텝에서 `pass 34` 를 찾았다.
- [ ] 🌐 저장소 첫 화면의 최근 커밋 옆에 ✅ 표시가 생겼다.

---

# 4 단계: 워크플로 다듬기

**목적** — 실제 팀에서 쓰는 수준으로 CI를 다듬는다.

| 추가하는 것 | 왜 |
| --- | --- |
| `pull_request`, `workflow_dispatch` 이벤트 | PR에서도 검사하고, 버튼으로도 실행 |
| `permissions: contents: read` | 워크플로에 **최소 권한**만 준다 (보안) |
| `concurrency` | 같은 브랜치에 새 커밋이 오면 이전 실행을 취소해 시간 절약 |
| `timeout-minutes` | 무한 대기 방지 (기본은 6시간!) |
| `strategy.matrix` | **Node 22 와 24** 에서 동시에 테스트 |
| `node --check` 스텝 | 테스트가 없는 파일(`app.js` 등)의 **문법 오류**도 잡는다 |

**입력** — 📝 `.github/workflows/ci.yml` 을 아래로 **전체 교체**한다.

```yaml
name: CI

on:
  push:
    branches: [main]        # main 에 push 될 때
  pull_request:             # PR 이 열리거나 새 커밋이 올라올 때
  workflow_dispatch:        # Actions 탭에서 손으로 실행할 때

permissions:
  contents: read            # 코드 읽기 권한만 준다 (최소 권한)

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true  # 같은 브랜치에 새 커밋이 오면 이전 실행은 취소

jobs:
  test:
    name: test (Node ${{ matrix.node }})
    runs-on: ubuntu-latest
    timeout-minutes: 10
    strategy:
      fail-fast: false      # 한 버전이 실패해도 다른 버전 결과까지 본다
      matrix:
        node: [22, 24]

    steps:
      - name: 코드 가져오기
        uses: actions/checkout@v7

      - name: Node.js ${{ matrix.node }} 설치
        uses: actions/setup-node@v7
        with:
          node-version: ${{ matrix.node }}

      - name: 버전 확인
        run: node --version

      - name: 문법 검사
        run: |
          for f in src/*.js tests/*.js; do
            echo "검사: $f"
            node --check "$f"
          done

      - name: 단위 테스트
        run: node --test
```

🖥️

```bash
git add -A && git commit -m "ci: run on PRs, add Node matrix and syntax check" && git push
```

🌐 **Actions** 탭 → 새 실행 클릭 → 왼쪽에 잡이 **두 개** 보인다.

```
test (Node 22)   ✅
test (Node 24)   ✅
```

## 규칙

- `${{ … }}` 는 **표현식**이다. `${{ matrix.node }}` 는 매트릭스의 현재 값(22 또는 24), `${{ github.ref }}` 는 실행된 브랜치(`refs/heads/main` 등)로 바뀐다.
- `run: |` 의 `|` 는 "아래 여러 줄을 그대로 하나의 스크립트로" 라는 뜻이다. 스크립트에서 명령 하나라도 실패(0이 아닌 종료 코드)하면 그 스텝이 실패하고, **다음 스텝은 실행되지 않는다.**
- 잡 이름(`name: test (Node 22)`)은 6단계 **필수 상태 검사**에서 그대로 쓰인다. 바꾸면 6단계 설정도 바꿔야 한다.
- 매트릭스에 지원이 끝난 Node 버전(18, 20)은 넣지 않는다.

## 산출물

- `.github/workflows/ci.yml` (다듬은 버전)
- 🌐 Actions 탭 왼쪽 **CI** 를 고르면 오른쪽 위에 **Run workflow** 버튼이 생긴다 (`workflow_dispatch` 덕분)

## 체크리스트

- [ ] 실행 하나에 `test (Node 22)`, `test (Node 24)` 두 잡이 있고 둘 다 ✅ 다.
- [ ] `버전 확인` 스텝 로그가 각각 `v22.…`, `v24.…` 이다.
- [ ] `문법 검사` 스텝 로그에 `검사: src/app.js` 등 4개 파일이 보인다.
- [ ] **Run workflow** 버튼이 보인다.

---

# 5 단계: 테스트 결과 남기기

**목적** — 로그를 열지 않아도 결과가 보이게 한다.

- **잡 요약(Job Summary)** — 실행 화면 첫 페이지에 "Node 22 — 테스트 34개, 실패 0개" 를 표시
- **결과 파일(Artifact)** — JUnit XML 결과 파일을 실행 기록에 첨부 (7일 보관)

**입력** — 📝 `ci.yml` 의 `단위 테스트` 스텝을 아래 **세 스텝으로 교체**한다. (들여쓰기는 다른 `- name:` 과 같게)

```yaml
      - name: 단위 테스트
        run: |
          node --test \
            --test-reporter=spec --test-reporter-destination=stdout \
            --test-reporter=junit --test-reporter-destination=test-results.xml

      - name: 결과 요약
        if: always()
        run: |
          total=$(grep -c '<testcase' test-results.xml || true)
          failed=$(grep -c '<failure' test-results.xml || true)
          echo "### Node ${{ matrix.node }} — 테스트 ${total}개, 실패 ${failed}개" >> "$GITHUB_STEP_SUMMARY"

      - name: 테스트 결과 파일 올리기
        if: always()
        uses: actions/upload-artifact@v7
        with:
          name: test-results-node${{ matrix.node }}
          path: test-results.xml
          retention-days: 7
```

🖥️ 먼저 내 컴퓨터에서 같은 명령을 확인한 뒤 올린다.

```bash
node --test \
  --test-reporter=spec --test-reporter-destination=stdout \
  --test-reporter=junit --test-reporter-destination=test-results.xml
head -3 test-results.xml       # <testsuites> … <testcase name="…" 가 보이면 OK
git status                     # test-results.xml 은 .gitignore 에 있어 목록에 안 나온다

git add -A && git commit -m "ci: add test summary and results artifact" && git push
```

🌐 **Actions** → 새 실행 클릭 → 첫 화면(Summary) 아래쪽

```
test (Node 22) summary
### Node 22 — 테스트 34개, 실패 0개
test (Node 24) summary
### Node 24 — 테스트 34개, 실패 0개

Artifacts
  test-results-node22   ⤓
  test-results-node24   ⤓
```

## 규칙

- **`if: always()`** — 앞 스텝(테스트)이 실패해도 이 스텝은 실행한다. 실패했을 때야말로 결과가 필요하기 때문이다.
- `--test-reporter` 를 두 번 쓰면 출력이 두 곳으로 간다: 사람이 읽는 `spec` 은 로그(stdout)로, 기계가 읽는 `junit` 은 파일로.
- `$GITHUB_STEP_SUMMARY` 는 GitHub가 준비한 파일이다. 여기에 Markdown을 덧붙이면(`>>`) 실행 요약 화면에 표시된다.
- 결과 파일은 저장소에 커밋하지 않는다(`.gitignore`). 실행 기록에 첨부만 한다.

## 산출물

- `ci.yml` 최종본 — [workflows/ci.yml](workflows/ci.yml) 과 같다
- 실행 요약 화면의 테스트 개수 표시, Artifacts 2개

## 체크리스트

- [ ] 실행 Summary 화면에 Node 22 · 24 각각의 `테스트 34개, 실패 0개` 가 보인다.
- [ ] Artifacts 의 `test-results-node24` 를 내려받아 압축을 풀면 `test-results.xml` 이 있다.
- [ ] 내 `ci.yml` 이 [workflows/ci.yml](workflows/ci.yml) 과 (주석을 빼면) 같다.

---

# 6 단계: PR로 일하기와 브랜치 규칙

**목적** — `main` 에 바로 push 하지 않고 **브랜치 → PR → CI 통과 → 합치기** 로 일한다. 그리고 **CI가 실패한 PR은 합칠 수 없게** 저장소 규칙을 건다.

## 6-1. 브랜치 규칙(Ruleset) 만들기

🌐 **GitHub** — 저장소 → **Settings** → 왼쪽 **Rules › Rulesets** → **New ruleset** → **New branch ruleset**

| 항목 | 입력 |
| --- | --- |
| Ruleset Name | `main 보호` |
| Enforcement status | **Active** |
| Bypass list | 비워 둔다 (나도 규칙을 지킨다) |
| Target branches | **Add target** → **Include default branch** (= `main`) |
| Branch rules | ✅ **Restrict deletions** (기본 체크) |
| | ✅ **Require a pull request before merging** — Required approvals 는 `0` (혼자 실습) |
| | ✅ **Require status checks to pass** → **Add checks** → `test (Node 22)`, `test (Node 24)` 를 검색해 추가 |
| | ✅ **Block force pushes** (기본 체크) |

맨 아래 **Create** 클릭.

> 💡 **Add checks** 검색 목록에는 **최근에 한 번이라도 실행된** 잡 이름만 나온다. 안 보이면 4단계를 먼저 끝냈는지 확인한다.

## 6-2. PR 로 변경 올리기

할 일 앱에 작은 변경(필터 테스트 하나 추가)을 PR로 올려 본다.

🖥️ 터미널

```bash
git switch -c test/add-filter-case

cat >> tests/todo.test.js <<'EOF'

test('filterTodos: 완료 보기에서 진행 중 할 일은 빠진다', () => {
  const todos = [
    { id: 1, text: 'a', completed: false },
    { id: 2, text: 'b', completed: true },
  ];
  assert.deepEqual(todo.filterTodos(todos, 'completed').map((t) => t.id), [2]);
});
EOF

node --test 2>&1 | grep -E "^# (tests|fail)"      # tests 35, fail 0
git add -A && git commit -m "test: add completed filter case"
git push -u origin test/add-filter-case

gh pr create --fill          # 커밋 메시지로 PR 제목·본문 채우기
gh pr checks --watch         # CI 결과를 기다리며 보기
```

> 테스트 파일 맨 위에 `import assert from 'node:assert/strict'` 와 `import * as todo from '../src/todo.js'` 가 이미 있어서 `assert`, `todo.filterTodos` 를 그대로 쓸 수 있다. 직접 만든 앱을 쓰는 경우 `head -5 tests/todo.test.js` 로 import 이름을 확인해 맞춘다.

🌐 **GitHub** — PR 화면 아래쪽

```
✅ All checks have passed
   CI / test (Node 22) (pull_request)   Successful
   CI / test (Node 24) (pull_request)   Successful
[ Merge pull request ]   ← 초록 버튼 활성
```

**Merge pull request** → **Confirm merge** → (선택) **Delete branch**

🖥️ 내 컴퓨터도 최신으로:

```bash
git switch main
git pull
```

## 규칙

- 이제 `main` 에 직접 `git push` 하면 **거부**된다 (`GH013: Repository rule violations found`). 모든 변경은 브랜치 + PR 로 한다.
- 합친 뒤에는 `main` 에 대한 `push` 이벤트로 CI가 **한 번 더** 돈다. 정상이다 (합친 결과를 다시 확인).
- 실패한 PR을 고치려면 **같은 브랜치에 커밋을 추가로 push** 하면 된다. PR이 자동으로 다시 검사된다. 실패 시나리오는 [SAMPLE.md 4단계](SAMPLE.md#4단계-실패를-일으키고-pr이-막히는지-보기) 에서 해 본다.

## 산출물

- 저장소 규칙 `main 보호` (Settings › Rules › Rulesets)
- 합쳐진 PR #1, `tests/todo.test.js` 테스트 35개

## 체크리스트

- [ ] Rulesets 목록에 `main 보호` 가 **Active** 로 있다.
- [ ] PR 화면에 `test (Node 22)`, `test (Node 24)` 가 **Required** 표시와 함께 보였다.
- [ ] PR을 합쳤고, 합친 뒤 `main` 의 CI도 ✅ 다.
- [ ] (확인) `main` 에서 직접 push 해 보면 거부된다.

---

# 7 단계: 상태 배지 달기

**목적** — README 맨 위에 CI 상태 배지(`CI | passing` 모양의 작은 그림)를 단다. 저장소에 들어온 사람이 **지금 main 이 건강한지** 한눈에 본다.

**입력**

🌐 **Actions** → 왼쪽 **CI** → 오른쪽 위 **⋯** → **Create status badge** → Branch `main` → **Copy status badge Markdown**

복사되는 내용은 이런 모양이다.

```markdown
[![CI](https://github.com/<내 아이디>/my-todo-ci/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/<내 아이디>/my-todo-ci/actions/workflows/ci.yml)
```

🖥️ 6단계 규칙 때문에 브랜치 + PR 로 올린다.

```bash
git switch -c docs/ci-badge
# 📝 README.md 의 첫 줄(# 할 일 목록 …) 바로 아래에 복사한 배지를 붙여 넣고 저장
git add README.md && git commit -m "docs: add CI status badge"
git push -u origin docs/ci-badge
gh pr create --fill
gh pr checks --watch
gh pr merge --merge --delete-branch
git switch main && git pull
```

## 규칙

- 배지 주소의 `ci.yml` 은 **워크플로 파일 이름**이다. 파일 이름을 바꾸면 배지 주소도 바꾼다.
- `?branch=main` 을 붙여야 PR 브랜치의 실패가 아니라 **main 의 상태**만 보여 준다.

## 산출물

- `README.md` 의 CI 배지

## 체크리스트

- [ ] 🌐 저장소 첫 화면 README에 **CI passing** 배지가 보인다.
- [ ] 배지를 클릭하면 Actions 의 CI 워크플로 화면으로 간다.

---

# 8 단계: (도전) GitHub Pages 자동 배포 (CD)

**목적** — CI(검사)에서 한 걸음 더 나가 **CD(지속적 배포)** 를 만든다. `main` 에 합쳐지면 **테스트 → 배포 파일 모으기 → Pages 배포** 가 자동으로 일어나, 누구나 인터넷 주소로 할 일 앱을 쓸 수 있다.

```
 push (main) ─► job: test ──► job: build ──────────────► job: deploy
                node --test   _site/ 에 index.html, src/    deploy-pages → https://<아이디>.github.io/my-todo-ci/
                              upload-pages-artifact
```

## 8-1. Pages 를 GitHub Actions 방식으로 켜기

🌐 **Settings** → 왼쪽 **Pages** → **Build and deployment** → **Source** 를 **GitHub Actions** 로 선택

> ⚠️ 이것을 먼저 하지 않으면 워크플로가 `Get Pages site failed` 로 실패한다.

## 8-2. 배포 워크플로 추가

🖥️

```bash
git switch -c ci/pages
```

📝 새 파일 `.github/workflows/pages.yml`

```yaml
name: Deploy to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write              # Pages 에 배포
  id-token: write           # 배포 요청이 이 저장소에서 왔음을 증명

concurrency:
  group: pages
  cancel-in-progress: false # 배포는 중간에 끊지 않는다

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
      - run: node --test

  build:
    needs: test             # 테스트가 통과해야 시작
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - name: 배포할 파일만 모으기
        run: |
          mkdir -p _site
          cp index.html _site/
          cp -r src _site/
      - uses: actions/configure-pages@v6
      - uses: actions/upload-pages-artifact@v5
        with:
          path: _site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: GitHub Pages 에 배포
        id: deployment
        uses: actions/deploy-pages@v5
```

🖥️

```bash
git add -A && git commit -m "ci: deploy to GitHub Pages"
git push -u origin ci/pages
gh pr create --fill
gh pr checks --watch           # PR 에서는 CI 만 돈다 (pages.yml 은 main push 에서만)
gh pr merge --merge --delete-branch
git switch main && git pull
gh run watch                   # main 에서 CI 와 Deploy to Pages 가 함께 돈다 — Deploy 를 고른다
```

🌐 **Actions** → **Deploy to Pages** 실행 화면

```
test ──► build ──► deploy   ✅
                   https://<내 아이디>.github.io/my-todo-ci/   ← 링크
```

## 규칙

- **`needs:`** 로 잡의 순서를 정한다. `needs` 가 없으면 잡은 동시에 실행된다. 앞 잡이 실패하면 뒤 잡은 **건너뛴다(skipped)** — 테스트가 깨진 코드는 배포되지 않는다.
- 배포에 필요한 파일만 `_site/` 에 모은다. `tests/`, `.github/` 같은 것은 공개 사이트에 올리지 않는다.
- 권한은 배포에 필요한 `pages: write`, `id-token: write` 만 추가한다. CI(`ci.yml`)에는 주지 않는다.
- `github-pages` 환경은 기본적으로 **main 브랜치에서만** 배포를 허용한다. 다른 브랜치에서 수동 실행하면 deploy 잡이 거부된다.

## 산출물

- `.github/workflows/pages.yml` — [workflows/pages.yml](workflows/pages.yml) 과 같다
- 🌐 Settings › Pages 에 `Your site is live at https://<내 아이디>.github.io/my-todo-ci/`
- 🌐 저장소 오른쪽 **Deployments › github-pages**

## 체크리스트

- [ ] Deploy to Pages 실행의 세 잡 `test → build → deploy` 가 모두 ✅ 다.
- [ ] 배포 주소에서 할 일 앱이 열리고, 할 일을 추가한 뒤 새로 고침해도 남아 있다.
- [ ] [SAMPLE.md 7단계](SAMPLE.md#7단계-도전-자동-배포-확인하기) 시나리오를 확인했다.

---

# 부록 A. 워크플로 작성 규칙

이 모듈의 워크플로가 지키는 규칙이다. 다른 프로젝트에 CI를 만들 때도 그대로 쓸 수 있다.

```markdown
## GitHub Actions 워크플로 규칙

- 위치: `.github/workflows/<이름>.yml`. 파일 하나에 목적 하나 (ci.yml = 검사, pages.yml = 배포).
- 이벤트: 검사는 `push`(main) + `pull_request` + `workflow_dispatch`. 배포는 `push`(main) 만.
- 권한: 워크플로 맨 위에 `permissions: contents: read` 를 두고, 필요한 잡/워크플로에만 권한을 더한다.
- 액션 버전: `@v7` 처럼 주 버전을 고정한다. `@main`, `@master` 금지. (보안이 중요한 곳은 커밋 SHA 로 고정)
- 시간 제한: 모든 잡에 `timeout-minutes` 를 둔다.
- 중복 실행: `concurrency` + `cancel-in-progress: true` (배포는 false).
- 결과: 실패해도 남겨야 하는 스텝(요약·결과 파일)은 `if: always()`.
- 비밀 값: 토큰·비밀번호는 코드에 쓰지 않고 Settings › Secrets and variables › Actions 에 둔 뒤 `${{ secrets.이름 }}` 으로 쓴다.
- 로컬 우선: 워크플로에서 실행하는 명령은 먼저 내 컴퓨터에서 같은 명령으로 확인한다.
- 잡 이름을 바꾸면 브랜치 규칙의 필수 상태 검사 이름도 같이 바꾼다.
```

> 💡 올리기 전에 워크플로 문법을 검사하려면 [actionlint](https://github.com/rhysd/actionlint) 를 쓴다: 🖥️ `brew install actionlint` → `actionlint` (저장소 폴더에서 실행하면 `.github/workflows/*.yml` 을 모두 검사). 이 모듈의 `ci.yml`, `pages.yml` 은 actionlint 를 통과했다.

# 부록 B. 자주 겪는 문제

| 증상 | 원인 / 해결 |
| --- | --- |
| push 했는데 Actions 탭에 아무것도 없다 | 파일 위치 확인: `.github/workflows/ci.yml` (`ls -a .github/workflows`). 브랜치가 `main` 인지 확인 (`on.push.branches`) |
| 실행 목록에 `Invalid workflow file` | YAML 들여쓰기 오류. 오류 메시지의 줄 번호를 보고, 스페이스 2칸 · 탭 금지 · `- name:` 위치를 맞춘다. `actionlint` 로 확인 |
| `Unable to resolve action actions/checkout@v8` | 없는 버전이다. `@v7` 로 |
| `node: --test-reporter-destination …` 오류 | 로컬 Node 가 너무 오래되었다. 22 이상으로 |
| 로컬은 통과, CI 는 실패 | ① 커밋하지 않은 파일이 있다 (`git status`) ② 대소문자 다른 파일 이름 — macOS는 구분 안 하지만 Linux 러너는 구분한다 (`import './Todo.js'` vs `todo.js`) ③ 시간대·로케일에 의존하는 테스트 |
| `GH013: Repository rule violations found` (push 거부) | 6단계 규칙이 동작한 것이다. 브랜치를 만들어 PR 로 올린다 |
| PR 에서 `Expected — Waiting for status to be reported` 가 계속 남는다 | 규칙의 필수 검사 이름과 잡 이름이 다르다. Rulesets 에서 검사를 지우고 실제 이름(`test (Node 22)`)으로 다시 추가 |
| Add checks 검색에 잡 이름이 안 나온다 | 해당 잡이 아직 한 번도 실행되지 않았다. 4단계 워크플로를 먼저 push |
| `Get Pages site failed` | 8-1 의 Pages Source 를 **GitHub Actions** 로 바꾸지 않았다 |
| deploy 잡이 `Branch "…" is not allowed to deploy to github-pages` | main 이 아닌 브랜치에서 실행했다. main 에서 실행 |
| Pages 주소에서 화면이 비어 있다 | 브라우저 Console 확인. `_site/` 에 `src/` 가 복사되었는지 build 잡 로그 확인. 경로가 `/src/…` 처럼 `/` 로 시작하면 하위 주소(`/my-todo-ci/`)에서 깨진다 — `src/…` 상대 경로로 |
| 노란 ● 가 오래 지속된다 (Queued) | GitHub 쪽 대기. 잠시 기다리거나 https://www.githubstatus.com 확인 |
| 같은 커밋인데 실행이 `Cancelled` 로 끝났다 | `concurrency` 가 새 실행 때문에 이전 실행을 취소한 것이다. 정상 |

# 부록 C. 용어 정리

| 용어 | 뜻 |
| --- | --- |
| CI (지속적 통합) | 변경을 합칠 때마다 자동으로 빌드·테스트하는 것 |
| CD (지속적 배포) | 검사를 통과한 변경을 자동으로 배포하는 것 |
| 워크플로 (workflow) | `.github/workflows/*.yml` 파일 하나로 정의한 자동화 |
| 이벤트 (event, `on:`) | 워크플로를 시작하는 사건. `push`, `pull_request`, `workflow_dispatch` … |
| 잡 (job) | 러너 한 대에서 실행되는 스텝 묶음. 기본은 동시 실행, `needs` 로 순서 지정 |
| 스텝 (step) | 잡 안의 작업 한 줄. `uses`(액션) 또는 `run`(명령) |
| 액션 (action) | 재사용 가능한 스텝. `owner/repo@버전` 으로 가져옴 |
| 러너 (runner) | 잡을 실행하는 가상 컴퓨터. `ubuntu-latest` 등 |
| 매트릭스 (matrix) | 값 목록마다 같은 잡을 여러 개 만들어 동시에 실행 |
| 표현식 `${{ }}` | 실행 시점에 값으로 바뀌는 식. `matrix.node`, `github.ref`, `secrets.X` … |
| 아티팩트 (artifact) | 실행 기록에 첨부해 두는 파일. 기간이 지나면 삭제 |
| 잡 요약 (job summary) | `$GITHUB_STEP_SUMMARY` 에 쓴 Markdown. 실행 첫 화면에 표시 |
| 상태 검사 (status check) | PR·커밋에 붙는 ✅/❌ 결과. 잡 하나 = 검사 하나 |
| 규칙 집합 (ruleset) | 브랜치에 거는 규칙 묶음 (PR 필수, 상태 검사 필수, 강제 push 금지 …) |
| 환경 (environment) | 배포 대상(`github-pages`). 배포 기록·보호 규칙을 가짐 |
| `GITHUB_TOKEN` | 실행마다 자동 발급되는 임시 토큰. `permissions:` 로 권한을 정함 |
