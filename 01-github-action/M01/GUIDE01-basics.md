Git 기본 튜토리얼 — `my-recipe-book` 예제로 익히는 저장소 생성부터 브랜치까지

목표: 로컬 저장소 생성 → 커밋 → GitHub 원격 연결 → 브랜치 작업까지의 기본 흐름 익히기
전제: 터미널 사용에는 익숙하지만 git 명령어는 처음
참고: 원격과 어긋난 상황을 정리하는 `fetch`/`pull`/`rebase`는 별도 튜토리얼(「Git 동기화·Rebase 튜토리얼」)에서 다룹니다.

---

# Step 1. `git --version`으로 설치 확인, `git config`로 사용자 정보 등록

```bash
git --version
git config --global user.name "본인 이름"
git config --global user.email "본인 이메일"
```

## 규칙
- 사용자 정보 설정은 컴퓨터당 한 번만 하면 됩니다. 커밋에 "누가 만들었는지" 기록하는 용도입니다.

## 체크리스트
- [ ] `git --version` 정상 출력
- [ ] `git config --global --list`에 `user.name`, `user.email`이 보임

---

# Step 2. 로컬 저장소 만들기 — `git init`

```bash
mkdir my-recipe-book && cd my-recipe-book
git init
```

`git init`은 현재 폴더를 git이 추적하는 폴더로 만듭니다. 숨김 폴더 `.git`에 모든 히스토리가 저장됩니다.

## 규칙
- `.git` 폴더는 직접 건드리지 말고 항상 `git` 명령어로만 다룹니다.
- 저장소는 프로젝트 최상위 폴더 하나에만 만듭니다.

## 산출물
- `my-recipe-book/.git` 생성

## 체크리스트
- [ ] `git status` 실행 시 오류 없이 상태 메시지 출력됨

---

# Step 3. 파일 추가하고 첫 커밋하기 — `add`, `status`, `commit`

```bash
echo "# My Recipe Book" > README.md
git status                  # README.md가 "Untracked"로 표시됨
git add README.md
git status                  # "Changes to be committed"로 이동
git commit -m "Initial commit"
```

Git은 파일을 3단계 공간(Working Directory → Staging Area → Repository)으로 옮기며 기록합니다. `add`는 Staging으로, `commit`은 Repository로 확정하는 단계입니다.

## 규칙
- 커밋 메시지는 "무엇을 했는지" 짧고 명확하게 씁니다.
- `git add .`은 편하지만 의도치 않은 파일까지 올라갈 수 있으니, 먼저 `git status`로 확인하는 습관을 들입니다.

## 산출물
- 첫 번째 커밋 생성

## 체크리스트
- [ ] `git status`에 "nothing to commit, working tree clean" 표시됨
- [ ] `git log`에 방금 커밋이 보임

---

# Step 4. 커밋 히스토리 확인하기 — `git log`

```bash
git log
git log --oneline
git log --graph --oneline --all
```

## 체크리스트
- [ ] `git log --oneline`에 커밋 해시와 메시지가 한 줄로 표시됨

---

# Step 5. GitHub에 원격 저장소 만들고 연결하기

브라우저에서 GitHub → `New repository` → 이름 `my-recipe-book` → **"Add a README file" 체크 해제** → `Create repository`

```bash
git remote add origin https://github.com/내계정/my-recipe-book.git
git push -u origin main
```

| 명령어 | 의미 |
|---|---|
| `git remote add origin <URL>` | `origin`이라는 이름으로 원격 주소 등록 |
| `git push -u origin main` | 로컬 `main`을 원격에 올림. `-u`는 이후 `git push`만 써도 되게 기억시킴 |

## 규칙
- 원격 저장소 이름은 관례적으로 `origin`을 씁니다.
- `-u`는 브랜치당 한 번만 설정하면 됩니다.

## 산출물
- 로컬과 GitHub 원격 저장소 연결, 커밋 히스토리 업로드됨

## 체크리스트
- [ ] `git remote -v`에 `origin` 주소 표시됨
- [ ] GitHub 페이지에 `README.md`가 보임

---

# Step 6. 브랜치 만들어 기능 작업하기

```bash
git branch                         # 브랜치 목록 확인
git checkout -b add-ingredients    # 새 브랜치 생성 + 이동

mkdir -p src
cat > src/ingredients.md << 'EOF'
# Ingredients
- Flour
- Salt
- Eggs
EOF

git add src/ingredients.md
git commit -m "Add ingredients list"
git push -u origin add-ingredients
```

## 규칙
- `main`에서 직접 작업하기보다 기능 하나당 브랜치 하나를 만들면 문제가 생겼을 때 되돌리기 쉽습니다.

## 산출물
- `add-ingredients` 브랜치, 새 커밋 1개, 원격에 push됨

## 체크리스트
- [ ] `git branch`에 `* add-ingredients`로 표시됨
- [ ] GitHub에 `add-ingredients` 브랜치가 보임

---

## 다음 단계
- 원격 저장소와 로컬이 어긋났을 때 정리하는 방법(`fetch`, `pull`, `rebase`, 충돌 해결)은 「Git 동기화·Rebase 튜토리얼」에서 이어집니다.
- 동시에 여러 브랜치를 작업하고 싶다면 「Git Worktree 튜토리얼」을 참고하세요.
