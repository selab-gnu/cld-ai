# 변경 기록

이 프로젝트의 주요 변경 사항을 기록합니다. 형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따릅니다.

## [Unreleased]

### Added
- 할 일 삭제 기능: CLI `remove 번호`, API `DELETE /todos/{id}` — REQ-012, REQ-013, [ADR-0002](docs/adr/0002-hard-delete.md)

### Fixed
- `done`에 숫자가 아닌 번호를 넣으면 "NaN번 할 일을 찾을 수 없습니다"가 나오던 문제. 이제 "번호는 1 이상의 정수여야 합니다."를 출력하고, API는 400 `INVALID_ID`를 돌려준다 — REQ-011, [이슈 0001](docs/issues/0001-cli-done-non-numeric-id.md)
