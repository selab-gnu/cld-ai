# 복사해서 쓰는 샘플

아래 두 워크플로는 역할을 분리합니다. 첫 번째 AI는 이슈를 읽고 분류만 하며, 두 번째 AI는 사람이 `ai-ready` 라벨을 붙였을 때만 PR을 제안합니다.

## 샘플 1 — 새 이슈 자동 분류

저장 위치: `.github/workflows/issue-triage.md`

```markdown
---
on:
  issues:
    types: [opened, edited]

permissions:
  contents: read
  issues: read

# OpenAI Codex 사용 시 다음 줄의 #을 지우세요.
# engine: codex

max-ai-credits: 500

safe-outputs:
  add-labels:
    allowed:
      - bug
      - feature
      - question
      - needs-info
      - priority/p0
      - priority/p1
      - priority/p2
      - duplicate
    max: 4
  add-comment:
    max: 1
---

# CAD 팀 이슈 분류 도우미

새로 작성되거나 수정된 이슈를 한국어로 검토하세요.

다음 순서로 처리하세요.

1. 종류 라벨 하나를 고르세요.
   - `bug`: 기존 문서, 자동화, 계산 또는 파일이 예상과 다르게 동작함
   - `feature`: 새로운 기능이나 업무 개선 요청
   - `question`: 사용법 또는 결정이 필요한 질문
2. 우선순위 라벨 하나를 고르세요.
   - `priority/p0`: 보안과 관련한 긴급 문제
   - `priority/p1`: 이번 업무 주기 안에 처리해야 하는 문제
   - `priority/p2`: 일반 개선 또는 나중에 처리 가능한 문제
3. 기존 열린 이슈와 최근 닫힌 이슈에서 매우 유사한 내용을 찾으세요.
4. 재현 방법, 기대 결과, 대상 파일, 완료 조건 중 핵심 정보가 없으면 `needs-info`를 붙이고 한 댓글에서만 질문하세요.

중복이 확실할 때만 `duplicate`를 붙이고 댓글에 기존 이슈 번호를 쓰세요.
추측으로 담당자를 지정하거나 이슈를 닫지 마세요.
댓글은 비개발자도 이해할 수 있는 짧고 공손한 한국어로 작성하세요.
```

이 샘플은 공식 [AI Issue Triage](https://github.github.com/gh-aw/guides/ai-issue-triage/)의 트리거, 최소 읽기 권한, 제한된 `add-labels`와 `add-comment` 패턴을 따릅니다.

## 샘플 2 — 승인된 이슈를 PR로 만들기

저장 위치: `.github/workflows/issue-to-pr.md`

```markdown
---
on:
  issues:
    types: [labeled]

permissions:
  contents: read
  issues: read
  pull-requests: read

# OpenAI Codex 사용 시 다음 줄의 #을 지우세요.
# engine: codex

max-ai-credits: 1000

safe-outputs:
  create-pull-request:
    title-prefix: "[AI 초안] "
    labels: [ai-generated]
    draft: true
    fallback-as-issue: true
  add-comment:
    max: 1
---

# 승인된 이슈를 작은 PR로 만드는 도우미

트리거가 된 이슈에 `ai-ready` 라벨이 방금 추가된 경우에만 작업하세요.
그 라벨이 없으면 아무 변경도 만들지 말고 종료하세요.

목표는 이슈의 요구사항을 해결하는 **작고 검토하기 쉬운 초안 PR 하나**를 만드는 것입니다.

작업 순서:

1. 이슈 본문과 댓글을 읽고 목표, 완료 조건, 제한사항을 짧게 정리하세요.
2. 정보가 부족하거나 실제 CAD 원본·고객 데이터·자격 증명이 필요하면 코드를 추측하지 마세요. 부족한 정보를 댓글 한 개로 요청하고 종료하세요.
3. 저장소의 기존 방식과 문서를 먼저 확인하세요.
4. 이슈 범위 안에서 필요한 최소 파일만 수정하세요.
5. 가능한 검사를 실행하고 결과를 기록하세요. 검사할 방법이 없으면 그 사실을 분명히 쓰세요.
6. 초안 PR 본문에 아래 항목을 한국어로 작성하세요.
   - 해결하려는 이슈와 `Closes #이슈번호`
   - 변경한 내용
   - 확인한 방법과 결과
   - 사람이 특히 확인해야 할 위험 또는 가정

금지 사항:

- PR을 병합하지 마세요.
- 실제 도면, 고객 정보, 비밀키를 새로 추가하지 마세요.
- 이슈와 무관한 대규모 정리나 파일 이름 변경을 하지 마세요.
- `.github/workflows/`와 보안·배포 설정을 수정하지 마세요.
- 검사를 통과했다고 거짓으로 쓰지 마세요.
```

`create-pull-request`는 AI의 변경을 검토 가능한 PR로 내보내는 공식 safe output입니다. 조직 정책이 PR 생성을 막으면 `fallback-as-issue: true`에 따라 변경 제안이 이슈로 남을 수 있습니다.

## 연습용 이슈 — 그대로 복사

제목:

```text
도면 검토 체크리스트 추가
```

본문:

```markdown
## 무엇이 필요한가요?

저장소 루트에 `CAD_REVIEW_CHECKLIST.md` 문서를 새로 만들어 주세요.

## 왜 필요한가요?

신규 입사자가 도면 검토 순서를 자주 빠뜨립니다.

## 완료 조건

- 문서는 쉬운 한국어로 작성합니다.
- 다음 확인 항목을 체크박스로 포함합니다.
  - 단위
  - 축척
  - 도면 번호와 개정 번호
  - 치수와 공차
  - 재질
  - 표면 처리
  - 간섭 여부
  - 검토자와 검토일
- 문서 마지막에 “실제 승인 절차는 회사 규정을 우선한다”는 문장을 넣습니다.
- 프로그램 코드는 변경하지 않습니다.

## 민감 정보

실제 고객명이나 실제 도면은 사용하지 않습니다.
```

예상 결과:

1. 샘플 1이 `feature`, `priority/p2` 라벨을 붙입니다.
2. 사람이 이슈가 안전하고 충분히 구체적인지 확인합니다.
3. 사람이 `ai-ready` 라벨을 붙입니다.
4. 샘플 2가 `CAD_REVIEW_CHECKLIST.md`를 추가한 초안 PR을 만듭니다.
5. 사람이 내용을 확인하고 병합 여부를 결정합니다.
