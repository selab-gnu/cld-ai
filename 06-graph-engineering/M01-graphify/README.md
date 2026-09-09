# 모듈 — Graphify — 하니스 엔지니어링

> 상태: 초안 · 담당: 이선아 교수

## 목적

.claude 폴더에 에이전트와 스킬을 만들어 Claude Code를 위한 하네스 엔지니어링을 만드는 방법을, **graphify**라는 실제 도구를 예시로 배워본다. [graphify](https://github.com/Graphify-Labs/graphify)는 코드·문서·PDF·SQL 스키마를 로컬 AST 파싱 기반의 질의 가능한 지식 그래프로 바꿔주는 `/graphify` 스킬이다. 이 모듈에서는 초보자가 graphify를 설치하고, 스킬로 등록하고, 그래프를 생성·질의하고, 커밋 훅으로 자동 갱신되게 만드는 전체 흐름을 GUIDE.md → SAMPLE.md 순서로 실습한다.

## 산출물 4종 (체크리스트)

- [x] 가이드 — GUIDE.md: 사전 준비 → CLI 설치 → 스킬 등록 → 그래프 생성 → 리포트 해석 → 질의 → 팀 협업까지 7단계, 단계별 규칙·산출물·체크리스트 포함
- [ ] 규칙 — CLAUDE.md 조각 (graphify를 어시스턴트가 코드 읽기 전에 실제로 사용하도록 유도/강제하는 always-on 규칙; `graphify claude install`이 CLAUDE.md에 자동으로 추가해 주는 섹션과 PreToolUse 훅을 그대로 채택하거나 문서화하면 됨 — 아직 별도 조각으로 정리되지 않음)
- [x] 자동화 — graphify CLI 자체가 스킬 등록(`graphify install`)과 커밋/브랜치 전환 시 자동 재빌드 훅(`graphify hook install`)을 제공
- [x] 샘플 — SAMPLE.md: GUIDE.md 적용 후 실제로 커밋하고 질의까지 실행하는 동작 스텝·프롬프트

## 품질 기준

동작하는 샘플 또는 재현 가능한 프롬프트가 반드시 첨부되어야 하며, 문서는 따라 하면 되는 수준이어야 한다. graphify 명령은 실습용 저장소에 대해 최소 한 번 실행되어 실제 출력(그래프 파일, 질의 결과)으로 확인된 것이어야 한다.
