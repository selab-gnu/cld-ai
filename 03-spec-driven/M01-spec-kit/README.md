# 모듈 M01 — Spec Kit으로 시작하는 스펙 주도 개발(SDD)

> 상태: 초안 · 담당: 이선아 교수
> 검증 기준: `specify-cli` **v1.1.3** (2026-10-09 릴리스) · Claude Code 통합(`--integration claude`) · macOS/Linux

## 목적

GitHub의 오픈소스 도구 **[Spec Kit](https://github.com/github/spec-kit)** 을 사용해, "코드부터 짜는" 방식이 아니라 **"명세(Spec)를 먼저 쓰고, 명세가 코드를 만들게 하는"** 스펙 주도 개발(Spec-Driven Development, SDD) 흐름을 처음부터 끝까지 직접 따라 해 본다.

이 모듈을 마치면 초보자도 다음을 할 수 있다.

- `specify` CLI를 설치하고 Claude Code용 Spec Kit 프로젝트를 만든다.
- `/speckit-constitution` → `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement` → `/speckit-converge` 순서의 의미를 설명하고 실행한다.
- 각 단계가 남기는 산출물(`constitution.md`, `spec.md`, `plan.md`, `tasks.md` 등)을 읽고 검토·수정한다.
- 작은 웹 앱(할 일 관리 앱)을 명세에서 출발해 실제로 동작하는 코드까지 완성한다.

## 한눈에 보는 SDD 흐름

```
 [사람]  무엇을·왜            [AI]  어떻게                 [AI]  실행
 ─────────────────          ─────────────────           ─────────────────
 constitution (원칙)    →    plan (기술 계획)      →     implement (구현)
 specify      (명세)    →    tasks (작업 분해)     →     converge  (수렴 검증)
 clarify      (질문)         analyze (일관성 점검)
```

- **사람은 "무엇을, 왜"** 에 집중하고(명세), **AI는 "어떻게"** 를 계획·구현한다.
- 모든 산출물은 Markdown 파일로 저장소에 남으므로, 코드 리뷰처럼 **명세를 리뷰**할 수 있다.

## 모듈 구성

| 파일 | 역할 | 언제 읽나 |
| --- | --- | --- |
| [README.md](README.md) | 모듈 소개, 목표, 준비물, 품질 기준 (지금 이 문서) | 가장 먼저 |
| [GUIDE.md](GUIDE.md) | SDD 개념 + 7단계별 **목적·입력·규칙·산출물·체크리스트** 상세 가이드 | 개념을 이해하며 단계별로 |
| [SAMPLE.md](SAMPLE.md) | 예제 "할 일 관리 앱"을 **복사·붙여넣기만으로** 끝까지 실행하는 실습서 | 손으로 직접 따라 할 때 |

> 💡 추천 학습 순서: README → GUIDE의 "개념" → SAMPLE을 따라 실습 → 막히거나 궁금할 때 GUIDE의 해당 단계 참고

## 사전 준비물

| 항목 | 버전/조건 | 확인 명령 |
| --- | --- | --- |
| Python | 3.11 이상 | `python3 --version` |
| uv (파이썬 패키지 도구) | 최신 | `uv --version` |
| Git | 아무 최신 버전 | `git --version` |
| Claude Code CLI | 로그인 완료 상태 | `claude --version` |
| Node.js *(예제 테스트용)* | 20 이상 | `node --version` |
| 웹 브라우저 | Chrome/Safari 등 | — |

설치 방법은 [GUIDE.md 1단계](GUIDE.md#1-단계-설치와-프로젝트-초기화)에 있다.

## 산출물 4종 (체크리스트)

- [x] 가이드 — [GUIDE.md](GUIDE.md) 단계 목적·입력·산출물·체크리스트
- [x] 규칙 — GUIDE.md 각 단계의 "규칙" 절 + [부록 A. CLAUDE.md 규칙 조각](GUIDE.md#부록-a-claudemd-규칙-조각)
- [x] 자동화 — Spec Kit이 `.claude/skills/speckit-*` 로 설치하는 **Claude Code 스킬** 10종 (+ git 확장 스킬 5종)
- [x] 샘플 — [SAMPLE.md](SAMPLE.md) 동작 스텝·프롬프트 (할 일 관리 앱 예제)

## 품질 기준

동작하는 샘플 또는 재현 가능한 프롬프트가 반드시 첨부되어야 하며, 문서는 따라 하면 되는 수준이어야 한다.

이 모듈의 완료 기준:

- [ ] `specify version` 이 정상 출력된다.
- [ ] 예제 프로젝트에 `.specify/memory/constitution.md` 와 `specs/001-todo-list-app/` 폴더(spec.md, plan.md, tasks.md 등)가 생성되었다.
- [ ] `/speckit-converge` 가 **✅ Converged** 를 보고했다.
- [ ] `node --test` 가 통과하고, 브라우저에서 할 일 앱이 동작한다.

## 알아 둘 점 (버전 차이)

Spec Kit은 매우 빠르게 바뀌는 프로젝트다. 인터넷의 예전 글과 다음이 다를 수 있다.

| 예전 글에서 보이는 것 | 현재(v1.x) |
| --- | --- |
| `specify init my-app --ai claude` | `specify init my-app --integration claude` |
| `/speckit.specify` (점 표기, 슬래시 커맨드) | Claude Code에서는 **스킬**로 설치되어 `/speckit-specify` (하이픈 표기) |
| `specify init` 이 git 브랜치 `001-...` 자동 생성 | git 연동은 **선택 확장**: `specify extension add git` 을 해야 브랜치 생성 |
| `/speckit.implement` 로 끝 | `/speckit-converge` 로 명세 대비 완성도를 검증하며 반복 |

공식 문서의 명령어 표에 점 표기(`/speckit.plan`)가 나와도, Claude Code에서는 하이픈 표기(`/speckit-plan`)로 입력하면 된다.

## 참고 자료

- Spec Kit 저장소: https://github.com/github/spec-kit
- 공식 문서: https://github.github.io/spec-kit/
- SDD 방법론 원문: https://github.com/github/spec-kit/blob/main/spec-driven.md
- Spec Kit 소개 영상: https://www.youtube.com/watch?v=a9eR1xsfvHg
