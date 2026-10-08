# 모듈 M01 — Hermes Agent 기초 (Hello World)

> 상태: 초안 · 담당: 이선아 교수

## 목적

Hermes Agent를 처음 접하는 사람이 **설치부터 첫 대화, 파일 만들기, 기억시키기**까지 20분 안에 직접 해 본다. 복잡한 연동(GitHub, Telegram, ngrok)은 다루지 않고, 터미널 하나로 에이전트의 기본 동작만 익힌다.

## 이 모듈에서 배우는 것

| 순서 | 배우는 것 | 핵심 명령 |
|---|---|---|
| 1 | 설치 | `curl ... install.sh \| bash` |
| 2 | 첫 대화 (Hello World) | `hermes`, `/help`, `/quit` |
| 3 | 에이전트에게 파일 만들고 실행시키기 | 자연어 지시 |
| 4 | 기억시키기 | "기억해줘: …", `/new` |
| 5 | 이어서 하기 · 문제 해결 | `hermes -c`, `hermes doctor` |
| 다음 단계 | Claude 모델로 바꾸기 (Anthropic) | `hermes model`, `/model` |

## 문서 구성

| 문서 | 내용 |
|---|---|
| [README.md](./README.md) | 모듈 개요 (이 문서) |
| [GUIDE.md](./GUIDE.md) | 5단계 설치·사용 가이드 — 단계별 규칙·산출물·체크리스트 |
| [SAMPLE.md](./SAMPLE.md) | 그대로 복사해 쓰는 Hello World 프롬프트 7개와 기대 결과 |

## 준비물

- 인터넷이 되는 PC (macOS / Linux / WSL2 / Windows)

## 산출물 4종 (체크리스트)

- [x] 가이드 — GUIDE.md 단계 목적·입력·산출물·체크리스트
- [x] 규칙 — GUIDE.md 각 단계의 `## 규칙` (연습 폴더 사용, 승인 전 명령 확인, 민감 정보 기억 금지 등)
- [ ] 자동화 — 스킬·예약 작업 (M02-review에서 다룸)
- [x] 샘플 — SAMPLE.md 동작 스텝·프롬프트

## 완료 기준

- [ ] 에이전트가 `Hello, World!`라고 답한다.
- [ ] 에이전트가 만든 `hello.py`가 실행된다.
- [ ] `/new` 후에도 에이전트가 내 이름을 기억한다.

## 품질 기준

동작하는 샘플 또는 재현 가능한 프롬프트가 반드시 첨부되어야 하며, 문서는 따라 하면 되는 수준이어야 한다.

## 다음 모듈

- [M02-review — PR 리뷰 에이전트](../M02-review/README.md): GitHub·Telegram과 연결한 실전 활용

## 참고 자료

- GitHub: <https://github.com/nousresearch/hermes-agent>
- 공식 문서 Quickstart: <https://hermes-agent.nousresearch.com/docs/getting-started/quickstart>
