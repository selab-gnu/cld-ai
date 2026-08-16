Git Worktree 튜토리얼 — 브랜치 전환 없이 동시에 여러 작업하기

목표: `my-recipe-book` 예제에서, `main` 작업 중간에 갑자기 급한 수정 건이 생겼을 때 stash 없이 별도 폴더에서 동시에 작업하기
전제: 「Git 기본 튜토리얼」까지 완료, `git --version`이 2.5 이상 (`git worktree`는 Git 2.5부터 지원)

---

## Worktree가 왜 필요한가

기존 방식(worktree 없이)은 이렇습니다.

```
1. 지금 하던 작업을 git stash로 임시 저장
2. git checkout hotfix-branch
3. 급한 수정 작업
4. 커밋 후 다시 git checkout main
5. git stash pop으로 하던 작업 복구
```

브랜치 전환마다 파일이 통째로 바뀌고, 빌드 캐시나 실행 중인 개발 서버가 매번 깨지는 게 불편합니다. **worktree는 같은 저장소를 가리키는 별도의 폴더를 만들어서, 폴더만 옮기면 브랜치를 동시에 열어둘 수 있게 해줍니다.** `stash`도 `checkout`도 필요 없습니다.

```
my-recipe-book/            ← main 브랜치, 원래 작업 그대로 유지
my-recipe-book-hotfix/     ← 새 worktree, hotfix 브랜치 작업 중
```

두 폴더는 같은 `.git` 히스토리를 공유하지만(디스크 낭비 없음), 서로 다른 브랜치를 동시에 체크아웃한 상태로 존재합니다.

---

# Step 1. 지금 작업 상태에서 새 worktree 추가하기

`my-recipe-book`에서 한창 새 레시피 기능을 작업하던 중, "재료 목록 오타"라는 급한 수정 요청이 들어왔다고 가정합니다.

```bash
cd my-recipe-book
git worktree add -b hotfix/typo ../my-recipe-book-hotfix main
```

## 명령어 분해

| 부분 | 의미 |
|---|---|
| `git worktree add` | 새 worktree(작업 폴더) 생성 |
| `-b hotfix/typo` | `hotfix/typo`라는 새 브랜치를 만들면서 |
| `../my-recipe-book-hotfix` | 이 경로에 새 폴더를 만들고 |
| `main` | `main` 브랜치를 기준점으로 새 브랜치 생성 |

## 규칙
- 같은 브랜치는 동시에 두 worktree에서 체크아웃할 수 없습니다 (`main`이 이미 원래 폴더에서 열려 있다면, 다른 worktree에서 또 `main`을 열려고 하면 거부됩니다).
- worktree 폴더는 보통 원래 저장소와 같은 위치에 형제 폴더(`../`)로 만드는 것이 관리하기 편합니다.

## 산출물
- `../my-recipe-book-hotfix` 폴더 생성, `hotfix/typo` 브랜치가 그 안에 체크아웃됨

## 체크리스트
- [ ] `ls ../my-recipe-book-hotfix`에 기존 프로젝트 파일이 그대로 보임
- [ ] 원래 `my-recipe-book` 폴더의 파일은 전혀 바뀌지 않음

---

# Step 2. 두 폴더에서 동시에 작업하기

```bash
# 새 worktree에서 급한 수정
cd ../my-recipe-book-hotfix
# 오타 수정...
git add src/ingredients.md
git commit -m "Fix typo in ingredients list"
git push -u origin hotfix/typo
```

그동안 원래 폴더(`my-recipe-book`)는 전혀 건드리지 않았으므로, 하던 작업이 그대로 남아있습니다.

```bash
cd ../my-recipe-book
git status   # 하던 작업이 그대로 있음 (stash 안 했음에도)
```

## 체크리스트
- [ ] 원래 폴더로 돌아왔을 때 `git status`에 하던 변경사항이 그대로 남아있음
- [ ] `hotfix/typo` 브랜치가 원격에 push됨

---

# Step 3. 전체 worktree 목록 확인하기

```bash
git worktree list
```

```
/Users/me/my-recipe-book         abcd123 [main]
/Users/me/my-recipe-book-hotfix  ef56789 [hotfix/typo]
```

각 worktree가 어느 경로에서 어느 브랜치를 체크아웃 중인지 한눈에 보여줍니다.

## 체크리스트
- [ ] `git worktree list`에 두 개의 경로와 브랜치가 표시됨

---

# Step 4. 기존 브랜치를 새 worktree로 열기 (새 브랜치 없이)

이미 있는 브랜치를 다른 폴더에서 열고 싶을 때는 `-b` 없이 브랜치 이름만 지정합니다.

```bash
git worktree add ../my-recipe-book-review add-ingredients
```

`-b`를 생략하면 새 브랜치를 만들지 않고, 기존 `add-ingredients` 브랜치를 그 폴더에 체크아웃합니다. 동료의 PR을 로컬에서 직접 실행해보고 싶을 때 유용합니다.

## 규칙
- 이미 다른 worktree(또는 원래 폴더)에서 체크아웃 중인 브랜치는 그대로 열 수 없습니다. 이 경우 `git fetch` 후 그 브랜치가 어디서도 열려있지 않은지 확인하세요.

## 체크리스트
- [ ] `git worktree list`에 세 번째 경로가 추가됨

---

# Step 5. 다 쓴 worktree 정리하기

작업이 끝난 worktree는 폴더를 그냥 지우면 안 되고, `git worktree remove`로 정리해야 합니다.

```bash
git worktree remove ../my-recipe-book-hotfix
```

만약 커밋되지 않은 변경사항이 남아있어 거부된다면:

```bash
git worktree remove --force ../my-recipe-book-hotfix
```

폴더를 실수로 손으로 지워버렸을 경우, git의 내부 기록에는 아직 worktree 정보가 남아있을 수 있습니다. 이때 정리하는 명령:

```bash
git worktree prune
```

## 규칙
- 폴더를 `rm -rf`로 직접 지우면 git 내부에는 "유령 worktree" 기록이 남을 수 있습니다. 가능하면 `git worktree remove`를 사용하고, 이미 지웠다면 `git worktree prune`으로 정리하세요.
- 더 이상 필요 없는 브랜치는 worktree 제거와 별개로 `git branch -d hotfix/typo`로 따로 삭제해야 합니다 (worktree 삭제가 브랜치까지 자동으로 지우진 않음).

## 산출물
- `../my-recipe-book-hotfix` 폴더 제거, git 내부 worktree 목록에서도 제거됨

## 체크리스트
- [ ] `git worktree list`에 더 이상 해당 경로가 보이지 않음
- [ ] 브랜치가 더 필요 없다면 `git branch -d hotfix/typo`로 삭제

---

## 자주 쓰는 worktree 명령어 모음

| 상황 | 명령어 |
|---|---|
| 새 브랜치와 함께 worktree 생성 | `git worktree add -b <새브랜치> <경로> <기준브랜치>` |
| 기존 브랜치를 새 worktree로 열기 | `git worktree add <경로> <기존브랜치>` |
| 브랜치 없이 임시로 특정 커밋만 확인 | `git worktree add -d <경로> <커밋 또는 태그>` |
| 전체 worktree 목록 확인 | `git worktree list` |
| worktree 제거 | `git worktree remove <경로>` |
| 유령 worktree 정리 | `git worktree prune` |

## 언제 worktree를 쓰면 좋은가

- 작업 중간에 급한 hotfix가 생겼을 때 (이번 예제)
- 동료의 PR을 stash 없이 로컬에서 바로 실행해서 리뷰하고 싶을 때
- 여러 AI 코딩 에이전트(Claude Code 등)를 서로 다른 브랜치에서 동시에 병렬로 돌리고 싶을 때
- 이전 릴리스 버전을 열어두고 최신 개발 브랜치와 동시에 비교하고 싶을 때

---

## 전체 흐름 요약

1. `git worktree add -b <브랜치> <경로> <기준브랜치>` — 새 폴더에 새 브랜치로 worktree 생성
2. 원래 폴더와 새 폴더에서 각각 독립적으로 작업 (stash 불필요)
3. `git worktree list` — 전체 worktree 현황 확인
4. `git worktree add <경로> <기존브랜치>` — 이미 있는 브랜치를 다른 폴더에서 열기
5. `git worktree remove <경로>` — 다 쓴 worktree 정리, 필요 시 `git worktree prune`
