# 개념

**Ralph 자체에는 GitHub 연동 기능이 내장되어 있지 않습니다.** Ralph는 순수하게 로컬 git 브랜치, `prd.json`, `progress.txt`만으로 동작합니다. 따라서 이 튜토리얼은 Ralph 위에 **GitHub CLI(`gh`)를 이용한 이슈·PR 관리 레이어를 얹는 방법**을 다룹니다. Ralph 자체를 수정하는 것이 아니라, Ralph 실행 전후로 몇 가지 명령을 추가하는 방식입니다.

## 전체 흐름 요약

1. `gh auth login`으로 GitHub CLI 인증
2. (필요 시) `gh repo create`로 로컬 프로젝트를 GitHub와 연결
3. `prd.json`의 각 user story → `gh issue create`로 GitHub 이슈 생성
4. (선택) `prd.json`에 `githubIssue` 필드 기록
5. (선택, 심화) `CLAUDE.md`에 커밋 메시지 이슈 연동 규칙 추가
6. Ralph 실행 (`./scripts/ralph/ralph.sh`)
7. 완료된 브랜치 push → `gh pr create --body "Closes #N ..."`로 PR 생성
8. 로컬 확인 후 `gh pr merge` → 관련 이슈 자동 Closed
9. (선택) `gh project create`로 전체 진행 상황 보드화

# 0 단계: 사전 준비

- [ ] GitHub CLI(`gh`) 설치 — macOS: `brew install gh`
- [ ] `gh auth login` 실행해서 GitHub 계정 인증 완료
- [ ] 프로젝트가 이미 GitHub 원격 저장소와 연결되어 있는지 확인 (`git remote -v`), 없다면 Step 1에서 생성

## 체크리스트
- [ ] `gh --version` 정상 출력
- [ ] `gh auth status`에 "Logged in to github.com" 표시됨

# 1 단계: 로컬 프로젝트를 GitHub 저장소와 연결하기

이미 GitHub 저장소가 있다면 이 단계는 건너뛰고 Step 2로 이동하세요.

```bash
# 프로젝트 루트에서
gh repo create your-project-name --private --source=. --remote=origin --push
```

- `--private`: 비공개 저장소로 생성 (공개하려면 `--public`)
- `--source=.`: 현재 폴더를 저장소 내용으로 사용
- `--push`: 현재 브랜치(main)를 즉시 push

## 산출물
- GitHub에 새 원격 저장소 생성, `origin`으로 연결됨

## 체크리스트
- [ ] `git remote -v`에 `origin`이 표시됨
- [ ] `gh repo view --web`으로 브라우저에서 저장소가 정상 생성됐는지 확인

# 2 단계:`prd.json`의 user story를 GitHub 이슈로 만들기

Ralph가 작업할 각 story를 GitHub 이슈로도 등록해두면, 진행 상황을 GitHub에서 시각적으로 추적할 수 있고 나중에 PR과 자동으로 연결됩니다.

Claude Code에서:

```
prd.json의 각 userStory를 gh issue create 명령으로 하나씩 만들어줘.
제목은 title, 본문은 description과 acceptanceCriteria를 포함해서 작성해줘.
```

AI가 각 story마다 아래와 같은 명령을 실행합니다.

```bash
gh issue create \
  --title "Add priority field to database" \
  --body "**User Story**
As a developer, I need to store task priority so it persists across sessions.

**Acceptance Criteria**
- Add priority column to tasks table: 'high' | 'medium' | 'low' (default 'medium')
- Generate and run migration successfully
- Typecheck passes"
```

## 규칙
- 이슈 제목에 `prd.json`의 `id`(예: `US-001`)를 접두어로 넣으면, 이슈와 story를 나중에 서로 대조하기 쉽습니다.
- 이슈 하나 = story 하나로 1:1 매핑하는 것을 권장합니다 (여러 story를 이슈 하나에 몰아넣지 마세요).
— 직접 하나씩 실행하는 방법은 다음과 같습니다.
```bash
gh issue create --title "US-001: Add priority field to database" \
  --body "As a developer, I need to store task priority so it persists across sessions."
```
이 때, 실행하면 터미널에 이슈 URL과 번호(`#1`, `#2`, ...)가 출력됩니다. **이 번호를 꼭 기록해두세요.**

## 산출물
- GitHub 저장소의 Issues 탭에 story 개수만큼 이슈 생성됨

- [ ] `gh issue list`로 생성된 이슈 목록과 번호 확인
- [ ] 이슈 개수가 `prd.json`의 `userStories` 개수와 일치함

# 3 단계: `prd.json`에 이슈 번호 기록해두기 (선택이지만 권장)

이슈 번호를 story와 연결해두면, 나중에 커밋 메시지나 PR에서 어떤 이슈를 참조해야 하는지 헷갈리지 않습니다.

`prd.json`을 열어 각 story에 `githubIssue` 필드를 추가합니다.

```json
{
  "id": "US-001",
  "title": "Add priority field to database",
  "description": "...",
  "acceptanceCriteria": ["..."],
  "priority": 1,
  "passes": false,
  "notes": "",
  "githubIssue": 1
}
```

> `githubIssue` 필드는 Ralph 자체가 사용하지는 않지만(무시됨), 사람이 참조하거나 Step 6에서 PR 본문을 자동 생성할 때 활용할 수 있는 메모입니다.

## 체크리스트
- [ ] 모든 story에 `githubIssue` 번호가 채워짐 (`cat prd.json | jq '.userStories[] | {id, githubIssue}'`로 확인)

# 4 단계: (선택, 심화) Ralph 커밋에 이슈 번호 자동 참조시키기

기본적으로 Ralph는 이슈 번호를 모르는 상태로 커밋합니다. 커밋 단위로 이슈를 연결하고 싶다면, Ralph 실행 지침 파일을 커스터마이징해야 합니다.

`scripts/ralph/CLAUDE.md`(Claude Code용) 파일 맨 아래에 다음 지침을 추가합니다.

```markdown
### GitHub Issue 연동 규칙
- prd.json의 각 user story에는 `githubIssue` 필드가 있다.
- 해당 story 작업을 커밋할 때, 커밋 메시지 마지막 줄에 반드시
  `Closes #<githubIssue 번호>` 를 포함할 것.
- 예: "Add priority column to tasks table

  Closes #1"
```

## 규칙
- `Closes #번호`, `Fixes #번호`, `Resolves #번호` 중 하나를 쓰면, 해당 커밋이 포함된 PR이 **default 브랜치(main)에 병합될 때 이슈가 자동으로 닫힙니다.**
- feature 브랜치에서 커밋만 한 상태로는 이슈가 닫히지 않습니다. main에 머지되는 시점에 닫힙니다.
- 이 단계는 선택사항입니다. 생략하고 Step 6에서 **PR 본문에 한 번에 모든 이슈를 참조**하는 방식(더 간단)을 써도 충분합니다.

## 체크리스트
- [ ] `CLAUDE.md`에 이슈 연동 규칙 문단이 추가됨

# 5 단계: Ralph 실행하기 (복습)

```bash
./scripts/ralph/ralph.sh --tool claude 10
```

이전 튜토리얼과 동일합니다. Step 4를 설정했다면 커밋 메시지에 `Closes #N`이 포함된 것을 `git log`로 확인할 수 있습니다.

```bash
git log --oneline -5
```

## 체크리스트
- [ ] `prd.json`에서 완료된 story들의 `passes`가 `true`로 바뀜
- [ ] (Step 4를 했다면) 커밋 메시지에 `Closes #N` 포함 확인

# 6 단계: 완료된 브랜치를 GitHub에 Push하고 Pull Request 만들기

```bash
# 현재 Ralph가 작업한 브랜치 확인
git branch

# 원격에 push
git push -u origin ralph/작업브랜치이름
```

### PR 생성 — 완료된 모든 이슈를 한 번에 연결하기

```bash
gh pr create \
  --title "Task priority system" \
  --body "Implements task priority feature via Ralph.

Closes #1
Closes #2
Closes #3
Closes #4" \
  --base main
```

`prd.json`에서 완료된 story의 `githubIssue` 번호들을 뽑아 자동으로 본문을 만들고 싶다면 AI에게 요청할 수 있습니다.

```
prd.json에서 passes: true인 story들의 githubIssue 번호를 모아서
"Closes #N" 목록을 만들고, gh pr create 명령을 실행해줘.
```

## 규칙
- `Closes #N`은 PR **본문(body)**에 있어야 합니다. 커밋 메시지 대신 PR 본문에 한 번만 몰아서 적어도 동일하게 작동합니다.
- 아직 리뷰 전이라면 `--draft` 플래그로 초안 PR을 만들 수 있습니다: `gh pr create --draft ...`

## 산출물
- GitHub에 Pull Request 생성, 관련 이슈들과 자동 링크됨

## 체크리스트
- [ ] `gh pr view --web`으로 PR 페이지 열어서 "Closes #1" 등이 우측 사이드바 "Linked issues"에 표시되는지 확인
- [ ] PR에 포함된 커밋 목록이 예상한 story들과 일치함


# 7 단계: 리뷰 후 병합 — 이슈 자동 종료 확인

로컬 앱을 직접 실행해서 확인(이전 튜토리얼 참고)한 뒤 문제가 없으면 병합합니다.

```bash
gh pr merge --squash
```

- `--squash`: 여러 커밋을 하나로 합쳐 병합 (히스토리를 깔끔하게 유지하고 싶을 때 권장)
- `--merge`: 병합 커밋 생성
- `--rebase`: 리베이스 후 병합

병합이 완료되면 PR 본문에 있던 `Closes #1`, `Closes #2` 등이 자동으로 처리되어 **해당 이슈들이 자동으로 Closed 상태**가 됩니다.

## 체크리스트
- [ ] `gh issue list --state closed`로 방금 닫힌 이슈들이 보임
- [ ] `gh issue list --state open`에 남은 이슈가 다음에 처리할 story와 일치함

# 8 단계: (선택) GitHub Projects 보드로 전체 진행 상황 시각화하기

여러 이슈를 칸반 보드 형태로 한눈에 보고 싶다면:

```bash
gh project create --owner @me --title "Ralph Task Board"
```

생성 후 GitHub 웹에서 프로젝트를 열어 이슈들을 드래그해 Todo / In Progress / Done 컬럼으로 분류하거나, 저장소 Issues 탭에서 "Projects" 사이드바로 이슈를 프로젝트에 연결할 수 있습니다.

## 체크리스트
- [ ] `gh project list --owner @me`로 생성된 프로젝트 확인
- [ ] Issues 탭에서 각 이슈에 프로젝트가 연결됨

# 문제 해결 가이드

| 증상 | 확인할 것 |
|---|---|
| `gh` 명령이 인증 오류를 냄 | `gh auth status` 확인, 필요 시 `gh auth login` 재실행 |
| PR 병합 후에도 이슈가 안 닫힘 | PR **본문**에 `Closes #N` 정확한 키워드·번호가 있는지, base 브랜치가 default 브랜치(main)인지 확인 |
| 다른 저장소의 이슈를 참조하고 싶음 | `Closes owner/repo#번호` 형식 사용 |
| 이슈 여러 개를 동시에 닫고 싶음 | 각 이슈 번호 앞에 `Closes`를 매번 반복해서 적어야 함 (한 번만 쓰고 번호 나열하면 첫 번째만 인식됨) |
