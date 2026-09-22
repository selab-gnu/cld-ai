판정. REDO

사유.
- 제목 형식 자체는 `type(scope): subject` 패턴(`fix(commit-message): 에이전트/스킬 문서 오타 수정 및 실행 산출물 추가`)을 충족함.
- 그러나 `git status` 확인 결과 `_workspace/commit-draft.md`가 `AM`(staged 추가 + 이후 unstaged 수정) 상태임. `git cat-file -p :_workspace/commit-draft.md`로 확인한 **staged(인덱스) 내용**은 `test(example-002): add TEST.md placeholder file` 이며, 지금 커밋하면 이 stale 내용이 그대로 기록됨. 즉 지금 검토 중인 draft(작업 트리 최신본, `fix(commit-message): ...`)와 실제 `git diff --cached`에 반영될 파일 내용이 서로 다름 — 형식/사실 검증 대상 자체가 커밋 결과와 불일치.
- 같은 이유로 이미 staged된 `_workspace/review-report.md` 역시 이번 diff와 무관한 이전 판정("test(example-002): add TEST.md placeholder file"에 대한 PASS)을 담고 있어, 그대로 커밋되면 저장소에 사실과 다른 리뷰 기록이 남음.

수정 지시.
- `_workspace/commit-draft.md`의 최신(작업 트리) 내용을 `git add _workspace/commit-draft.md`로 다시 스테이징하여 staged 내용과 draft 제목/본문이 일치하도록 맞출 것.
- 이 리뷰 리포트(`_workspace/review-report.md`, 본 파일)도 함께 `git add`로 재스테이징하여 stale PASS 기록이 커밋되지 않도록 할 것.
- 재스테이징 후 `git diff --cached -- _workspace/commit-draft.md _workspace/review-report.md`로 staged 내용이 실제 draft/리포트와 동일한지 재확인할 것.
