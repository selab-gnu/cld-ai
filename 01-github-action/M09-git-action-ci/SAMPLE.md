# 예제 실행 및 확인 — 할 일 앱 CI 사용 가이드

> 이 문서는 GUIDE로 **완성한 CI를 실제로 돌려 보고, 성공·실패·차단·재실행이 기대대로 동작하는지 확인하는 방법**을 안내한다.
> CI를 만드는 과정(저장소 → 워크플로 → 브랜치 규칙)은 [GUIDE.md](GUIDE.md) 를 따른다.

**시작 조건**: [GUIDE.md](GUIDE.md) 6단계까지 마친 상태
- GitHub 공개 저장소 `my-todo-ci` 에 `.github/workflows/ci.yml` 이 있다.
- 브랜치 규칙 `main 보호` 가 Active 이고, 필수 검사로 `test (Node 22)`, `test (Node 24)` 가 걸려 있다.
- 내 컴퓨터의 `~/git/my-todo-ci` 가 `main` 브랜치이고 최신이다 (`git switch main && git pull`).

| 표시 | 하는 곳 |
| --- | --- |
| 🖥️ **터미널** | macOS 터미널 (`~/git/my-todo-ci` 안) |
| 🌐 **GitHub** | 브라우저의 `https://github.com/<내 아이디>/my-todo-ci` |

> 📝 GitHub 화면의 버튼 위치·문구는 조금씩 바뀐다. **같은 결과(✅/❌, 차단, 재실행)** 가 나오면 통과로 본다.

시나리오 번호: **G**(초록 성공) · **M**(수동 실행) · **F**(테스트 실패) · **S**(문법 오류) · **C**(동시 실행 취소) · **B**(배지) · **P**(Pages 배포)

---

## 1단계: 저장소와 워크플로 파일 확인

🖥️ **터미널**

```bash
cd ~/git/my-todo-ci
ls -a
ls .github/workflows
git log --oneline | head
```

✅ **확인**

```
.  ..  .git  .github  .gitignore  README.md  index.html  package.json  src  tests
ci.yml
```

| 파일 | 역할 |
| --- | --- |
| `.github/workflows/ci.yml` | CI 정의 — 이벤트 3종, 매트릭스 Node 22·24, 문법 검사·테스트·요약·결과 파일 |
| `tests/todo.test.js` | CI가 실행하는 테스트 (35개, GUIDE 6단계에서 1개 추가) |
| `.gitignore` | `test-results.xml` 등 CI 결과 파일은 커밋하지 않음 |

🌐 **GitHub** — 저장소 첫 화면

- [ ] 최근 커밋 옆에 ✅ 가 있다. 클릭하면 `CI / test (Node 22)`, `CI / test (Node 24)` 가 보인다.
- [ ] **Settings › Rules › Rulesets** 에 `main 보호` 가 **Active** 다.

---

## 2단계: 성공한 실행 읽기

🌐 **Actions** 탭 → 목록 맨 위의 ✅ 실행 클릭

| # | 이렇게 해 본다 | 이렇게 되어야 한다 |
| --- | --- | --- |
| G1 | 실행 첫 화면(Summary) 보기 | 이벤트(`push` 또는 `pull_request`), 커밋, 걸린 시간, 잡 2개(✅ `test (Node 22)`, ✅ `test (Node 24)`) |
| G2 | Summary 아래쪽 보기 | `Node 22 — 테스트 35개, 실패 0개`, `Node 24 — 테스트 35개, 실패 0개` |
| G3 | **Artifacts** 의 `test-results-node24` 내려받기 → 압축 풀기 | `test-results.xml` 안에 `<testcase name="…">` 가 35개 |
| G4 | 왼쪽 `test (Node 22)` 클릭 → `버전 확인` 스텝 펼치기 | `v22.…` |
| G5 | `문법 검사` 스텝 펼치기 | `검사: src/app.js` … `검사: tests/todo.test.js` 4줄 |
| G6 | `단위 테스트` 스텝 펼치기 | ✔ 표시 35줄, `ℹ pass 35`, `ℹ fail 0` |
| G7 | 로그 오른쪽 위 ⚙ → **View raw logs** | 시간이 붙은 전체 로그가 새 탭에 열림 |

🖥️ 같은 내용을 터미널에서:

```bash
gh run list --limit 5                  # 최근 실행 5개
gh run view                            # 실행을 고르면 잡·스텝 요약
gh run download --name test-results-node24 --dir /tmp/ci-result && ls /tmp/ci-result
```

✅ **확인**
- [ ] G1~G7 이 기대와 같다.
- [ ] `gh run list` 첫 줄의 상태가 `completed  success` 다.

---

## 3단계: 손으로 실행하기와 다시 실행하기

| # | 이렇게 해 본다 | 이렇게 되어야 한다 |
| --- | --- | --- |
| M1 | 🌐 **Actions** → 왼쪽 **CI** → **Run workflow** → Branch `main` → **Run workflow** | 몇 초 뒤 목록에 이벤트가 `workflow_dispatch` 인 새 실행이 생기고 ✅ 로 끝남 |
| M2 | 🖥️ `gh workflow run ci.yml` → `gh run watch` | 같은 결과를 터미널에서 확인 |
| M3 | 🌐 끝난 실행 화면 오른쪽 위 **Re-run jobs** → **Re-run all jobs** | 같은 커밋으로 다시 실행. 화면 위에 `Attempt #2` 표시 |
| M4 | 🌐 **Re-run jobs** → **Re-run failed jobs** (실패가 있을 때만 보임) | 실패한 잡만 다시 실행 — 4단계에서 확인 |

> 💡 다시 실행(Re-run)은 **같은 코드**를 다시 돌린다. 코드를 고쳤다면 Re-run 이 아니라 **새 커밋을 push** 해야 한다.

✅ **확인**
- [ ] M1·M2 로 이벤트가 `workflow_dispatch` 인 실행이 생겼다.
- [ ] M3 후 실행 화면에 `Attempt #2` 가 보인다.

---

## 4단계: 실패를 일으키고 PR이 막히는지 보기

CI의 진짜 가치는 **망가진 코드를 막는 것**이다. 일부러 요구사항(최대 200자)을 어기는 변경을 PR로 올려 본다.

🖥️ **터미널**

```bash
git switch -c break/max-length
sed -i '' 's/export const MAX_LENGTH = 200;/export const MAX_LENGTH = 100;/' src/todo.js
git diff                                        # 200 → 100 확인
node --test 2>&1 | grep -E "^# (tests|fail)"     # 내 컴퓨터에서도 실패: fail 3
git commit -am "feat: shorten max length to 100"
git push -u origin break/max-length
gh pr create --fill
gh pr checks --watch
```

> `sed -i ''` 는 macOS 용이다. 편집기로 `src/todo.js` 의 `MAX_LENGTH = 200` 을 `100` 으로 바꿔도 된다.

| # | 이렇게 해 본다 | 이렇게 되어야 한다 |
| --- | --- | --- |
| F1 | `gh pr checks --watch` 결과 보기 | `test (Node 22)` ❌ `fail`, `test (Node 24)` ❌ `fail` — 둘 다 끝까지 실행됨 (`fail-fast: false`) |
| F2 | 🌐 PR 화면 아래쪽 | `Some checks were not successful`, **Merge pull request** 버튼이 비활성 + `Required statuses must pass before merging` |
| F3 | 🌐 PR 의 **Checks** 탭 또는 실패한 검사 옆 **Details** | `단위 테스트` 스텝에 ❌, 그 아래 `결과 요약`·`테스트 결과 파일 올리기` 는 ✅ (`if: always()`) |
| F4 | `단위 테스트` 로그에서 `✖ failing tests:` 찾기 | `✖ 상수: 최대 글자 수는 200이고 보기는 세 가지다` 와 `100 !== 200` 등 **실패 3개**와 이유 |
| F5 | 실행 Summary 보기 | `Node 22 — 테스트 35개, 실패 3개` |
| F6 | 🖥️ `gh run view --log-failed` | 실패한 스텝 로그만 터미널에 출력 |
| F7 | 🌐 **Files changed** 탭의 `src/todo.js` | 바뀐 줄 근처에 실패 표시(주석)가 붙을 수 있다 (없어도 정상) |

**고치기** — 요구사항이 200자이므로 변경을 되돌린다.

🖥️

```bash
sed -i '' 's/export const MAX_LENGTH = 100;/export const MAX_LENGTH = 200;/' src/todo.js
node --test 2>&1 | grep -E "^# (tests|fail)"     # fail 0
git commit -am "fix: restore max length to 200"
git push                                         # 같은 브랜치에 push → PR 이 자동으로 다시 검사
gh pr checks --watch
```

| # | 이렇게 해 본다 | 이렇게 되어야 한다 |
| --- | --- | --- |
| F8 | 🌐 PR 화면 | 새 커밋 기준으로 두 검사 ✅, **Merge** 버튼 활성 |
| F9 | 이 PR 은 실습용이므로 합치지 않고 닫기: 🖥️ `gh pr close --delete-branch` → `git switch main` | PR Closed, 원격·로컬 브랜치 삭제 |

✅ **확인**
- [ ] 실패한 PR은 **합칠 수 없었다** (F2).
- [ ] 로그에서 **어느 테스트가 왜** 실패했는지 찾았다 (F4).
- [ ] 같은 브랜치에 고친 커밋을 push 하자 자동으로 다시 검사되어 ✅ 가 되었다 (F8).

---

## 5단계: 문법 오류는 테스트 전에 잡히는지 보기

`src/app.js` 는 화면 코드라 단위 테스트가 없다. 그래도 `문법 검사` 스텝이 문법 오류를 잡는다.

🖥️

```bash
git switch -c break/syntax
echo 'function broken( {' >> src/app.js
node --check src/app.js          # 내 컴퓨터에서도 SyntaxError
git commit -am "chore: syntax error test"
git push -u origin break/syntax
gh pr create --fill
gh pr checks --watch
```

| # | 이렇게 해 본다 | 이렇게 되어야 한다 |
| --- | --- | --- |
| S1 | 실패한 잡의 스텝 목록 | `문법 검사` ❌, `단위 테스트` 는 **건너뜀(회색)** — 앞 스텝이 실패하면 다음 스텝은 실행되지 않음 |
| S2 | `문법 검사` 로그 | `검사: src/app.js` 다음에 `SyntaxError: Unexpected end of input` |
| S3 | `결과 요약` 스텝 | 실행은 되지만 `test-results.xml` 이 없어 `테스트 개수` 가 비어 있거나 0 (테스트가 실행되지 않았다는 뜻) |
| S4 | 🖥️ 정리: `gh pr close --delete-branch` → `git switch main` | PR 닫힘 |

✅ **확인**
- [ ] 테스트가 없는 파일의 문법 오류도 CI가 잡았다.
- [ ] 실패 지점 이후 스텝이 건너뛰어진 것을 보았다.

---

## 6단계: 새 커밋이 이전 실행을 취소하는지 보기

`concurrency` 설정을 확인한다.

🖥️

```bash
git switch -c try/concurrency
echo "<!-- 1 -->" >> index.html && git commit -am "chore: try 1" && git push -u origin try/concurrency
gh pr create --fill
echo "<!-- 2 -->" >> index.html && git commit -am "chore: try 2" && git push     # 첫 실행이 끝나기 전에 바로
```

| # | 이렇게 해 본다 | 이렇게 되어야 한다 |
| --- | --- | --- |
| C1 | 🌐 Actions 목록 | `chore: try 1` 실행이 회색 ⊘ **Cancelled**, `chore: try 2` 실행이 ✅ |
| C2 | 취소된 실행 열기 | `Canceling since a higher priority waiting request for 'ci-refs/pull/…' exists` 류의 안내 |
| C3 | 🖥️ 정리: `gh pr close --delete-branch` → `git switch main` | PR 닫힘 |

> 첫 실행이 너무 빨리 끝나 취소가 안 보이면, 두 번째 push 를 더 빨리 한다. 결과가 둘 다 ✅ 여도 기능에는 문제가 없다.

✅ **확인**
- [ ] 같은 PR 에서 앞선 실행이 Cancelled 로 끝났다.

---

## 7단계: (도전) 자동 배포 확인하기

[GUIDE 7단계(배지)](GUIDE.md#7-단계-상태-배지-달기) 와 [8단계(Pages)](GUIDE.md#8-단계-도전-github-pages-자동-배포-cd) 를 마쳤다면 확인한다.

| # | 이렇게 해 본다 | 이렇게 되어야 한다 |
| --- | --- | --- |
| B1 | 🌐 저장소 첫 화면 README | **CI passing** 배지 |
| B2 | 배지 클릭 | Actions 의 CI 워크플로 실행 목록 |
| P1 | 🌐 **Actions** → **Deploy to Pages** 최근 실행 | `test → build → deploy` 세 잡이 화살표로 이어져 모두 ✅ |
| P2 | `deploy` 잡 아래 링크 클릭 (또는 Settings › Pages 의 주소) | `https://<내 아이디>.github.io/my-todo-ci/` 에서 할 일 앱이 열림 |
| P3 | 배포된 앱에서 `우유 사기` 추가 → 체크 → 새로 고침 | 그대로 남아 있음 (localStorage) |
| P4 | 배포된 주소 뒤에 `tests/todo.test.js` 를 붙여 열기 | **404** — 테스트 파일은 배포하지 않았다 |
| P5 | 🌐 저장소 오른쪽 **Deployments** → `github-pages` | 배포 기록과 커밋 |

**배포가 테스트에 막히는지 확인** — 테스트를 깨뜨린 브랜치로 배포 워크플로를 실행해 본다. (이번에는 PR 규칙을 피해 확인하기 위해 **수동 실행**을 쓴다)

🖥️

```bash
git switch -c try/deploy-guard
sed -i '' 's/export const MAX_LENGTH = 200;/export const MAX_LENGTH = 100;/' src/todo.js
git commit -am "chore: break tests" && git push -u origin try/deploy-guard
gh workflow run pages.yml --ref try/deploy-guard
gh run watch
```

| # | 이렇게 해 본다 | 이렇게 되어야 한다 |
| --- | --- | --- |
| P6 | Deploy to Pages 실행 화면 | `test` ❌ → `build`, `deploy` 는 **건너뜀(skipped)** — 깨진 코드는 배포되지 않음 |
| P7 | 🌐 배포 주소 새로 고침 | 이전 버전 그대로 (영향 없음) |
| P8 | 🖥️ 정리: `git switch main` → `git push origin --delete try/deploy-guard` → `git branch -D try/deploy-guard` | 브랜치 삭제 |

> 💡 테스트를 통과하는 코드로 다른 브랜치에서 수동 실행하면, 이번에는 `deploy` 잡이 환경 보호 규칙(`github-pages` 는 main 만 배포)에 막힌다. 이것도 정상이다.

✅ **확인**
- [ ] B1·B2, P1~P5 가 기대대로다.
- [ ] 테스트가 실패하면 배포 잡이 실행되지 않았다 (P6).

---

## 문제 해결

| 증상 | 해결 |
| --- | --- |
| Actions 탭에 실행이 생기지 않는다 | `ls .github/workflows` 로 위치 확인. PR 이면 `pull_request` 이벤트가 `ci.yml` 에 있는지 확인 |
| `Invalid workflow file` | YAML 들여쓰기 오류. 오류 줄 번호 확인 후 [workflows/ci.yml](workflows/ci.yml) 과 비교. `actionlint` 로 검사 |
| 로컬은 통과하는데 CI 는 실패 | `git status` 로 커밋 안 한 파일 확인. 파일 이름 대소문자(Linux 러너는 구분) 확인 |
| PR 에 검사가 `Expected — Waiting for status…` 로 멈춤 | 규칙의 필수 검사 이름과 잡 이름이 다르다. Rulesets 에서 실제 이름으로 다시 추가 |
| `main` 에 push 가 거부된다 (`GH013`) | 정상 — 브랜치 규칙이 동작한 것. 브랜치 + PR 로 |
| Merge 버튼이 ✅ 인데도 비활성 | 규칙의 다른 조건(승인 수 등) 확인. 혼자 실습이면 Required approvals 를 0 으로 |
| `sed: 1: "src/todo.js": …` 오류 | Linux 의 sed 문법을 썼다. macOS 는 `sed -i '' '…'` |
| Pages 주소가 404 | 배포 직후 1~2분 기다린다. Settings › Pages 의 Source 가 **GitHub Actions** 인지 확인 |
| Pages 화면이 비어 있다 | 브라우저 Console 오류 확인. build 잡 로그에서 `_site/src` 가 복사되었는지 확인 |
| 실습용 브랜치·PR 이 너무 많다 | 🖥️ `gh pr list --state open` → `gh pr close <번호> --delete-branch` |
