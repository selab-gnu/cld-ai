# 모듈 M01 — Hermes Agent로 만드는 GitHub PR 리뷰 에이전트

> 상태: 초안 · 담당: 이선아 교수

## 목적

오픈소스 AI 에이전트 **Hermes Agent**(Nous Research)를 설치하고, GitHub Pull Request가 열리면 자동으로 코드를 읽고 리뷰 댓글을 남기는 **PR 리뷰 에이전트**를 만들어 본다. 이 과정에서 다음을 배운다.

- Hermes Agent의 동작 원리: 추론 → 도구 사용 → SKILL.md 생성 → 메모리 저장 → 재사용
- LLM Provider를 자유롭게 바꾸는 방법 (`hermes model`)
- 웹훅(Webhook)으로 외부 이벤트를 받아 에이전트를 자동 실행하는 방법
- Telegram 메신저로 상시 실행 중인 에이전트와 대화하는 방법

## 구성도

```
PR 생성 ─▶ GitHub Webhook ─▶ ngrok 공개 URL ─▶ hermes gateway(:8644)
                                                   ├─ gh pr diff (코드 읽기)
                                                   ├─ LLM 리뷰 작성
                                                   └─▶ PR 댓글 / Telegram
```

## 학습 순서

| 순서 | 문서 | 내용 |
|---|---|---|
| 1 | [README.md](./README.md) | 모듈 개요 (이 문서) |
| 2 | [GUIDE.md](./GUIDE.md) | 설치·설정 7단계 — 단계별 목적·입력·규칙·산출물·체크리스트 |
| 3 | [SAMPLE.md](./SAMPLE.md) | 연습 저장소에 버그 있는 PR을 열어 자동 리뷰 받기 + 자연어 프롬프트 예시 |

## 준비물

- PC 1대 (macOS / Linux / WSL2 / Windows) — 실습 중 계속 켜 둘 것
- GitHub 계정 (본인 소유 연습 저장소의 Admin 권한)
- Telegram 계정
- LLM API 키 1개 (OpenRouter·OpenAI·Anthropic 등)
- ngrok 무료 계정

## 산출물 4종 (체크리스트)

- [x] 가이드 — GUIDE.md 단계 목적·입력·산출물·체크리스트
- [x] 규칙 — GUIDE.md 각 단계의 `## 규칙` (이 단계에서 지켜야 할 규칙) + 리뷰 스킬(`pr-review-ko/SKILL.md`)의 리뷰 규칙
- [x] 자동화 — Hermes 웹훅 라우트(`config.yaml` → `github-pr-review`) · Hermes 스킬(`~/.hermes/skills/pr-review-ko/SKILL.md`) · Telegram cron 예약 작업
- [x] 샘플 — SAMPLE.md 동작 스텝·프롬프트

## 완료 기준

- [ ] 연습 저장소의 PR에 에이전트가 단 리뷰 댓글이 있다.
- [ ] 리뷰가 SAMPLE.md의 의도된 버그 3가지(하드코딩 키, ZeroDivision, SQL 인젝션)를 지적한다.
- [ ] Telegram 봇에게 질문하면 에이전트가 답한다.

## 품질 기준

동작하는 샘플 또는 재현 가능한 프롬프트가 반드시 첨부되어야 하며, 문서는 따라 하면 되는 수준이어야 한다.

## 참고 자료

- Hermes Agent 공식 사이트: <https://hermes-agent.nousresearch.com/>
- 공식 튜토리얼 (GitHub PR Review): <https://hermes-agent.nousresearch.com/docs/guides/webhook-github-pr-review>
- GitHub CLI: <https://cli.github.com/>
- ngrok: <https://dashboard.ngrok.com/get-started/setup>
