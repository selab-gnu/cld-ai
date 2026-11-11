---
name: doc-sync
description: 코드를 바꾼 뒤 관련 문서를 모두 함께 갱신할 때 사용한다. 바뀐 파일에서 영향받는 문서를 찾아 고치고, CHANGELOG.md에 기록하고, docs:check와 docs:api:lint로 확인한다.
---

# 문서 동기화

## 바뀐 코드 → 고칠 문서

| 바뀐 것 | 확인하고 고칠 문서 | 쓸 스킬 |
|---|---|---|
| 사용자에게 보이는 동작 (기능 추가·변경·삭제) | `docs/requirements.md` | `requirements` |
| 되돌리기 어려운 결정 (저장 방식, 삭제 정책 등) | `docs/adr/` 새 ADR | `adr` |
| 파일 추가·삭제, import 관계 | `docs/architecture/overview.md` | `architecture` |
| `src/app.js`의 경로·응답·오류 코드 | `docs/api/openapi.yaml` | `api-docs` |
| CLI 명령, 환경 변수, 출력·오류 메시지 | `docs/manual/` (특히 `reference.md`) | `user-manual` |
| 버그 수정 | `docs/issues/`의 해당 보고서 상태 | `bug-report` |
| 모든 변경 | `CHANGELOG.md` | (아래) |

## 절차

1. `git diff --stat`(커밋 전) 또는 `git diff --stat HEAD~1`(커밋 후)로 바뀐 파일을 확인한다.
2. 위 표에서 해당하는 문서를 모두 고른다. 고르지 않은 문서는 왜 고칠 필요가 없는지 한 줄로 설명한다.
3. 각 문서를 해당 스킬의 규칙대로 고친다. 바뀐 부분만 고치고, 관련 없는 문장은 건드리지 않는다.
4. `CHANGELOG.md`의 `## [Unreleased]` 아래 알맞은 분류에 한 줄씩 추가한다.
5. 아래를 모두 실행해 통과시킨다.
   ```bash
   npm test
   npm run docs:check
   npm run docs:api:lint
   ```
6. 무엇을 고쳤는지 문서별로 한 줄씩 요약해 보고한다.

## CHANGELOG 형식 (Keep a Changelog)

```markdown
# 변경 기록

이 프로젝트의 주요 변경 사항을 기록합니다. 형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따릅니다.

## [Unreleased]

### Added
- 할 일 삭제 기능 (CLI `remove`, API `DELETE /todos/{id}`) — REQ-010

### Fixed
- `done`에 숫자가 아닌 번호를 넣으면 "NaN번…" 메시지가 나오던 문제 — docs/issues/0001
```

분류는 `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`만 쓴다. 각 줄 끝에 관련 REQ ID나 이슈 보고서를 적는다.
