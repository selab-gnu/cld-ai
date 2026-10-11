# 모듈 M02 — OpenSpec으로 하는 변경 중심 스펙 주도 개발

> 상태: 초안 · 담당: 이선아 교수
> 검증 기준: `@fission-ai/openspec` **v1.14.1** · Claude Code 통합(`--tools claude`) · 기본 프로필 `core` · macOS/Linux

## 목적

**[OpenSpec](https://github.com/Fission-AI/OpenSpec)** 을 사용해, AI와 **"무엇을 만들지 먼저 합의하고 코드를 쓰는"** 가벼운 스펙 주도 개발(SDD) 흐름을 직접 따라 해 본다. OpenSpec은 모든 작업을 하나의 **변경(change)** 단위로 다루고, 변경이 끝나면 그 내용을 **살아 있는 명세(`openspec/specs/`)** 에 합쳐 시스템의 현재 동작을 항상 문서로 남긴다.

이 모듈을 마치면 초보자도 다음을 할 수 있다.

- `openspec` CLI를 설치하고 Claude Code용 OpenSpec 프로젝트를 만든다.
- `openspec/config.yaml` 에 프로젝트 맥락(언어·기술 스택·규칙)을 적어 AI 산출물의 방향을 잡는다.
- `/opsx:explore` → `/opsx:propose` → `/opsx:apply` → `/opsx:archive` 흐름을 실행한다.
- 변경 폴더의 산출물(`proposal.md`, `specs/…/spec.md`, `design.md`, `tasks.md`)을 읽고 검토한다.
- **델타 명세(ADDED / MODIFIED / REMOVED)** 가 무엇이며, archive 때 기준 명세에 어떻게 합쳐지는지 설명한다.
- 할 일 관리 앱을 만든 뒤, **두 번째 변경(마감일 추가)** 으로 기존 명세를 수정하는 과정까지 경험한다.

## 한눈에 보는 OpenSpec 흐름

```
 터미널        npm i -g @fission-ai/openspec  →  openspec init --tools claude
                                                        │
 Claude Code   /opsx:explore  ──►  /opsx:propose  ──►  /opsx:apply  ──►  /opsx:archive
               (선택: 생각 정리)     (계획 문서 4종)      (구현)            (명세에 합치고 보관)
                                         │                                  │
                                 openspec/changes/<변경>/            openspec/specs/<기능>/spec.md
                                 (진행 중인 변경)                     (시스템의 현재 동작 = 진실의 원천)
```

## M01 Spec Kit과 무엇이 다른가?

| 비교 | M01 Spec Kit | M02 OpenSpec |
| --- | --- | --- |
| 설치 | Python `uv tool install specify-cli` | Node.js `npm install -g @fission-ai/openspec` |
| 작업 단위 | 기능(feature) — `specs/001-…/` | 변경(change) — `openspec/changes/<이름>/` |
| 명세의 수명 | 기능별 명세가 폴더마다 쌓임 | 변경이 끝나면 **기준 명세에 병합**되어 하나의 현재 명세 유지 |
| 기존 코드에 적용 | 가능 | **브라운필드(기존 프로젝트)에 특히 강함** — 델타 명세로 변경분만 기술 |
| 단계 수 | 많음 (constitution, specify, clarify, plan, tasks, analyze, implement, converge) | 적음 (propose, apply, archive + 선택 explore/update/sync) |
| 원칙 문서 | `constitution.md` | `openspec/config.yaml` 의 `context` / `rules` |
| Claude Code 명령 표기 | `/speckit-specify` (스킬) | `/opsx:propose` (슬래시 커맨드) |

> 정리: Spec Kit은 **"새 기능을 꼼꼼하게 설계"** 하는 데, OpenSpec은 **"변경을 가볍게 제안하고 명세를 최신으로 유지"** 하는 데 초점이 있다.

## 모듈 구성

| 파일 | 역할 | 언제 읽나 |
| --- | --- | --- |
| [README.md](README.md) | 모듈 소개, 목표, 준비물, 품질 기준 (지금 이 문서) | 가장 먼저 |
| [GUIDE.md](GUIDE.md) | OpenSpec 개념 + 7단계별 **목적·입력·규칙·산출물·체크리스트** 상세 가이드 | 개념을 이해하며 단계별로 |
| [SAMPLE.md](SAMPLE.md) | 예제 "할 일 관리 앱"을 **복사·붙여넣기만으로** 끝까지 실행하는 실습서 | 손으로 직접 따라 할 때 |

> 💡 추천 학습 순서: README → GUIDE의 "개념" → SAMPLE을 따라 실습 → 막히거나 궁금할 때 GUIDE의 해당 단계 참고

## 사전 준비물

| 항목 | 버전/조건 | 확인 명령 |
| --- | --- | --- |
| Node.js | **20.19.0 이상** (OpenSpec 실행 + 예제 테스트) | `node --version` |
| npm | Node.js에 포함 | `npm --version` |
| Git | 아무 최신 버전 | `git --version` |
| Claude Code CLI | 로그인 완료 상태 | `claude --version` |
| Python 3 | 예제 앱 로컬 실행용 (`python3 -m http.server`) | `python3 --version` |
| 웹 브라우저 | Chrome/Safari 등 | — |

설치 방법은 [GUIDE.md 1단계](GUIDE.md#1-단계-설치와-프로젝트-초기화)에 있다.

## 산출물 4종 (체크리스트)

- [x] 가이드 — [GUIDE.md](GUIDE.md) 단계 목적·입력·산출물·체크리스트
- [x] 규칙 — `openspec/config.yaml` 의 `context`·`rules` 예시 ([GUIDE.md 2단계](GUIDE.md#2-단계-프로젝트-맥락-설정-configyaml)) + [부록 A. CLAUDE.md 규칙 조각](GUIDE.md#부록-a-claudemd-규칙-조각)
- [x] 자동화 — OpenSpec이 설치하는 Claude Code **슬래시 커맨드 6종**(`.claude/commands/opsx/`) + **스킬 6종**(`.claude/skills/openspec-*`)
- [x] 샘플 — [SAMPLE.md](SAMPLE.md) 동작 스텝·프롬프트 (할 일 관리 앱 + 마감일 추가 변경)

## 품질 기준

동작하는 샘플 또는 재현 가능한 프롬프트가 반드시 첨부되어야 하며, 문서는 따라 하면 되는 수준이어야 한다.

이 모듈의 완료 기준:

- [ ] `openspec --version` 이 버전을 출력한다.
- [ ] `openspec validate add-todo-list --strict` 가 `Change 'add-todo-list' is valid` 를 출력한다.
- [ ] archive 후 `openspec/specs/todo-list/spec.md` 가 생기고, `openspec/changes/archive/YYYY-MM-DD-add-todo-list/` 에 변경 기록이 남는다.
- [ ] `node --test` 가 통과하고, 브라우저에서 할 일 앱이 동작한다.
- [ ] (도전) 두 번째 변경 `add-due-date` 를 archive 한 뒤 `openspec/specs/todo-list/spec.md` 에 마감일 요구사항이 합쳐졌다.

## 알아 둘 점 (버전 차이)

OpenSpec도 빠르게 바뀌고 있다. 인터넷의 예전 글과 다음이 다를 수 있다.

| 예전 글에서 보이는 것 | 현재(v1.x) |
| --- | --- |
| `/openspec:proposal`, `/openspec:apply` | `/opsx:propose`, `/opsx:apply` (OPSX 워크플로) |
| `openspec/project.md`, `openspec/AGENTS.md` | `openspec/config.yaml` 의 `context`/`rules` 로 대체 |
| `.claude/commands/openspec/` | `.claude/commands/opsx/` + `.claude/skills/openspec-*/` |
| `/opsx:new`, `/opsx:ff`, `/opsx:verify` 가 기본 제공 | 기본 프로필 `core` 에는 없음. `openspec config profile` 로 추가 |

예전 버전으로 만든 프로젝트는 최신 CLI 설치 후 프로젝트 안에서 `openspec update` 를 실행하면 파일이 갱신된다.

## 참고 자료

- OpenSpec 저장소: https://github.com/Fission-AI/OpenSpec
- 시작하기: https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md
- 명령어 레퍼런스: https://github.com/Fission-AI/OpenSpec/blob/main/docs/commands.md
- CLI 레퍼런스: https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md
- 다국어 설정: https://github.com/Fission-AI/OpenSpec/blob/main/docs/multi-language.md
