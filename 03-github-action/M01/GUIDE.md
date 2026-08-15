# 개념

`git`은 **버전 관리**(커밋, 브랜치, 히스토리)를 담당하는 도구이고, `gh`는 **GitHub 웹사이트에서 하는 일**(저장소 생성, 이슈, PR, 리뷰, 병합)을 터미널에서 그대로 할 수 있게 해주는 도구입니다.

즉, 지금까지 브라우저에서 마우스로 클릭하던 "New Issue" 버튼, "Create Pull Request" 버튼이 전부 `gh` 명령어 한 줄로 바뀐다고 생각하면 됩니다.

## `gh` 명령어의 기본 구조

```
gh <명사> <동사> [옵션]
```

예: `gh issue create`, `gh pr list`, `gh repo clone` — 항상 "무엇을(issue, pr, repo) + 어떻게 할지(create, list, view, close)" 순서입니다. 이 규칙만 기억해도 명령어를 외우지 않고 유추할 수 있습니다.

| 명사 | 의미 |
|---|---|
| `repo` | 저장소 |
| `issue` | 이슈 |
| `pr` | Pull Request |
| `project` | 프로젝트 보드 |

| 동사 | 의미 |
|---|---|
| `create` | 새로 만들기 |
| `list` | 목록 보기 |
| `view` | 상세 보기 |
| `close` | 닫기 |
| `merge` | 병합하기 |
| `edit` | 수정하기 |

## 전체 흐름 요약 (이번에 다룬 예제 기준)

1. `gh auth login` — 로그인
2. `gh repo create my-recipe-book --public --source=. --remote=origin --push` — 저장소 생성 & 연결
3. `gh issue create --title ... --body ...` — 할 일을 이슈로 등록 (`#1`)
4. `git checkout -b ...`, 코드 수정, `git commit` — 실제 작업 (순수 git)
5. `git push -u origin ...` — 브랜치 업로드
6. `gh pr create --body "Closes #1"` — PR 생성 & 이슈 연결
7. `gh pr view`, `gh pr diff` — 병합 전 검토
8. `gh pr merge --squash --delete-branch` — 병합 → 이슈 자동 종료
9. `gh issue list --state closed`로 최종 확인

이 9단계가 실무에서도 그대로 반복되는 기본 사이클입니다. 프로젝트가 무엇이든(레시피 앱, 투두 앱, Ralph로 만든 프로젝트 등) 이 흐름은 동일합니다.

# 1 단계: 설치 및 로그인

```bash
# macOS
brew install gh

# 설치 확인
gh --version
```

```bash
gh auth login
```

실행하면 아래 순서로 질문이 나옵니다. 처음이라면 그대로 따라가면 됩니다.

1. `What account do you want to log into?` → `GitHub.com`
2. `What is your preferred protocol for Git operations?` → `HTTPS`
3. `Authenticate Git with your GitHub credentials?` → `Yes`
4. `How would you like to authenticate?` → `Login with a web browser`

터미널에 8자리 코드가 뜨고, 브라우저가 자동으로 열립니다. 그 코드를 입력하면 로그인이 완료됩니다.

## 규칙
- `gh auth login`은 컴퓨터 하나당 한 번만 하면 됩니다. 이후 모든 `gh` 명령어는 별도 로그인 없이 바로 동작합니다.

## 체크리스트
- [ ] `gh auth status` 실행 시 `Logged in to github.com as [내 계정]` 표시됨


# 2 단계:`gh repo create` — 예제 저장소 만들기

이제부터 계속 사용할 예제 프로젝트 `my-recipe-book`을 만듭니다. 레시피를 정리하는 간단한 개인 프로젝트라고 가정합니다.

```bash
mkdir my-recipe-book && cd my-recipe-book
git init
echo "# My Recipe Book" > README.md
git add README.md
git commit -m "Initial commit"
```

여기까지는 순수 `git` 명령어입니다. 이제 이 로컬 저장소를 GitHub에 올립니다.

```bash
gh repo create my-recipe-book --public --source=. --remote=origin --push
```

## 규칙

| 옵션 | 의미 |
|---|---|
| `my-recipe-book` | 만들 저장소 이름 |
| `--public` | 공개 저장소로 생성 (비공개는 `--private`) |
| `--source=.` | 현재 폴더(`.`)의 내용을 저장소 소스로 사용 |
| `--remote=origin` | 원격 저장소 이름을 `origin`으로 등록 (`git remote add origin ...`을 자동으로 해줌) |
| `--push` | 로컬의 현재 브랜치를 즉시 GitHub로 push |

## 산출물
- GitHub 웹사이트에 `my-recipe-book` 저장소 생성됨
- 로컬 `git remote -v`에 `origin`이 등록됨

## 체크리스트
- [ ] `gh repo view --web` 실행 시 방금 만든 저장소가 브라우저에서 열림
- [ ] `git remote -v`에 `origin https://github.com/...`이 표시됨


# 3 단계: `gh issue create` — 할 일을 이슈로 등록하기

레시피 앱에 "재료 목록에 수량 표시 기능"을 추가하고 싶다고 가정합니다. 코드를 짜기 전에, 먼저 이슈로 등록해봅니다.

```bash
gh issue create \
  --title "Add quantity display to ingredient list" \
  --body "Each ingredient in a recipe should show its quantity (e.g. '2 cups flour') instead of just the name."
```

실행하면 터미널에 다음과 비슷한 결과가 나옵니다.

```
https://github.com/내계정/my-recipe-book/issues/1
```

**이 `1`이라는 번호를 기억해두세요.** 이후 계속 이 번호로 이슈를 참조합니다.

## 규칙

| 옵션 | 의미 |
|---|---|
| `--title` | 이슈 제목 |
| `--body` | 이슈 본문(상세 설명) |

`--title`, `--body`를 생략하고 그냥 `gh issue create`만 입력하면, 터미널이 대화형으로 하나씩 물어봅니다. 처음엔 이 방식이 더 편할 수 있습니다.


## 산출물
- 이슈 `#1` 생성됨

### 이슈 목록/상세 확인하기

```bash
gh issue list          # 열려 있는 이슈 목록
gh issue view 1        # 1번 이슈 상세 내용
gh issue view 1 --web  # 브라우저로 1번 이슈 열기
```

## 체크리스트
- [ ] `gh issue list`에 방금 만든 이슈가 `#1`로 표시됨


# 4 단계: 실제 작업하기 (브랜치 → 수정 → 커밋)

이 단계는 `git` 명령어이고, 다음 Step에서 `gh`로 이어집니다.

```bash
git checkout -b add-quantity-display

mkdir -p src
cat > src/ingredient.md << 'EOF'
# Ingredient Display Format

- 2 cups flour
- 1 tsp salt
- 3 eggs
EOF

git add src/ingredient.md
git commit -m "Add quantity display to ingredient list"
```

## 체크리스트
- [ ] `git branch`로 `add-quantity-display` 브랜치에 있는지 확인
- [ ] `git log --oneline -1`로 방금 커밋이 보임


# 5 단계: `git push` — 브랜치를 GitHub에 올리기

```bash
git push -u origin add-quantity-display
```

`-u`(`--set-upstream`)는 이 브랜치를 앞으로 `origin`의 같은 이름 브랜치와 연결하겠다는 의미입니다. 한 번 설정해두면 다음부터는 그냥 `git push`만 입력해도 됩니다.

## 체크리스트
- [ ] 터미널에 `remote: Create a pull request for 'add-quantity-display' on GitHub by visiting: ...` 메시지가 표시됨 (아직 클릭할 필요 없음, Step 6에서 명령어로 만들 것)


# 6 단계: `gh pr create` — Pull Request 만들고 이슈와 연결하기

```bash
gh pr create \
  --title "Add quantity display to ingredient list" \
  --body "Closes #1" \
  --base main
```

## 규칙

| 옵션 | 의미 |
|---|---|
| `--title` | PR 제목 |
| `--body "Closes #1"` | PR 본문. `Closes #번호`라고 쓰면 이 PR이 병합될 때 **1번 이슈가 자동으로 닫힙니다** |
| `--base main` | 이 브랜치를 어떤 브랜치에 합칠지 지정 (기본값이 `main`이면 생략 가능) |

`Closes` 대신 `Fixes`, `Resolves`도 같은 역할을 합니다.

실행하면 PR URL이 출력됩니다.

```
https://github.com/내계정/my-recipe-book/pull/1
```

## 더 편한 방법: `--fill`

커밋 메시지를 그대로 PR 제목/본문으로 채우고 싶다면:

```bash
gh pr create --fill --body "Closes #1"
```

## 산출물
- Pull Request `#1` 생성, 이슈 `#1`과 연결됨

## 체크리스트
- [ ] `gh pr view --web` 실행 시 PR 페이지 우측에 "Linked issues"로 `#1`이 표시됨

# 7 단계: `gh pr view`, `gh pr diff` — PR 내용 확인하기

병합하기 전에 무엇이 바뀌었는지 확인하는 습관을 들이면 좋습니다.

```bash
gh pr view          # 현재 브랜치의 PR 요약 정보
gh pr diff           # 실제 코드 변경 내용(diff) 확인
gh pr checks          # CI 체크 결과 확인 (설정되어 있다면)
```

## 체크리스트
- [ ] `gh pr diff`로 `src/ingredient.md`가 새로 추가된 것이 보임

# 8 단계:`gh pr merge` — 병합하고 이슈 자동 종료 확인하기

```bash
gh pr merge --squash --delete-branch
```

## 규칙

| 옵션 | 의미 |
|---|---|
| `--squash` | 이 브랜치의 여러 커밋을 하나로 합쳐서 `main`에 병합 (히스토리 깔끔하게 유지) |
| `--delete-branch` | 병합 후 로컬·원격의 `add-quantity-display` 브랜치를 자동 삭제 |

다른 병합 방식:
- `--merge`: 병합 커밋을 만들며 그대로 합침 (히스토리 전부 보존)
- `--rebase`: 커밋들을 재정렬해서 일직선으로 합침

## 산출물

```bash
gh issue list --state closed
```

`Closes #1`이 정상적으로 처리되어 방금 이슈가 `closed` 상태로 나타납니다.

## 체크리스트
- [ ] `gh issue view 1`에서 상태가 `Closed`로 표시됨
- [ ] `git branch`에 `add-quantity-display`가 더 이상 보이지 않음 (`--delete-branch` 효과)
- [ ] `git checkout main && git pull`로 최신 상태 반영

# 자주 쓰는 `gh` 명령어 모아보기 (치트시트)

| 상황 | 명령어 |
|---|---|
| 남의 저장소를 내 컴퓨터로 복제 | `gh repo clone owner/repo` |
| 열려 있는 이슈만 필터링해서 보기 | `gh issue list --state open` |
| 특정 사람이 만든 이슈만 보기 | `gh issue list --author username` |
| 이슈에 라벨 붙이기 | `gh issue edit 1 --add-label bug` |
| PR에 리뷰어 지정하기 | `gh pr edit 1 --add-reviewer username` |
| 내 계정에 할당된 이슈만 보기 | `gh issue list --assignee @me` |
| 저장소를 브라우저로 바로 열기 | `gh repo view --web` |
| 어떤 이슈/PR이든 브라우저로 열기 | `gh issue view 1 --web` / `gh pr view 1 --web` |

## 공통 팁
- 대부분의 `gh` 하위 명령어에 **`--web` 옵션**을 붙이면 터미널 대신 브라우저로 바로 열립니다. 명령어가 헷갈릴 때 임시방편으로 유용합니다.
- 옵션 없이 `gh issue create`, `gh pr create`처럼 명령어만 입력하면 **대화형 모드**로 하나씩 물어봐줍니다. 옵션을 다 외우지 않아도 괜찮습니다.
- `gh <명사> --help`로 각 명령어의 전체 옵션을 언제든 확인할 수 있습니다. 예: `gh issue create --help`