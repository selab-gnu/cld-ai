# GitHub Agentic AI 자동화

**요청을 이슈로 적고, AI가 정리하고, 사람이 승인하면 PR(변경 제안서)을 만들게 하는 방법**을 익히는 교육용 가이드 예제 저장소입니다.

> GitHub Agentic Workflows(`gh-aw`)는 Public Preview입니다.

## 기본 개념

| 용어 | 개념 | 업무 예시 |
|---|---|---|
| 저장소(Repository) | 파일과 변경 기록을 모아 둔 작업 공간 | 
| 이슈(Issue) | 할 일, 오류, 개선 요청 사안 | 
| 라벨(Label) | 이슈를 분류하는 태그 | 
| PR(Pull Request) | 변경 내용을 검토·승인받는 제안서 | 
| 병합(Merge) | 승인된 변경을 기준 파일에 반영 | 

## 이 저장소에서 배우는 흐름

```text
사람이 이슈 작성
  → AI가 종류·우선순위를 분류하고 부족한 정보를 질문
  → 사람이 ai-ready 라벨을 붙여 작업 승인
  → AI가 작은 변경을 만들고 PR 제출
  → 사람이 PR의 변경 내용을 확인하고 병합
```

AI는 PR을 **제안**할 뿐, 이 예제에서는 자동으로 병합하지 않습니다.

## 파일 안내

- `README.md` — 전체 개념과 학습 순서
- `GUIDE.md` — Windows 환경 준비부터 첫 실행까지 따라 하는 실습서
- `SAMPLE.md` — 복사해 사용할 워크플로 2개와 연습용 이슈 예문

## 추천 학습 순서

1. [GUIDE.md](GUIDE.md)의 0~4단계로 환경을 준비합니다.
2. [SAMPLE.md](SAMPLE.md)의 두 워크플로를 각각 안내된 경로에 저장합니다.
3. `gh aw compile`로 실행 파일을 만듭니다.
4. GitHub에 올린 뒤 연습용 이슈를 생성합니다.
5. AI의 분류 결과를 확인하고 `ai-ready` 라벨을 붙입니다.
6. 생성된 PR을 사람이 검토한 뒤 병합합니다.

## 반드시 지켜야하는 규칙

- API 키는 문서·이슈·코드에 쓰지 말고 GitHub의 **Settings → Secrets and variables → Actions**에만 저장합니다.
- 처음에는 공개 정보만 담은 별도 연습 저장소에서 실행합니다.
- AI가 만든 PR은 파일 목록과 변경 내용을 사람이 확인하기 전에는 병합하지 않습니다. 문제가 없다고 판단되면 병합하는게 안전합니다.
- `.github/workflows/*.lock.yml`은 자동 생성 파일입니다. 직접 고치지 않습니다.

## 공식 기준

이 예제는 아래 공식 문서의 Markdown 원본, YAML frontmatter, 최소 읽기 권한, safe outputs, 컴파일된 lock 파일 방식을 따릅니다.

- [워크플로 만들기](https://github.github.com/gh-aw/setup/creating-workflows/)
- [공식 갤러리](https://github.github.com/gh-aw/index.html#gallery)
- [빠른 시작](https://github.github.com/gh-aw/setup/quick-start/)
- [AI 이슈 분류](https://github.github.com/gh-aw/guides/ai-issue-triage/)
- [PR 안전 출력](https://github.github.com/gh-aw/reference/safe-outputs-pull-requests/)

작성 기준 확인일: 2026-08-12
