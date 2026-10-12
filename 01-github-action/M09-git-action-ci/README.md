# 모듈 M09 — GitHub Actions로 할 일 앱 CI 만들기

> 상태: 초안 · 담당: 이선아 교수
> 검증 기준: `actions/checkout@v7` · `actions/setup-node@v7` · `actions/upload-artifact@v7` · Node.js 22 / 24 · `ubuntu-latest` (2026-10)
> 워크플로 문법 검사: `actionlint` 1.7.12 통과

## 목적

**CI(Continuous Integration, 지속적 통합)** 는 코드가 저장소에 올라올 때마다 **자동으로 검사·테스트**해서, 망가진 코드가 `main` 에 들어가기 전에 알려 주는 방법이다. **GitHub Actions** 는 GitHub 저장소 안에 YAML 파일 하나(`.github/workflows/ci.yml`)를 두면, GitHub가 준비한 가상 컴퓨터(러너)에서 그 파일에 적힌 명령을 실행해 주는 서비스다.

이 모듈에서는 스펙 주도 개발 모듈(03-spec-driven)에서 만든 것과 같은 **"할 일 관리 웹 앱"** 에 CI를 붙인다.

이 모듈을 마치면 초보자도 다음을 할 수 있다.

- 할 일 앱을 GitHub 저장소에 올린다.
- 워크플로 파일을 만들어 **push · PR 마다 `node --test` 가 자동 실행**되게 한다.
- Actions 탭에서 실행 결과와 로그를 읽고, **실패한 원인을 찾아** 고친다.
- Node 22 · 24 두 버전에서 동시에 테스트(매트릭스)하고, 테스트 결과 파일을 남긴다.
- **브랜치 규칙(ruleset)** 으로 CI가 통과하지 않은 PR은 `main` 에 합칠 수 없게 한다.
- README에 CI 상태 배지를 단다.
- (도전) 테스트가 통과하면 **GitHub Pages로 자동 배포(CD)** 한다.

## 한눈에 보는 흐름

```
 내 컴퓨터                             GitHub                                   러너 (ubuntu-latest)
 ─────────                            ──────                                    ────────────────────
 코드 수정 → git push ──────────────► 이벤트 발생 (push / pull_request)
                                      .github/workflows/ci.yml 읽기 ──────────► job: test (Node 22) ┐ 동시에
                                                                               job: test (Node 24) ┘ 실행
                                                                                 ① 코드 가져오기 (checkout)
                                                                                 ② Node 설치 (setup-node)
                                                                                 ③ 문법 검사 (node --check)
                                                                                 ④ 단위 테스트 (node --test)
                                                                                 ⑤ 결과 요약 · 결과 파일 업로드
                                      ✅ / ❌ 표시  ◄──────────────────────────── 결과 보고
 PR 화면에서 확인 ◄──────────────────  ❌ 이면 브랜치 규칙이 합치기(merge)를 막음
                                      (도전) main 에 합쳐지면 → Pages 배포 워크플로
```

## 모듈 구성

| 파일 / 폴더 | 역할 | 언제 쓰나 |
| --- | --- | --- |
| [README.md](README.md) | 모듈 소개, 목표, 준비물, 품질 기준 (지금 이 문서) | 가장 먼저 |
| [GUIDE.md](GUIDE.md) | GitHub Actions 개념 + 단계별 **목적·입력·규칙·산출물·체크리스트** 상세 가이드 | 단계별로 CI 만들기 |
| [SAMPLE.md](SAMPLE.md) | 완성한 CI를 **실제로 돌려 보고 동작을 확인**하는 시나리오 (성공·실패·PR 차단·재실행·배지·배포) | GUIDE 6단계 이후 |
| [todo-app/](todo-app/) | 시작용 할 일 앱 (CI 없음). 테스트 34개 포함 | GUIDE 1단계에서 복사 |
| [workflows/](workflows/) | 완성본 워크플로 `ci.yml`, `pages.yml` | 막혔을 때 비교용 |

> 💡 추천 학습 순서: README → GUIDE 개념·1~6단계로 CI 만들기 → SAMPLE 1~6단계로 확인 → GUIDE 7단계(배지) → (도전) GUIDE 8단계 + SAMPLE 7단계

## 사전 준비물

| 항목 | 버전/조건 | 확인 명령 |
| --- | --- | --- |
| GitHub 계정 | 무료 계정이면 된다 | https://github.com 로그인 |
| Git | 2.x | `git --version` |
| GitHub CLI `gh` | 로그인 완료 (`gh auth login`) — 저장소 만들기·PR에 사용 | `gh --version`, `gh auth status` |
| Node.js | 22 이상 (내 컴퓨터에서 먼저 테스트) | `node --version` |
| Python 3 | 앱 로컬 실행용 (`python3 -m http.server`) | `python3 --version` |
| 코드 편집기 | VS Code 등 (YAML 들여쓰기가 보이는 편집기) | — |

> 💡 VS Code를 쓴다면 확장 **"GitHub Actions"**(GitHub 제공)를 설치하면 워크플로 파일의 오타를 바로 표시해 주고, 실행 결과도 편집기 안에서 볼 수 있다.

> 💰 **공개(public) 저장소의 GitHub Actions는 무료**다. 비공개 저장소는 계정 요금제별 월 무료 사용 시간이 있다. 이 실습은 **공개 저장소**로 진행한다. (브랜치 규칙·Pages도 공개 저장소에서는 무료 계정으로 쓸 수 있다)

## 산출물 4종 (체크리스트)

- [x] 가이드 — [GUIDE.md](GUIDE.md) 단계 목적·입력·산출물·체크리스트
- [x] 규칙 — 워크플로 작성 규칙(최소 권한, 버전 고정, 시간 제한, 동시 실행 취소) + 브랜치 규칙(ruleset) 설정 + [부록 A](GUIDE.md#부록-a-워크플로-작성-규칙)
- [x] 자동화 — [workflows/ci.yml](workflows/ci.yml) (CI), [workflows/pages.yml](workflows/pages.yml) (CD)
- [x] 샘플 — [todo-app/](todo-app/) 시작 코드 + [SAMPLE.md](SAMPLE.md) 성공·실패·차단·재실행 시나리오

## 품질 기준

동작하는 샘플 또는 재현 가능한 프롬프트가 반드시 첨부되어야 하며, 문서는 따라 하면 되는 수준이어야 한다.

이 모듈의 완료 기준:

- [ ] 내 GitHub 계정에 `my-todo-ci` 공개 저장소가 있고 `.github/workflows/ci.yml` 이 들어 있다.
- [ ] Actions 탭에 `test (Node 22)`, `test (Node 24)` 가 **초록색 ✅** 으로 끝난 실행이 있다.
- [ ] 테스트를 일부러 깨뜨린 PR이 **❌ 로 표시되고 합치기 버튼이 막힌** 것을 확인했다.
- [ ] 고친 뒤 ✅ 가 되어 PR을 합쳤다.
- [ ] README에 CI 배지가 보인다.
- [ ] (도전) `https://<내 아이디>.github.io/my-todo-ci/` 에서 할 일 앱이 동작한다.

## 알아 둘 점 (버전과 인터넷 자료의 차이)

| 인터넷 글에서 보이는 것 | 현재 (2026-10) |
| --- | --- |
| `actions/checkout@v4`, `actions/setup-node@v4` | **`@v7`** 이 최신이다. 예전 버전도 동작하지만, 오래된 버전은 러너의 Node 런타임 변경으로 경고가 나오거나 멈출 수 있다 |
| `node-version: 18` 또는 `20` | Node 18·20은 지원이 끝났다(EOL). 이 모듈은 **22(유지보수 LTS)와 24(활성 LTS)** 로 테스트한다 |
| Settings › Branches › **Branch protection rules** | 지금도 있지만, GitHub는 새 방식인 **Settings › Rules › Rulesets** 를 권한다. 이 모듈은 Rulesets 를 쓴다 |
| Pages를 `gh-pages` 브랜치로 배포 | **GitHub Actions 로 배포**(`upload-pages-artifact` + `deploy-pages`)가 기본 방식이다 |
| `ubuntu-latest` = Ubuntu 22.04 | 지금은 24.04 를 가리킨다. 이 실습에는 영향이 없다 |

## 참고 자료

- GitHub Actions 문서(한국어): https://docs.github.com/ko/actions
- 워크플로 문법: https://docs.github.com/ko/actions/reference/workflows-and-actions/workflow-syntax
- Node.js 빌드·테스트 안내: https://docs.github.com/ko/actions/tutorials/build-and-test-code/nodejs
- 규칙 집합(Rulesets) 관리: https://docs.github.com/ko/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/managing-rulesets-for-a-repository
- 상태 배지: https://docs.github.com/ko/actions/how-tos/monitor-workflows/add-a-status-badge
- GitHub Pages 사용자 지정 워크플로: https://docs.github.com/ko/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- actions/checkout: https://github.com/actions/checkout · actions/setup-node: https://github.com/actions/setup-node
- Node.js 테스트 러너: https://nodejs.org/api/test.html
- actionlint (워크플로 검사 도구): https://github.com/rhysd/actionlint
