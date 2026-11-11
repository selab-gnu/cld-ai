# 모듈 — 개발 문서화 — 스펙 주도 개발

> 상태: 초안 · 담당: 이선아 교수

## 목적

에이전트 기반 개발에서 **요구사항 목록, 설계 모델, API 문서, 사용자 매뉴얼, 이슈 보고서**를 코드와 함께 만들고, 코드가 바뀌어도 문서가 어긋나지 않게 유지하는 방법을 배워본다.

## 개념

에이전트와 함께 개발하면 코드는 빠르게 바뀝니다. 문서는 그 속도를 따라가지 못하면 금방 거짓말이 되고, 낡은 문서를 읽은 에이전트는 낡은 내용대로 코드를 고칩니다.
이 모듈은 문서를 **저장소 안의 텍스트 파일**로 두고(Docs-as-Code), 에이전트가 초안과 갱신을 맡고, **사람은 검토와 결정**을 맡고, **검사 스크립트가 어긋남을 잡는** 구조를 실습합니다.

### 핵심 원칙: 원본과 생성물을 나눈다

모든 문서를 같은 방식으로 다루지 않습니다. 먼저 "이 문서는 코드에서 다시 만들 수 있는가?"를 묻습니다.

| 구분 | 담는 것 | 누가 쓰나 | 예 |
|---|---|---|---|
| **원본** (코드에서 다시 만들 수 없음) | 의도, 결정의 이유, 버린 대안, 약속 | 사람이 결정하고 에이전트가 정리 | 요구사항, ADR, API 명세 |
| **생성물** (코드에서 다시 만들 수 있음) | 지금 구조가 어떻게 되어 있는지 | 에이전트가 생성하고 사람이 검토 | 아키텍처 그림, 매뉴얼의 레퍼런스, API HTML |

코드만 읽은 에이전트는 "왜 이렇게 했는지"를 모릅니다. 그래서 원본 문서가 있어야 의도된 설계를 버그로 오해해 "고쳐" 버리는 일을 막을 수 있습니다.

### 다루는 문서 다섯 가지

| 문서 | 방법 | 파일 | 단계 |
|---|---|---|---|
| **요구사항 목록** | EARS 문형으로 한 줄에 한 동작, ID(`REQ-001`)로 테스트와 추적 | `docs/requirements.md` | 2 |
| **설계 모델** | C4 모델 수준별 그림을 Mermaid로(Diagrams as Code) + 결정은 ADR로 | `docs/architecture/`, `docs/adr/` | 3 |
| **API 문서** | OpenAPI 명세를 원본으로 두고 검사·HTML 생성 | `docs/api/openapi.yaml` | 4 |
| **사용자 매뉴얼** | Diátaxis 틀(튜토리얼·하우투·레퍼런스·설명)로 나눔 | `docs/manual/` | 5 |
| **이슈 보고서** | 재현 우선, GitHub 이슈 양식(YAML)과 같은 항목 | `docs/issues/`, `.github/ISSUE_TEMPLATE/` | 6 |

여기에 모든 변경을 기록하는 `CHANGELOG.md`(Keep a Changelog 형식)를 더합니다.

### 문서가 낡지 않게 하는 두 가지 장치

1. **에이전트 규칙과 스킬** — `CLAUDE.md`에 "코드를 바꾸면 같은 작업 안에서 관련 문서도 고친다"를 규칙으로 두고, 문서 종류마다 스킬(`.claude/skills/`)로 형식과 절차를 정해 둡니다.
2. **검사 스크립트** — `npm run docs:check`가 코드와 문서를 비교해 어긋남을 찾습니다. 사람이나 에이전트가 문서 고치기를 잊어도 여기서 걸립니다.
   - 요구사항 추적: `구현됨` 요구사항마다 테스트가 있는가
   - API 문서: 서버의 경로와 명세의 경로가 같은가
   - ADR: 필수 섹션이 있는가
   - 링크: 문서 안의 상대 링크가 실제 파일을 가리키는가

### 다른 모듈과의 관계

- **스펙 주도 개발(SDD) 모듈**의 스펙이 이 모듈의 "요구사항 목록"에 해당합니다. 이 모듈은 스펙을 쓴 **뒤**의 문서(설계·API·매뉴얼·이슈)와 **유지**에 초점을 둡니다.
- **OpenWiki 같은 위키 생성 도구**는 코드에서 설명 문서를 만드는 "생성물" 쪽 도구입니다. 이 모듈의 원본 문서(요구사항, ADR)와 함께 쓰면 서로를 보완합니다.

## 모듈 구성

```
M06-documentation/
├── README.md            ← 이 문서 (개념)
├── GUIDE.md             ← 단계별 실습 안내 (0~7단계)
├── SAMPLE.md            ← 프롬프트 모음과 기대 결과 예시
├── CLAUDE.md            ← 문서화 규칙 (실습 저장소에 복사)
├── skills/              ← 문서 종류별 Claude Code 스킬 7종 (실습 저장소의 .claude/skills/로 복사)
├── templates/
│   └── ISSUE_TEMPLATE/  ← GitHub 이슈 양식 (실습 저장소의 .github/로 복사)
├── todo-app/            ← 실습 시작용 예제 저장소 (CLI + HTTP API, 문서 없음)
└── example-result/      ← 7단계까지 마친 완성 예시 (비교용)
```

## 산출물 4종 (체크리스트)

- [x] 가이드 — GUIDE.md 단계 목적·입력·산출물·체크리스트
- [x] 규칙 — CLAUDE.md 조각 (문서 지도와 문서화 규칙 8가지)
- [x] 자동화 — 스킬 7종(`requirements`, `adr`, `architecture`, `api-docs`, `user-manual`, `bug-report`, `doc-sync`), 문서 검사 스크립트(`npm run docs:check`), GitHub 이슈 양식
- [x] 샘플 — SAMPLE.md 프롬프트·기대 결과, `example-result/` 완성 예시

## 품질 기준

동작하는 샘플 또는 재현 가능한 프롬프트가 반드시 첨부되어야 하며, 문서는 따라 하면 되는 수준이어야 한다.

## 참고 링크

- EARS(요구사항 문형): https://alistairmavin.com/ears/
- C4 모델: https://c4model.com
- Mermaid: https://mermaid.js.org
- ADR(설계 결정 기록): https://adr.github.io
- OpenAPI 3.1 명세: https://spec.openapis.org/oas/v3.1.0
- Redocly CLI: https://redocly.com/docs/cli
- Diátaxis(문서 구조 틀): https://diataxis.fr
- Keep a Changelog: https://keepachangelog.com/ko/1.1.0/
- GitHub 이슈 양식 문법: https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms
- llms.txt(에이전트용 문서 색인 제안): https://llmstxt.org
