# 따라 하기: 이슈에서 PR까지

명령어는 뜻을 외우지 않아도 됩니다. 
회색 상자의 한 줄을 복사해 붙여 넣고, 결과를 확인한 뒤 다음 단계로 이동하세요.

## 0단계 — 준비물과 담당자 확인

필요한 것:

- GitHub 계정
- 실습용 GitHub 저장소의 쓰기 권한
- GitHub Actions 사용 가능 상태
- AI 엔진 하나: GitHub Copilot, OpenAI Codex, Claude 또는 Gemini API
- Windows 10/11 PC와 관리자 설치 권한

GitHub 관리자께서는 적용하실 때 먼저 “실습 저장소에서 GitHub Actions와 AI 엔진 사용이 허용되는지” 확인하세요.

## 1단계 — Windows에 도구 설치

GitHub 웹에서만 워크플로를 만들고 편집한다면 WSL은 필요하지 않습니다. Windows PC에서 `gh aw compile`, `gh aw run` 등 **gh-aw CLI를 사용하려면 WSL 2를 사용** 합니다. 
공식 빠른 시작의 지원 환경도 `Linux, macOS, or Windows with WSL`로 안내합니다.

### WSL 2를 써도 Windows용 SW를 만들 수 있나요?

네. WSL 2는 GitHub AI 자동화 도구를 실행하기 위한 **보조 개발 환경** 입니다. WSL 2를 사용한다고 해서 결과물이 Linux용 프로그램으로 바뀌지는 않습니다.

역할을 다음과 같이 나눕니다.

| 환경 | 담당 작업 |
|---|---|
| WSL 2 | Git, GitHub CLI, `gh-aw` 워크플로 작성·컴파일·실행 |
| Windows | Visual Studio, CAD 프로그램, Windows용 SW 빌드·실행·검증 |
| GitHub Actions | 이슈 분류와 PR 생성 등 저장소 자동화 |

특히 다음 항목은 반드시 Windows에서 확인합니다.

- `.exe`, `.msi` 등 Windows 실행·설치 파일
- .NET Windows Desktop 프로그램
- AutoCAD, SolidWorks 등 CAD 프로그램과의 연동
- Windows API, COM, 레지스트리를 사용하는 기능
- 실제 CAD 프로그램을 실행해야 하는 자동 테스트
- Windows 파일 경로, 권한과 한글 파일명 처리

> 핵심 원칙: WSL 2에서는 GitHub 자동화를 운영하고, Windows용 프로그램은 Windows에서 빌드하고 테스트합니다.

WSL은 Windows 안에서 Linux 명령 창을 쓰게 해 주는 기능입니다. 이 윈도우11에서는 **WSL 2**가 기본 버전입니다.

### 1-1. WSL 설치

1. Windows 시작 메뉴에서 `PowerShell`을 검색합니다.
2. **관리자 권한으로 실행** 합니다.
3. 아래 한 줄을 실행합니다.

```powershell
wsl --install
```

4. 설치가 끝나면 PC를 다시 시작합니다.
5. 시작 메뉴에서 `Ubuntu`를 열고 처음 한 번 사용자 이름과 암호를 만듭니다. 암호 입력 중 글자가 안 보여도 정상입니다.

설치된 버전을 확인합니다.

### 1-2. GitHub CLI 설치

이제부터는 **WSL 창**에서 실행합니다. Windows PowerShell과 WSL에서 사용하는 Ubuntu 명령을 섞지 마세요.

```bash
sudo apt update
sudo apt install gh -y
```

WSL에서 설치 결과를 확인합니다.

```bash
gh --version
```

### 1-3. GitHub 로그인

Ubuntu에서 실행합니다.

```bash
gh auth login --scopes repo,workflow
```

화면에서 다음을 고릅니다.

1. `GitHub.com`
2. `HTTPS`
3. `Login with a web browser`
4. 표시된 코드를 브라우저에 입력하고 승인

로그인 확인:

```bash
gh auth status
```

### 1-4. gh-aw 확장 설치

```bash
gh extension install github/gh-aw
```

확인:

```bash
gh aw --help
```

## 2단계 — 연습 저장소 준비

GitHub 웹사이트에서 **New repository**를 눌러 비어 있는 연습 저장소를 만듭니다. 예시 이름은 `cad-ai-pr-practice`입니다.

WSL에서 아래를 실행하되 `<내-GitHub-ID>`를 실제 ID로 바꿉니다.
이떄 <>는 없어도 됩니다. 
예) GoSeongJin이면 
올바른 명령어 : git clone https://github.com/GoSeongJin/cad-ai-pr-practice.git
잘못된 명령어 : git clone https://github.com/GoSeongJin/cad-ai-pr-practice.git

```bash
git clone https://github.com/<내-GitHub-ID>/cad-ai-pr-practice.git
cd cad-ai-pr-practice
```

현재 폴더가 맞는지 확인합니다.

```bash
git status
```

`not a git repository`가 나오면 저장소 폴더 밖에 있는 것입니다. `cd cad-ai-pr-practice`를 다시 실행하세요.

## 3단계 — AI 엔진 선택과 인증

### 가장 쉬운 선택: GitHub Copilot

Copilot 구독이 있다면 기본 엔진으로 시작할 수 있습니다.

```bash
gh aw init
```

안내에 따라 별도의 `COPILOT_GITHUB_TOKEN`을 설정합니다. 일반 `GITHUB_TOKEN`과는 다른 토큰입니다.

### OpenAI Codex를 쓰는 선택

```bash
gh aw init --engine codex
```

OpenAI API 키를 GitHub 저장소의 **Settings → Secrets and variables → Actions → New repository secret**에 저장합니다.

- Name: `OPENAI_API_KEY`
- Secret: 발급받은 API 키

`CODEX_API_KEY`도 사용할 수 있고, 둘 다 있으면 `CODEX_API_KEY`가 우선합니다. API 키는 채팅·이슈·문서·명령 기록에 붙여 넣지 마세요.

> 다른 엔진을 쓰려면 공식 [AI 엔진 안내](https://github.github.com/gh-aw/reference/engines/)를 확인하세요. 엔진마다 필요한 비밀키가 다릅니다.

## 4단계 — 두 워크플로 만들기

1. 저장소에 `.github/workflows` 폴더를 만듭니다.
2. [SAMPLE.md](SAMPLE.md)의 “샘플 1” 코드만 복사해 `.github/workflows/issue-triage.md`에 저장합니다.
3. “샘플 2” 코드만 복사해 `.github/workflows/issue-to-pr.md`에 저장합니다.
4. Codex를 선택했다면 두 파일의 설정 부분에 있는 주석처럼 `engine: codex`를 추가합니다. Copilot 기본값이면 생략합니다.

AI에게 파일 생성을 부탁할 때는 다음 문장을 그대로 사용할 수 있습니다.

```text
SAMPLE.md의 샘플 1과 샘플 2를 각각 안내된 .github/workflows 경로에 만들어 줘.
내용을 임의로 바꾸지 말고, 만든 파일 목록을 알려 줘.
```

## 5단계 — 검사하고 실행 파일 만들기

```bash
gh aw compile
```

성공하면 같은 폴더에 다음 파일이 생깁니다.

```text
.github/workflows/issue-triage.lock.yml
.github/workflows/issue-to-pr.lock.yml
```

`.md`는 사람이 고치는 원본이고 `.lock.yml`은 GitHub Actions가 실행하는 자동 생성본입니다. 원본을 바꿀 때마다 다시 `gh aw compile`을 실행하고 두 종류 모두 저장해야 합니다.

## 6단계 — GitHub에 올리기

```bash
git add .
git commit -m "Add beginner AI issue-to-PR workflows"
git push
```

GitHub 저장소의 **Actions** 탭에 워크플로가 보이면 배치가 끝난 것입니다.

## 7단계 — 필요한 라벨 만들기

GitHub 저장소에서 **Issues → Labels → New label**로 아래 이름을 정확히 만듭니다.

```text
bug
feature
question
needs-info
priority/p0
priority/p1
priority/p2
duplicate
ai-ready
ai-generated
```

## 8단계 — 첫 실습

1. **Issues → New issue**를 누릅니다.
2. [SAMPLE.md](SAMPLE.md)의 연습용 이슈를 복사해 등록합니다.
3. **Actions** 탭에서 `Issue Triage Assistant` 실행 결과를 기다립니다.
4. AI가 붙인 종류·우선순위 라벨과 질문을 확인합니다.
5. 내용이 충분하고 AI 작업을 허용하려면 사람이 `ai-ready` 라벨을 붙입니다.
6. `Issue to Pull Request Assistant`가 만든 PR을 엽니다.
7. **Files changed**에서 예상한 파일만 바뀌었는지 확인합니다.
8. 이해되지 않는 변경이 있으면 바로 병합하지 말고 담당자에게 검토를 요청합니다.

## 9단계 — 실패했을 때

| 화면/메시지 | 확인할 것 |
|---|---|
| 워크플로가 안 보임 | `.lock.yml`도 push했는지, Actions가 켜졌는지 |
| 인증 오류 | 선택한 엔진의 Secret 이름과 값 |
| 라벨을 못 붙임 | 라벨 이름이 SAMPLE과 정확히 같은지 |
| PR 대신 이슈가 생김 | 조직이 Actions의 PR 생성을 막았는지 |
| compile 오류 | 들여쓰기, `---` 두 줄, 파일 확장자 `.md` |
| 실행 비용이 걱정됨 | 실행 횟수를 줄이고 `max-ai-credits` 값을 낮게 시작 |

PR 생성이 조직 정책으로 차단되면 `create-pull-request`는 기본적으로 변경 제안을 이슈로 남길 수 있습니다. 관리자가 허용할 때까지 우회하지 마세요.

상태 확인 명령:

```bash
gh aw status
```

원본을 수정한 뒤에는 항상:

```bash
gh aw compile
git add .
git commit -m "Update AI workflow"
git push
```

## 운영 전 체크리스트

- [ ] 실제 도면과 고객 정보가 없는 연습 저장소에서 검증했다.
- [ ] AI가 쓸 수 있는 동작이 `safe-outputs`에 한정되어 있다.
- [ ] `ai-ready`는 사람이 확인한 뒤에만 붙인다.
- [ ] 자동 병합을 사용하지 않는다.
- [ ] PR마다 사람이 **Files changed**를 확인한다.
- [ ] API 키를 GitHub Secret에만 저장했다.
- [ ] 비용과 실행 기록을 정기적으로 확인할 담당자를 정했다.

## 참고 문서

- [GitHub 공식: Creating Workflows](https://github.github.com/gh-aw/setup/creating-workflows/)
- [GitHub 공식: Gallery](https://github.github.com/gh-aw/index.html#gallery)
- [GitHub 공식: Quick Start](https://github.github.com/gh-aw/setup/quick-start/)
- [GitHub 공식: AI Issue Triage](https://github.github.com/gh-aw/guides/ai-issue-triage/)
- [GitHub 공식: Safe Outputs](https://github.github.com/gh-aw/reference/safe-outputs/)

## 다음 단계 — 다른 자동화로 확장하기

이 가이드의 이슈 분류와 초안 PR 생성 실습을 완료하면 같은 방식으로 다른 기능을 추가할 수 있습니다. GitHub 공식 [Gallery](https://github.github.com/gh-aw/index.html#gallery)와 [Agentics 예제 저장소](https://github.com/githubnext/agentics)에는 바로 참고할 수 있는 워크플로 예제 파일이 있습니다.

아래 표는 **CLD 과제(STL↔STP 매칭 DB 기반 AI 활용 설계 자동화 및 제조공장 연계 솔루션 개발)**를 바이브코딩으로 진행할 때 활용할 수 있는 공식 가이드에 있는 예제입니다. 어떤 도움을 받을 수 있는지 중심으로 정리했습니다.

| 확장 기능 | 공식 예제 종류 | CLD 과제 활용 예 | 주된 결과 | 권장 순서 |
|---|---|---|---|---|
| PR 자동 검토 | Automated PR Review, PR Nitpick Reviewer | 코드 변경에서 빠진 검사 항목이나 실수 찾기 | PR 댓글·리뷰 | 1 |
| 일일·주간 현황 | Daily Repo Status, Weekly Issue Activity | 관련 이슈와 PR의 진행 상황 요약 | 보고서 이슈 | 1 |
| 문서 최신화 | Documentation Updater, Glossary Maintainer | 설명서와 용어집에서 오래된 내용 찾기 | 문서 PR | 2 |
| 링크 검사 | Link Checker | 문서에 있는 깨진 링크 찾기 | 보고서 또는 수정 PR | 2 |
| 오류 원인 분석 | CI Doctor, Log Watcher | 자동 검사에 실패한 이유를 쉽게 요약 | 이슈·PR 댓글 | 2 |
| 테스트 개선 | Daily Test Improver | 코드에서 시험이 부족한 기능 찾기 | 테스트 PR | 3 |
| 코드 정리 | Code Simplifier, Duplicate Code Detector | 복잡하거나 반복되는 코드를 찾아 정리 제안 | 분석 보고서·PR | 3 |
| 전체 품질 점검 | Repository Quality Improver | 코드·문서·테스트 상태를 한 번에 점검 | 정기 보고서·PR | 3 |
| 작업 나누기 | Plan Command, Repo Ask, PR Fix | 큰 이슈를 작고 실행 가능한 작업으로 나누기 | 이슈·PR 응답 | 3 |
| 여러 저장소 관리 | Multi-Repository, Feature Synchronization | 여러 저장소에서 함께 바꿔야 할 내용 추적 | 교차 저장소 이슈·PR | 4 |
| 보안 검사 | Daily Malicious Code Scan | 의심스러운 코드 변경이나 위험 요소 찾기 | 보안 보고서 | 4 |
| 비용 확인 | Cost Tracker, Metrics & Analytics | AI 자동화 사용량과 비용 확인 | 비용·운영 보고서 | 운영 시 |

### 확장할 때 지킬 순서

새 예제는 곧바로 실제 업무 저장소에 넣지 않습니다.

1. Gallery에서 목적과 가장 가까운 예제를 고릅니다.
2. 예제의 `.md` 원본을 별도 연습 저장소에 추가합니다.
3. 트리거가 언제 실행되는지 확인합니다.
4. `permissions`가 필요한 읽기 권한만 갖는지 확인합니다.
5. `safe-outputs`가 만들 수 있는 이슈, 댓글, PR의 범위를 확인합니다.
6. 회사 라벨명, 문서명과 업무 규칙에 맞게 자연어 지시를 수정합니다.
7. `max-ai-credits`를 낮게 설정해 소규모로 시험합니다.
8. `gh aw compile`에 성공한 `.md`와 `.lock.yml`을 함께 올립니다.
9. 공개된 가상 데이터로 결과를 확인하고 담당자의 승인을 받습니다.
10. 실제 업무에는 한 번에 기능 하나씩 추가합니다.

> Gallery의 예제 파일은 출발점입니다. 회사의 보안 정책, Windows 빌드 환경, CAD 제품의 라이선스와 실제 승인 절차를 반영한 뒤 사용해야 하며, 예제라는 이유만으로 업무 검증이 완료된 것은 아닙니다.

### 예제 가져오기

대화형 설치 마법사를 지원하는 예제는 저장소 루트에서 다음 형식으로 추가할 수 있습니다.

```bash
gh aw add-wizard githubnext/agentics/<워크플로-이름>
```

예를 들어 이슈 분류 공식 스타터는 다음과 같습니다.

```bash
gh aw add-wizard githubnext/agentics/issue-triage
```

예제 이름과 설치 가능 여부는 버전에 따라 달라질 수 있으므로 실행 전 [Agentics의 최신 목록](https://github.com/githubnext/agentics)을 확인하세요. 추가 후 생성된 원본과 권한을 검토하고 `gh aw compile`로 다시 검사합니다.
