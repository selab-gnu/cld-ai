Git 동기화·Rebase 튜토리얼 — 원격과 어긋났을 때 정리하는 방법

목표: 원격 저장소에 로컬이 모르는 변경사항이 생겼을 때, `fetch`로 안전하게 확인하고 `rebase`로 히스토리를 깔끔하게 정리하기
전제: 「Git 기본 튜토리얼」에서 `my-recipe-book` 저장소와 `add-ingredients` 브랜치까지 만들어봤음

---

# Step 1. 원격에 먼저 변경사항이 생긴 상황 만들기 (실습용)

실제로는 팀원이 먼저 push했거나 다른 컴퓨터에서 작업했을 때 이런 상황이 생깁니다. 재현을 위해 GitHub 웹사이트에서 직접 `README.md`를 수정합니다.

1. GitHub 저장소 → `README.md` → 연필 아이콘(Edit)
2. 아무 줄 추가 (예: `Recipes for busy weeknights.`)
3. `Commit changes...` → `Commit directly to the main branch`

이제 원격 `main`과 로컬 `main`이 서로 다른 상태입니다. 로컬은 아직 이 변경을 모릅니다.

## 체크리스트
- [ ] GitHub 웹의 커밋 히스토리에 새 커밋이 하나 추가됨

---

# Step 2. `git fetch`로 원격 변경사항 "확인만" 하기

```bash
git checkout main
git fetch origin
git log --oneline --graph --all
```

`fetch`는 원격의 최신 정보를 로컬로 다운로드만 하고, 내 파일이나 브랜치는 건드리지 않습니다. 그래프를 보면 로컬 `main`과 `origin/main`이 갈라져 있는 것이 보입니다.

```
* a1b2c3d (origin/main) Update README via GitHub web
* f9e8d7c (HEAD -> main) Initial commit
```

## 규칙
- `fetch`는 언제 실행해도 안전합니다. 습관적으로 자주 실행해서 원격 상황을 파악하는 것이 좋습니다.

## 산출물
- 로컬에 `origin/main` 포인터가 최신 상태로 갱신됨 (내 `main` 자체는 아직 그대로)

## 체크리스트
- [ ] 그래프에서 `main`과 `origin/main`이 다른 지점을 가리킴을 확인

---

# Step 2-보충. `fetch` vs `pull` vs `pull --rebase`

| 명령어 | 하는 일 | 언제 쓰나 |
|---|---|---|
| `git fetch` | 원격 정보만 다운로드, 브랜치는 안 건드림 | 원격 상황을 안전하게 먼저 확인할 때 |
| `git pull` | `fetch` + `merge` (merge commit 생성될 수 있음) | 히스토리가 갈라져도 상관없이 빠르게 합칠 때 |
| `git pull --rebase` | `fetch` + `rebase` (일직선 히스토리 유지) | 히스토리를 깔끔하게 유지하고 싶을 때 |

---

# Step 3. `git pull`이 만드는 merge commit 관찰하기

```bash
git pull origin main
```

`pull`은 `fetch` + `merge`를 합친 명령어입니다. 자동으로 아래와 같은 merge commit이 생깁니다.

```
*   e5f6g7h Merge branch 'main' of https://github.com/...
|\
| * a1b2c3d Update README via GitHub web
* | f9e8d7c Initial commit
|/
```

작은 프로젝트에서 이런 merge commit이 쌓이면 히스토리가 지저분해집니다. 되돌리고 이후 단계에서 rebase로 정리해봅니다.

```bash
git reset --hard origin/main
```

## 규칙
- `merge`와 `rebase`는 결과 코드는 같지만 히스토리 모양이 다릅니다. merge는 "합쳐진 기록"을 남기고, rebase는 "처음부터 순서대로 있었던 것처럼" 다시 씁니다.
- `git reset --hard`는 로컬에만 있던 커밋을 지울 수 있으니, 실행 전 `git log`로 잃을 것이 없는지 확인하세요.

## 체크리스트
- [ ] `git reset --hard origin/main` 이후 `git log --oneline`이 원격과 동일함

---

# Step 4. `git rebase`로 브랜치 재정렬하기

```bash
git checkout add-ingredients
git rebase main
```

rebase는 내 브랜치의 커밋들을 `main`의 최신 커밋 위로 재배치합니다.

```
Before:
main:              f9e8d7c ─ a1b2c3d
add-ingredients:   f9e8d7c ─ [내 커밋]

After:
main:              f9e8d7c ─ a1b2c3d
add-ingredients:   f9e8d7c ─ a1b2c3d ─ [내 커밋]
```

## 규칙
- **이미 원격에 push한 브랜치를 rebase하면 히스토리가 재작성됩니다.** 나만 쓰는 브랜치일 때만 권장합니다. 다른 사람과 공유 중인 브랜치는 rebase 전에 반드시 상의하세요.

---

# Step 5. 충돌(conflict) 해결하기

같은 파일의 같은 줄을 양쪽에서 수정했다면 rebase 도중 멈춥니다.

```
CONFLICT (content): Merge conflict in README.md
error: could not apply f9e8d7c... Add ingredients list
```

파일을 열면 충돌 부분이 이렇게 표시됩니다.

```
<<<<<<< HEAD
Recipes for busy weeknights.
=======
# My Recipe Book (with quantities)
>>>>>>> f9e8d7c (Add ingredients list)
```

해결 순서:

```bash
# 1. 파일을 열어 <<<<<<< / ======= / >>>>>>> 마커를 지우고 원하는 내용으로 정리
# 2. 해결한 파일을 다시 stage
git add README.md
# 3. rebase 계속 진행
git rebase --continue
```

처음 상태로 완전히 되돌리고 싶다면:

```bash
git rebase --abort
```

## 규칙
- 충돌 마커(`<<<<<<<`, `=======`, `>>>>>>>`)를 반드시 전부 지운 뒤 커밋해야 합니다.

## 산출물
- `add-ingredients`가 최신 `main` 위에 재배치됨, 충돌 없는 일직선 히스토리

## 체크리스트
- [ ] `git status`에 "rebase in progress" 메시지가 더 이상 없음
- [ ] `git log --oneline --graph`로 히스토리가 일직선으로 정리됨

---

# Step 6. 재작성된 히스토리를 안전하게 push하기

이 브랜치를 이전에 push한 적이 있다면 일반 `push`는 거부됩니다.

```bash
git push origin add-ingredients
# ! [rejected]  add-ingredients -> add-ingredients (non-fast-forward)
```

```bash
git push --force-with-lease origin add-ingredients
```

| 명령어 | 의미 |
|---|---|
| `--force-with-lease` | 강제 push하되, 내가 fetch한 이후 원격에 다른 사람의 새 커밋이 추가되지 않았을 때만 허용 (안전장치) |
| `--force` | 무조건 덮어씀. 다른 사람의 작업을 실수로 날릴 수 있어 비권장 |

## 체크리스트
- [ ] GitHub 웹에서 `add-ingredients` 브랜치가 최신 상태로 보임

---

# Step 7. `main`에 합치기

```bash
git checkout main
git merge add-ingredients
git push origin main
```

Step 4에서 rebase로 이미 `main` 바로 위에 일직선으로 재배치되어 있으므로, 별도 merge commit 없이 fast-forward로 깔끔하게 합쳐집니다.

## 체크리스트
- [ ] `git log --oneline --graph`에 브랜치가 갈라짐 없이 하나의 선으로 합쳐짐
- [ ] GitHub 웹의 `main`에 `src/ingredients.md`가 반영됨

---

## 전체 흐름 요약

1. (실습) 원격에 GitHub 웹으로 직접 커밋해 로컬과 어긋난 상황 재현
2. `git fetch` — 안전하게 원격 상황 확인
3. `git pull`의 merge commit 문제 관찰 → `git reset --hard origin/main`으로 되돌림
4. `git rebase main` — 내 브랜치를 최신 위로 재배치
5. 충돌 시 마커 정리 → `git add` → `git rebase --continue`
6. `git push --force-with-lease` — 재작성된 히스토리 안전하게 push
7. `git merge`로 `main`에 fast-forward 병합

익숙해지면 2~4단계는 `git pull --rebase origin main` 한 줄로 대체할 수 있습니다.
