# 기본 사이클

> 개념과 문서 종류별 방법은 [README.md](README.md#개념)에 정리되어 있습니다.

> 이 가이드는 작은 예제 앱 `todo-app`에 문서를 하나씩 붙여 가며 **문서화의 한 바퀴**를 돌아봅니다.
> **규칙 준비 → 요구사항 → 설계 → API 문서 → 매뉴얼 → 이슈 보고서 → 기능 추가와 문서 동기화**
> 각 단계에서 Claude Code에게 문서를 쓰게 하고, 사람은 검토하고, `npm run docs:check`로 확인합니다.

```
예제 저장소 + 문서화 규칙(CLAUDE.md, 스킬) 준비
   │
   ▼
요구사항 목록 (원본) ──────────────┐
   │                               │
   ▼                               │  npm run docs:check
설계 모델: C4 그림(생성) + ADR(원본) │  로 매 단계 확인
   │                               │
   ▼                               │
API 문서 (OpenAPI 원본 → HTML 생성) │
   │                               │
   ▼                               │
사용자 매뉴얼 (Diátaxis)            │
   │                               │
   ▼                               │
이슈 보고서 → 수정 → CHANGELOG ─────┤
   │                               │
   ▼                               │
기능 추가 → 어긋남 발견 → 문서 동기화 ┘
```

| 단계 | 만드는 문서 | 쓰는 스킬 |
|---|---|---|
| 1 | `CLAUDE.md`, `.claude/skills/`, `.github/ISSUE_TEMPLATE/` | — |
| 2 | `docs/requirements.md` | `requirements` |
| 3 | `docs/architecture/overview.md`, `docs/adr/` | `architecture`, `adr` |
| 4 | `docs/api/openapi.yaml` | `api-docs` |
| 5 | `docs/manual/` | `user-manual` |
| 6 | `docs/issues/`, `CHANGELOG.md` | `bug-report` |
| 7 | 위 문서 전체 갱신 | `doc-sync` |

---

# 0 단계: 준비하기

- macOS / Windows / Linux 컴퓨터
- **Node.js 22 이상** ([nodejs.org](https://nodejs.org)에서 LTS 버전 설치)
- **git**
- **Claude Code** (터미널에서 `claude`로 실행)
- 인터넷 연결 — 4단계에서 `npx`로 Redocly CLI를 내려받습니다.
- (선택) GitHub 계정과 `gh` CLI — 6단계에서 이슈를 GitHub에 올려 보려면 필요합니다.

확인:

```bash
node --version
git --version
claude --version
```

## 규칙
> 예제 앱은 외부 라이브러리를 쓰지 않으므로 `npm install`이 필요 없습니다.

## 산출물
- 없음

## 체크리스트
- [ ] `node --version`이 `v22` 이상인지 확인한다.

# 1 단계: 예제 저장소와 문서화 규칙 준비

1. 예제 폴더를 작업 위치로 복사합니다. 이 모듈 폴더(`M06-documentation`)에서 실행합니다.

   ```bash
   mkdir -p ~/work
   cp -r todo-app ~/work/todo-app
   ```

2. 문서화 규칙, 스킬, 이슈 양식을 복사합니다.

   ```bash
   cp CLAUDE.md ~/work/todo-app/
   mkdir -p ~/work/todo-app/.claude ~/work/todo-app/.github
   cp -r skills ~/work/todo-app/.claude/skills
   cp -r templates/ISSUE_TEMPLATE ~/work/todo-app/.github/
   ```

3. 저장소로 이동해 동작을 확인합니다.

   ```bash
   cd ~/work/todo-app
   git init
   npm test
   npm run docs:check
   ```

   `npm test`는 `pass 10`, `fail 0`이어야 합니다. `docs:check`는 아직 문서가 없으므로 **경고 3개, 오류 0개**가 정상입니다.

4. `CLAUDE.md`를 열어 **문서 지도**와 **규칙 8가지**를 읽어 봅니다. Claude Code는 이 저장소에서 실행될 때마다 이 파일을 읽고 따릅니다.

5. 첫 커밋을 만듭니다.

   ```bash
   git add .
   git commit -m "todo-app 초기 버전 + 문서화 규칙"
   ```

## 규칙
> 예제 폴더는 반드시 **모듈 밖으로 복사해서** 씁니다. 모듈 폴더 안에서 `git init`을 하면 교재 저장소 안에 저장소가 생깁니다.

> 스킬은 `.claude/skills/<이름>/SKILL.md` 위치에 있어야 Claude Code가 인식합니다. 복사 후 `ls .claude/skills`로 7개 폴더가 보이는지 확인하세요.

## 산출물
- git 저장소 `~/work/todo-app/` (소스, 테스트, `CLAUDE.md`, 스킬 7종, 이슈 양식)

## 체크리스트
- [ ] `npm test`가 `pass 10`, `fail 0`인지 확인한다.
- [ ] `npm run docs:check`가 `오류 0개, 경고 3개`인지 확인한다.
- [ ] `ls .claude/skills`에 `adr api-docs architecture bug-report doc-sync requirements user-manual`이 보이는지 확인한다.

# 2 단계: 요구사항 목록 만들기

이미 동작하는 코드에서 요구사항을 **거꾸로 뽑아내고**, 사람이 확인한 뒤 테스트와 연결합니다.

1. `todo-app` 폴더에서 Claude Code를 실행합니다.

   ```bash
   claude
   ```

2. 요구사항 추출을 요청합니다.

   ```text
   requirements 스킬을 사용해서 src/와 test/를 읽고 docs/requirements.md를 만들어줘.
   사용자가 관찰할 수 있는 동작만 EARS 문형으로 적고, 모든 행의 상태는 '제안'으로 둬.
   테스트로 확인되지 않는 동작은 검증 칸을 비워 둬.
   ```

3. **사람이 검토합니다.** 표를 읽으며 다음을 확인합니다.
   - 한 행에 한 가지 동작만 있는가? (추가와 오류 처리가 한 행에 섞여 있으면 나눠 달라고 요청)
   - 내부 구현(함수 이름, `reduce` 같은 것)이 아니라 사용자가 보는 동작인가?
   - 빠진 동작은 없는가? (예: 빈 목록일 때의 메시지, `TODO_FILE` 환경 변수)

4. 검토가 끝나면 확정을 요청합니다.

   ```text
   검토했어. 테스트가 있는 요구사항은 '구현됨'으로, 테스트가 없는 요구사항은 '승인'으로 바꾸고
   검증 칸에 "확인 필요 — 테스트 없음"이라고 적어줘.
   그리고 '구현됨' 요구사항을 검증하는 테스트 이름 앞에 [REQ-xxx]를 붙여줘.
   ```

5. 확인하고 커밋합니다.

   ```bash
   npm test
   npm run docs:check
   git add .
   git commit -m "docs: 요구사항 목록"
   ```

## 규칙
> 에이전트가 코드에서 추정한 요구사항은 **사실이 아니라 제안**입니다. 사람이 확인하기 전에는 `제안` 상태로 둡니다(CLAUDE.md 규칙 3).

> 요구사항 ID는 한 번 쓰면 다시 쓰지 않습니다. 폐기한 요구사항도 행을 지우지 말고 상태를 `폐기`로 바꿉니다.

> 테스트가 없는 요구사항이 보이면 그것이 곧 **테스트가 비어 있는 곳**입니다. 이번 실습에서는 `승인`으로 남겨 두지만, 실제 프로젝트에서는 테스트를 추가할 대상입니다.

## 산출물
- `docs/requirements.md` (범위, 요구사항 표, 용어)
- 테스트 이름에 `[REQ-xxx]` 표시

## 체크리스트
- [ ] 모든 요구사항이 EARS 문형("~하면, 시스템은 ~해야 한다")으로 되어 있는지 확인한다.
- [ ] `npm run docs:check`의 [1] 요구사항 추적에 `✗`가 없는지 확인한다.
- [ ] `npm test` 출력에서 테스트 이름 앞에 `[REQ-xxx]`가 보이는지 확인한다.

# 3 단계: 설계 모델링 (C4 그림 + ADR)

**지금 구조**는 코드에서 그림으로 생성하고, **왜 그렇게 했는지**는 ADR로 남깁니다.

1. Claude Code에서 아키텍처 그림을 요청합니다.

   ```text
   architecture 스킬을 사용해서 docs/architecture/overview.md를 만들어줘.
   시스템 컨텍스트, 컨테이너, 컴포넌트 그림과 POST /todos 처리 순서의 시퀀스 다이어그램을 Mermaid로 그려줘.
   ```

2. 그림을 확인합니다. VS Code라면 마크다운 미리보기(`Cmd/Ctrl + Shift + V`)에서 그림으로 보입니다. GitHub에 올리면 GitHub도 그림으로 보여 줍니다.
   - 컴포넌트 그림의 화살표가 실제 `import` 문과 같은지 `src/` 파일을 열어 대조해 봅니다.

3. 이미 내려진 결정을 ADR로 남깁니다. **이유는 코드에 없으므로 사람이 알려 줘야 합니다.**

   ```text
   adr 스킬을 사용해서 "할 일 목록을 JSON 파일 하나에 저장한다"는 결정을 ADR-0001로 써줘.
   배경은 이래: 교육용 예제라서 한 사람이 한 컴퓨터에서 쓰고, 할 일은 많아야 수백 개야.
   설치 없이 Node.js만으로 실행돼야 해. 대안으로 SQLite와 별도 DB 서버를 검토했어.
   docs/adr/README.md 목록도 만들고, overview.md의 관련 결정에 링크해줘.
   ```

4. ADR을 읽고 내용이 맞으면 상태를 `승인`으로 바꾸라고 요청한 뒤 확인하고 커밋합니다.

   ```bash
   npm run docs:check
   git add .
   git commit -m "docs: 아키텍처 그림과 ADR-0001"
   ```

## 규칙
> 그림에는 **코드에서 확인한 것만** 그립니다. 앞으로의 계획이나 배포 환경처럼 코드에 없는 것은 그리지 않습니다.

> ADR의 "배경"과 "고려한 대안"을 에이전트가 지어내게 두지 마세요. 프롬프트에 사람이 알려 주거나, 모르는 부분은 "확인 필요"로 남깁니다.

> `승인`된 ADR은 고치지 않습니다. 결정이 바뀌면 새 ADR을 쓰고 옛 ADR을 `대체됨`으로 표시합니다. 그래야 "언제, 왜 바뀌었는지"가 남습니다.

## 산출물
- `docs/architecture/overview.md` (Mermaid 그림 4개)
- `docs/adr/README.md`, `docs/adr/0001-json-file-storage.md`

## 체크리스트
- [ ] 미리보기에서 Mermaid 그림 4개가 오류 없이 보이는지 확인한다.
- [ ] ADR에 `## 상태`, `## 배경`, `## 결정`, `## 결과`가 있고 `npm run docs:check`의 [3]에 `✗`가 없는지 확인한다.

# 4 단계: API 문서 만들기 (OpenAPI)

`todo-app`은 `npm start`로 HTTP API 서버도 띄울 수 있습니다. 이 API의 명세를 OpenAPI로 쓰고, 검사하고, HTML로 만들어 봅니다.

1. Claude Code에서 명세 작성을 요청합니다.

   ```text
   api-docs 스킬을 사용해서 src/app.js의 HTTP API를 docs/api/openapi.yaml로 문서화해줘.
   성공 응답과 발생할 수 있는 모든 오류 응답, 오류 코드, 예시를 빠짐없이 적어줘.
   다 쓰면 npm run docs:api:lint를 실행해서 결과를 알려줘.
   ```

2. 검사 결과를 봅니다. Redocly의 기본 규칙(`recommended`)은 엄격해서 처음에는 오류나 경고가 나오는 것이 보통입니다.
   - 명세가 빠뜨린 것(오류 응답, 예시 등)은 **명세를 고칩니다.**
   - 이 앱에 맞지 않는 규칙(예: 서버 주소가 localhost라는 경고)은 `redocly.yaml`에서 이미 꺼 두었습니다. 파일을 열어 **왜 껐는지 주석**을 읽어 보세요.

3. 사람이 보는 HTML 문서를 만들어 브라우저로 엽니다.

   ```bash
   npm run docs:api:build
   ```

   `docs/api/index.html`이 생깁니다. 이 파일은 생성물이라 `.gitignore`에 들어 있습니다.

4. 명세와 서버가 맞는지 확인하고 커밋합니다.

   ```bash
   npm run docs:check
   git add .
   git commit -m "docs: API 명세 (OpenAPI)"
   ```

## 규칙
> **원본은 `openapi.yaml` 하나**입니다. HTML, 클라이언트 코드, 에이전트용 문서(`llms.txt`)는 모두 여기서 생성합니다. 생성물을 손으로 고치지 않습니다.

> 오류 응답까지 적어야 쓸모 있는 명세입니다. 성공 응답만 있는 명세를 보고 만든 클라이언트는 오류를 처리하지 못합니다.

> 검사 규칙을 끌 때는 명세를 억지로 맞추지 말고 `redocly.yaml`에서 끄되, **이유를 주석으로** 남깁니다.

## 산출물
- `docs/api/openapi.yaml` (검사 통과)
- `docs/api/index.html` (생성물, 커밋하지 않음)

## 체크리스트
- [ ] `npm run docs:api:lint`가 `Your API description is valid`로 끝나는지 확인한다.
- [ ] 브라우저에서 `docs/api/index.html`을 열어 경로 3개와 오류 응답이 보이는지 확인한다.
- [ ] `npm run docs:check`의 [2]가 `서버 경로 3개, 문서 경로 3개`인지 확인한다.

# 5 단계: 사용자 매뉴얼 쓰기 (Diátaxis)

매뉴얼을 **독자의 상황**에 따라 네 종류로 나눠 씁니다.

| 종류 | 독자의 상황 | 파일 |
|---|---|---|
| 튜토리얼 | 처음 써 본다 | `tutorial.md` |
| 하우투 | 특정 일을 하고 싶다 | `how-to.md` |
| 레퍼런스 | 정확한 사양을 찾는다 | `reference.md` |
| 설명 | 왜 이렇게 동작하는지 궁금하다 | `explanation.md` |

1. Claude Code에서 매뉴얼 작성을 요청합니다.

   ```text
   user-manual 스킬을 사용해서 docs/manual/에 사용자 매뉴얼을 써줘.
   명령은 TODO_FILE=manual-demo.json으로 실제로 실행해서 나온 출력만 붙이고, 끝나면 그 파일은 지워줘.
   README.md에서 매뉴얼로 가는 링크도 추가해줘.
   ```

2. **사람이 검토합니다.**
   - 튜토리얼을 실제로 처음부터 따라 해 봅니다. 출력이 문서와 똑같이 나오나요?
   - 레퍼런스의 오류 메시지 표가 `src/` 안의 메시지를 빠짐없이 담고 있나요? (`grep -rn "throw\|sendError\|console.error" src/`로 대조)
   - 튜토리얼에 옵션 나열 같은 레퍼런스 내용이 섞여 있지 않나요?

3. 확인하고 커밋합니다.

   ```bash
   npm run docs:check
   git add .
   git commit -m "docs: 사용자 매뉴얼"
   ```

## 규칙
> 매뉴얼의 명령 출력은 **실제로 실행해서 얻은 것만** 씁니다(CLAUDE.md 규칙 6). 에이전트는 그럴듯한 출력을 지어낼 수 있으니 반드시 대조하세요.

> 한 문서에 두 종류를 섞지 않습니다. 튜토리얼은 한 가지 흐름만, 레퍼런스는 빠짐없이.

## 산출물
- `docs/manual/index.md`, `tutorial.md`, `how-to.md`, `reference.md`, `explanation.md`
- `README.md`의 문서 링크

## 체크리스트
- [ ] 튜토리얼을 처음부터 따라 했을 때 출력이 문서와 같은지 확인한다.
- [ ] `npm run docs:check`의 [4] 문서 링크에 `✗`가 없는지 확인한다.

# 6 단계: 이슈 보고서 쓰고 해결하기

예제 앱에는 일부러 남겨 둔 버그가 하나 있습니다. 이 버그를 재현하고, 보고서를 쓰고, 고치는 과정을 문서로 남깁니다.

1. 버그를 직접 재현해 봅니다.

   ```bash
   TODO_FILE=bug-demo.json node src/cli.js add 우유 사기
   TODO_FILE=bug-demo.json node src/cli.js done abc
   rm bug-demo.json
   ```

   `오류: NaN번 할 일을 찾을 수 없습니다.`가 나옵니다. 사용자는 `NaN`이 무엇인지 알 수 없습니다.

2. `.github/ISSUE_TEMPLATE/bug_report.yml`을 열어 버그 보고에 어떤 항목이 필수인지 봅니다.

3. Claude Code에서 보고서 작성을 요청합니다. **아직 고치지 말라고** 분명히 적습니다.

   ```text
   bug-report 스킬을 사용해서 이 버그의 이슈 보고서를 docs/issues/에 써줘. 아직 코드는 고치지 마.
   증상: node src/cli.js done abc 를 실행하면 "NaN번 할 일을 찾을 수 없습니다"가 나와.
   비슷한 입력(번호 없음, 소수)도 재현해 보고, 원인 추정에는 근거 파일과 줄 번호를 적어줘.
   ```

4. 보고서를 검토하고 커밋합니다. (선택) GitHub 저장소가 있다면 이슈로 올려 봅니다.

   ```bash
   git add .
   git commit -m "docs: 이슈 0001 보고"
   # 선택: gh issue create --title "[버그] ..." --label bug --body-file docs/issues/0001-....md
   ```

5. 이제 고치도록 요청합니다.

   ```text
   docs/issues/0001 보고서대로 버그를 고쳐줘.
   먼저 요구사항을 추가하고, 테스트를 쓰고, 코드를 고친 다음 doc-sync 스킬로 관련 문서를 모두 갱신해줘.
   보고서 상태도 해결됨으로 바꾸고 CHANGELOG.md를 만들어 Fixed에 기록해줘.
   ```

6. 확인하고 커밋합니다. 커밋 메시지에 이슈를 연결합니다.

   ```bash
   npm test
   npm run docs:check
   npm run docs:api:lint
   git add .
   git commit -m "fix: done에 정수가 아닌 번호를 넣으면 형식 오류를 알린다" -m "Fixes docs/issues/0001"
   ```

## 규칙
> **재현하기 전에는 보고서를 쓰지 않습니다.** 보고서의 "실제 결과"는 직접 실행한 출력이어야 합니다.

> 보고서에는 **관찰한 사실**과 **원인 추정**을 나눠 적습니다. 추정에는 근거(파일, 줄 번호)를 붙입니다.

> 버그 수정도 요구사항에 흔적을 남깁니다. "어떤 동작이 옳은가"가 요구사항에 없었기 때문에 생긴 버그라면, 요구사항을 먼저 추가합니다.

## 산출물
- `docs/issues/0001-....md` (상태: 해결됨)
- 새 요구사항(예: REQ-011)과 그 테스트
- 오류 코드가 추가된 `openapi.yaml`, 오류 메시지가 추가된 `reference.md`
- `CHANGELOG.md` (`Fixed`)

## 체크리스트
- [ ] `node src/cli.js done abc`가 이제 번호 형식 오류 메시지를 출력하는지 확인한다.
- [ ] `docs/requirements.md`에 새 요구사항이 `구현됨`으로 있는지 확인한다.
- [ ] `openapi.yaml`과 `reference.md`에 새 오류가 반영되었는지 확인한다.
- [ ] `npm test`, `npm run docs:check`, `npm run docs:api:lint`가 모두 통과하는지 확인한다.

# 7 단계: 기능 추가와 문서 동기화

마지막으로 **할 일 삭제** 기능을 추가합니다. 이번에는 일부러 코드만 먼저 고쳐서, 검사 스크립트가 문서의 어긋남을 잡아내는 것을 직접 봅니다.

1. **의도부터 문서로.** 요구사항과 설계 결정을 먼저 씁니다.

   ```text
   할 일 삭제 기능을 추가하려고 해.
   requirements 스킬로 "번호를 지정해 삭제"와 "없는 번호 삭제 시 오류" 요구사항을 '승인' 상태로 추가해줘.
   그리고 adr 스킬로 삭제 방식을 ADR-0002로 써줘. 하드 삭제(목록에서 완전히 지움)로 정했고,
   소프트 삭제와 "마지막 번호를 따로 저장"하는 방식도 검토했어.
   하드 삭제를 하면 번호가 재사용될 수 있는데, 그건 감수하기로 했어.
   ```

   ADR을 읽고 내용이 맞으면 `승인`으로 바꾸게 합니다.

2. **코드만 구현합니다.** (검사 스크립트를 보기 위한 실습용 순서입니다.)

   ```text
   삭제 기능을 구현해줘. CLI는 remove 번호, API는 DELETE /todos/{id}(성공하면 204)야.
   테스트도 추가해줘. 이번에는 실습을 위해 문서(docs/, CHANGELOG.md)는 건드리지 마.
   ```

3. 검사를 실행해 어긋남을 확인합니다.

   ```bash
   npm test
   npm run docs:check
   ```

   테스트는 통과하지만 `docs:check`는 실패합니다.

   ```
   [2] API 문서 (src/app.js routes ↔ docs/api/openapi.yaml)
     ✗ DELETE /todos/{id} — 서버에는 있는데 API 문서에 없습니다.
   ```

   **사람이 문서 고치기를 잊어도 여기서 걸립니다.** CI에 `npm run docs:check`를 넣어 두면 이런 변경은 병합되지 않습니다.

4. 문서를 동기화합니다.

   ```text
   doc-sync 스킬을 사용해서 이번 삭제 기능 변경에 맞게 문서를 모두 갱신해줘.
   고칠 필요가 없다고 판단한 문서는 이유를 한 줄씩 알려줘.
   ```

   에이전트가 고친 문서와 그 이유를 읽어 봅니다. 예를 들어 아키텍처 그림은 새 파일이나 새 의존 관계가 없으므로 그대로 두는 것이 맞습니다.

5. 모두 확인하고 커밋합니다.

   ```bash
   npm test
   npm run docs:check
   npm run docs:api:lint
   git add .
   git commit -m "feat: 할 일 삭제 (REQ-012, REQ-013, ADR-0002)"
   ```

6. `git show --stat`으로 이번 커밋에 코드와 문서가 함께 들어갔는지 확인합니다.

## 규칙
> **의도(요구사항, 결정)는 코드보다 먼저**, **설명(API 문서, 매뉴얼)은 코드와 같은 커밋에** 씁니다.

> 실제 작업에서는 2번처럼 "문서는 건드리지 마"라고 하지 않습니다. CLAUDE.md 규칙 1에 따라 에이전트가 처음부터 함께 고칩니다. 이번 순서는 검사 스크립트의 역할을 보기 위한 실습용입니다.

> `doc-sync`가 "고칠 필요 없음"이라고 한 문서도 이유가 맞는지 사람이 확인합니다.

## 산출물
- `docs/adr/0002-hard-delete.md`
- 삭제 기능이 반영된 요구사항, API 명세, 매뉴얼(레퍼런스·하우투·설명), `CHANGELOG.md` (`Added`)
- 코드와 문서가 함께 담긴 커밋 1개

## 체크리스트
- [ ] 3번에서 `docs:check`가 `DELETE /todos/{id}` 누락을 잡아냈는지 확인한다.
- [ ] 4번 뒤 `npm test`, `npm run docs:check`, `npm run docs:api:lint`가 모두 통과하는지 확인한다.
- [ ] `docs/manual/explanation.md`에 "삭제 후 번호 재사용"이 ADR-0002 링크와 함께 설명되어 있는지 확인한다.
- [ ] 완성 예시 `example-result/`와 비교해 빠진 문서가 없는지 확인한다(SAMPLE.md 3절).

---

# 문제 해결

| 증상 | 해결 |
|---|---|
| Claude Code가 스킬을 쓰지 않는다 | 스킬 위치가 `.claude/skills/<이름>/SKILL.md`인지 확인하고 Claude Code를 다시 시작합니다. 프롬프트에 "○○ 스킬을 사용해서"라고 이름을 적으면 확실합니다. |
| `npm run docs:api:lint`가 오래 걸리거나 실패한다 | 처음 실행할 때 `npx`가 Redocly CLI를 내려받습니다. 인터넷 연결을 확인하세요. |
| Mermaid 그림이 미리보기에 안 보인다 | VS Code에서는 "Markdown Preview Mermaid Support" 확장을 설치합니다. 문법 오류는 [mermaid.live](https://mermaid.live)에 붙여 넣어 확인합니다. |
| `docs:check`가 `✗ REQ-xxx — 상태가 '구현됨'인데 …`를 낸다 | 그 요구사항을 검증하는 테스트 이름 앞에 `[REQ-xxx]`를 붙이거나, 테스트가 없다면 상태를 `승인`으로 되돌립니다. |
| `docs:check`가 API 경로를 못 읽는다 | `openapi.yaml`의 들여쓰기가 경로 2칸, 메서드 4칸인지 확인합니다. |
| 테스트 중 `todos.json`이 생겼다 | `.gitignore`에 들어 있어 커밋되지 않습니다. 지워도 됩니다. |

# 다음 단계

- **CI에 넣기** — GitHub Actions에서 `npm test`, `npm run docs:check`, `npm run docs:api:lint`를 실행하면 문서가 어긋난 PR은 병합되지 않습니다.
- **에이전트용 문서 색인** — `docs/`의 주요 문서를 링크한 `llms.txt`를 만들어, 다른 에이전트가 이 프로젝트 문서를 빠르게 찾게 해 봅니다.
- **훅으로 자동화** — Claude Code의 훅으로 작업이 끝날 때마다 `npm run docs:check`가 실행되게 해 봅니다.
- **위키 생성 도구와 함께 쓰기** — OpenWiki 같은 도구로 코드 설명 위키를 생성하고, 이 모듈의 원본 문서(요구사항, ADR)를 위키 작성 지침에 연결해 봅니다.
