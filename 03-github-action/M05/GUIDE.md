# 개념

즉, 로컬 터미널에서만 쓰던 Claude Code를 GitHub 저장소 자체(PR, 이슈)에 연결시켜서 팀 전체가 웹에서도 Claude를 호출할 수 있게 만드는 명령어예요. 개인 로컬 작업만 하신다면 필수는 아니고, 팀 협업이나 자동 코드 리뷰를 GitHub에서 직접 돌리고 싶을 때 유용합니다.

## 예제로 사용할 저장소
이 튜토리얼 전체에서는 아래와 같은 가상의 저장소를 예로 듭니다. 실제 실습 시 본인의 저장소 이름으로 바꿔서 진행하세요.

- GitHub 계정: `myusername`
- 저장소 이름: `todo-app`
- 전체 경로: `myusername/todo-app`

## 사전 준비물
- GitHub 계정과 해당 저장소에 대한 **관리자(admin) 권한**
- 로컬 컴퓨터에 Git이 설치되어 있고, 저장소가 클론(clone)되어 있을 것
- Claude Code CLI가 설치되어 있을 것 (터미널에서 `claude --version`으로 확인)
- Claude API 키 또는 Claude 구독(Pro/Max/Team/Enterprise) 계정

## 전체 흐름 요약 
- [ ] GitHub CLI 설치 및 로그인 완료
- [ ] 대상 저장소 폴더에서 Claude Code 실행
- [ ] `/install-github-app` 실행 및 인증 완료
- [ ] 워크플로우 선택 완료
- [ ] PR 확인 후 병합 완료
- [ ] `@claude` 멘션으로 실제 테스트 완료

# 0 단계: GitHub CLI 설치 및 로그인

`/install-github-app` 명령어는 내부적으로 GitHub CLI(`gh`)를 사용합니다. 먼저 이를 설치하고 인증해야 합니다.

## 실행 명령어
macOS(Homebrew 기준):
```bash
brew install gh
gh auth login
```

Windows(winget 기준):
```powershell
winget install --id GitHub.cli
gh auth login
```

`gh auth login` 실행 후 나오는 프롬프트에서:
1. `GitHub.com` 선택
2. `HTTPS` 선택
3. 브라우저로 로그인 인증 진행

## 규칙
- Claude Code는 `gh`가 설치되어 있는지 자동으로 확인하며, 없으면 경고를 표시합니다.
- 로그인하지 않은 상태에서는 다음 단계로 진행할 수 없습니다.

## 출력물 (예상 결과)
```
✓ Logged in to github.com as myusername
```

## 체크리스트
- [ ] `gh --version` 명령어가 정상적으로 버전을 출력한다
- [ ] `gh auth status` 실행 시 `Logged in to github.com` 메시지가 보인다

# 1 단계: 대상 저장소에서 Claude Code 실행

`/install-github-app`은 **연결하려는 저장소 안에서** 실행해야 합니다. 다른 폴더에서 실행하면 엉뚱한 저장소에 연결될 수 있습니다.

## 실행 명령어
```bash
cd ~/projects/todo-app
claude
```

터미널이 Claude Code 세션으로 전환되면 (예: `>` 프롬프트가 보이면) 준비가 끝난 것입니다.

## 규칙
- 반드시 Git 저장소의 루트 폴더(예: `.git` 폴더가 있는 위치)에서 실행해야 합니다.
- 저장소에 대한 admin 권한이 없으면 이후 단계가 실패합니다.

## 출력물 (예상 결과)
```
Welcome to Claude Code!
Working directory: ~/projects/todo-app
>
```

## 체크리스트
- [ ] 현재 폴더가 `todo-app` 저장소 루트인지 `pwd`로 확인했다
- [ ] Claude Code 프롬프트(`>`)가 정상적으로 떠 있다

# 2 단계: /install-github-app 명령어 실행

Claude Code 프롬프트 안에서 아래 명령어를 입력합니다.

## 실행 명령어
```
/install-github-app
```

이 명령어를 실행하면 Claude Code가 순서대로 다음을 진행합니다.
1. Claude GitHub App을 `myusername/todo-app`에 설치
2. 인증 방식 선택 (API 키 vs Claude 구독 토큰)
3. 인증 정보를 저장소 시크릿(secret)으로 저장
4. GitHub Actions 워크플로우 파일을 선택하고 브랜치에 푸시

## 규칙
- Claude Code가 이미 API 키를 갖고 있다면 그것을 재사용할지 물어봅니다.
- 저장소에 이미 `ANTHROPIC_API_KEY`가 설정되어 있다면 그대로 유지할지 선택할 수 있습니다.
- 인증 정보가 없다면 (a) Claude 구독으로 장기 토큰 생성, (b) API 키 직접 붙여넣기 중 하나를 선택합니다.

## 출력물 (예상 결과)
```
Installing Claude GitHub App on myusername/todo-app...
✓ App installed

Choose authentication method:
  1. Use Claude subscription (recommended)
  2. Paste an API key

> 1

✓ Token generated and saved as CLAUDE_CODE_OAUTH_TOKEN
```

## 체크리스트
- [ ] "App installed" 메시지를 확인했다
- [ ] 인증 방식(API 키 또는 구독 토큰)을 선택했다
- [ ] 시크릿이 저장되었다는 메시지를 확인했다


# 3 단계: 워크플로우 종류 선택

인증 설정이 끝나면 Claude Code가 어떤 GitHub Actions 워크플로우를 추가할지 물어봅니다.

## 선택 가능한 옵션
- **@claude 멘션 응답 워크플로우**: 이슈나 PR 댓글에 `@claude`를 태그하면 Claude가 응답
- **PR 자동 리뷰 워크플로우**: PR이 열릴 때마다 Claude가 자동으로 코드 리뷰

이 튜토리얼에서는 예제로 **@claude 멘션 응답 워크플로우**만 선택합니다.

## 실행 명령어 (Claude Code 프롬프트 내 선택)
```
> 1  (Respond to @claude mentions)
```

## 규칙
- 이미 `claude.yml` 파일이 있는 저장소라면 "최신 버전으로 워크플로우 파일 업데이트" 옵션이 대신 나타납니다.
- 여러 워크플로우를 동시에 선택할 수도 있습니다.

## 출력물 (예상 결과)
```
Selected: Respond to @claude mentions

Pushing branch: claude/install-github-app
Opening pull request in browser...
```

## 체크리스트
- [ ] 원하는 워크플로우(들)를 선택했다
- [ ] 브랜치가 푸시되고 PR 링크가 자동으로 열렸다


# 4 단계: 생성된 Pull Request 병합

Claude Code가 자동으로 브라우저를 열어 `.github/workflows/claude.yml` 파일을 추가하는 PR을 보여줍니다. 이 PR은 실제 저장소에 아직 반영되지 않은 상태이므로, 직접 확인 후 병합(merge)해야 합니다.

## 실행 순서
1. 브라우저에 열린 PR 페이지 확인 (예: `github.com/myusername/todo-app/pull/12`)
2. `Files changed` 탭에서 `.github/workflows/claude.yml` 내용 확인
3. `Merge pull request` 버튼 클릭
4. `Confirm merge` 클릭

## 출력물 (예상 결과, PR 내 파일 예시)
```yaml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
      actions: read
    steps:
      - uses: actions/checkout@v6
      - uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
```

## 규칙
- PR을 병합하기 전까지는 `@claude` 멘션이 작동하지 않습니다.
- API 키 대신 구독 토큰을 사용했다면 `claude_code_oauth_token` 항목이 자동으로 반영되어 있어야 합니다.

## 체크리스트
- [ ] PR 내용에 워크플로우 파일이 포함되어 있는지 확인했다
- [ ] PR을 병합(merge)했다
- [ ] 저장소의 `.github/workflows/` 폴더에 `claude.yml`이 생겼는지 확인했다

# 5 단계: 실제로 @claude 멘션해서 테스트하기

설정이 끝났다면 실제 이슈나 PR에서 Claude를 호출해봅니다.

## 실행 순서
1. `todo-app` 저장소에서 새 이슈 생성
2. 제목: `로그인 페이지에 유효성 검사 추가`
3. 댓글에 아래 내용 입력:
```
@claude 이 이슈에서 요청한 기능을 구현해줘
```
4. 몇 분 기다린 후 새로고침

## 규칙
- 댓글을 작성하는 사용자는 저장소에 대한 **쓰기(write) 권한**이 있어야 합니다.
- `@claude`는 정확히 완전한 단어로 포함되어야 하며, `/claude`나 `@claude-bot`은 인식되지 않습니다.

## 출력물 (예상 결과)
Claude가 같은 이슈에 댓글로 응답합니다.
```
🤖 Claude가 작업을 시작합니다...
- 관련 파일 확인 중: src/components/LoginForm.jsx
- 유효성 검사 로직 추가 중...
✓ PR #13 생성 완료: "feat: 로그인 폼 유효성 검사 추가"
```

## 체크리스트
- [ ] 이슈 또는 PR 댓글에 `@claude`를 정확히 입력했다
- [ ] Claude가 댓글로 응답을 남겼는지 확인했다
- [ ] Claude가 생성한 PR이 있다면 내용을 검토했다

# 문제 해결 (참고)

## 자주 발생하는 문제와 해결 방법
| 증상 | 원인 | 해결 방법 |
|---|---|---|
| `@claude`에 응답이 없음 | GitHub App 미설치 또는 워크플로우 비활성화 | 저장소 Settings → GitHub Apps에서 설치 여부 확인 |
| 인증 오류 발생 | API 키/토큰이 잘못됨 | 로컬에서 `claude` 명령어로 먼저 인증 테스트 |
| Claude가 커밋해도 CI가 안 돌아감 | 기본 `GITHUB_TOKEN`으로 커밋된 경우 CI가 자동 트리거되지 않음 | 워크플로우에서 커스텀 `github_token` 제거 |


