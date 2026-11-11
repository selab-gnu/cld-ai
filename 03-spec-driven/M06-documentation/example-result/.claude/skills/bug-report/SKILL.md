---
name: bug-report
description: 버그나 이상 동작을 발견했을 때 이슈 보고서를 쓰는 데 사용한다. 직접 재현한 뒤 .github/ISSUE_TEMPLATE/bug_report.yml과 같은 항목으로 docs/issues/에 보고서를 남기고, 원하면 GitHub 이슈로도 올린다.
---

# 이슈 보고서 쓰기

## 원칙

- **재현하기 전에는 쓰지 않는다.** 보고서의 재현 절차와 실제 결과는 직접 실행해서 얻은 것이어야 한다.
- **원인 추정과 사실을 나눈다.** 관찰한 사실은 "실제 결과"에, 코드를 읽고 추정한 원인은 "원인 추정"에 적고 근거 파일과 줄 번호를 단다.
- 고치는 방법을 정하지 않는다. "제안"으로만 적고, 결정은 사람이 한다.

## 파일

- 위치: `docs/issues/NNNN-짧은-제목.md` (0001부터)
- 항목은 `.github/ISSUE_TEMPLATE/bug_report.yml`과 같다.

```markdown
# [버그] 한 줄 요약

- 상태: 열림 | 해결됨 (커밋 또는 PR)
- 심각도: 치명 | 높음 | 보통 | 낮음
- 영역: CLI | HTTP API | 저장 | 문서
- 관련 요구사항: REQ-xxx (없으면 "없음 — 요구사항 추가 필요")

## 재현 절차
1. ...

## 기대 결과
## 실제 결과
(명령 출력을 그대로 붙인다)

## 환경
- OS / Node.js 버전 / 커밋 해시 (`git rev-parse --short HEAD`)

## 원인 추정
근거: `src/파일.js` Lnn

## 제안
```

## 절차

1. 재현 절차를 깨끗한 저장 파일(`TODO_FILE=bug-demo.json`)로 실행해 출력을 얻는다. 끝나면 그 파일은 지운다.
2. 보고서를 쓰고 사람에게 보여 준다.
3. GitHub 저장소가 연결되어 있고 사람이 원하면 `gh issue create --title "..." --label bug --body-file docs/issues/NNNN-....md`로 올린다.
4. 수정은 별도 작업으로 한다. 수정 커밋 메시지에 `Fixes docs/issues/NNNN`(또는 `Fixes #이슈번호`)를 적고, 보고서의 상태를 `해결됨`으로 바꾸고, `CHANGELOG.md`의 `Fixed`에 한 줄 남긴다.
