# 모듈 — Todo 앱으로 배우는 Claude Code Mod 기초

> 상태: 초안 · 예제: Todo 앱(Python CLI) + `todo-mod` · 선수 모듈: M03-todo-hook-harness

## 목적

M03에서는 `settings.json`의 셸 명령 Hook으로 Claude Code를 "정해진 대로" 동작하게 만들었다. M04에서는 한 단계 더 나아가 **Mod(TypeScript 플러그인)** 로 Claude Code의 **동작과 화면 자체**를 바꿔 본다. 같은 Todo 앱 위에서 차단·반응·슬래시 명령·화면 표시·자동 테스트까지 한 번씩 직접 만든다.

## 전체 과정 요약

0. **사전 준비** — Claude Code 버전과 `claude plugin validate` 동작, M03 `todo-app`을 확인한다.
1. **Mod 설계** — 이벤트 → 매처 → 동작을 표로 먼저 정한다.
2. **최소 Mod** — 파일 3개(`plugin.json`, `hooks.json`, `register.tsx`)로 시작 토스트를 띄운다.
3. **안전장치** — `tool.call` 훅으로 `rm todo.json` 같은 위험 명령을 차단한다. (M03 6단계의 Mod 버전)
4. **반응하기** — `todo.py`가 수정될 때마다 상태줄에 수정 횟수를 표시한다.
5. **슬래시 명령** — `/todo`를 입력하면 남은 할 일 개수를 보여준다.
6. **화면 꾸미기** — `$.state`와 `ui.render`로 프롬프트 위에 "남은 할 일" 띠를 그린다.
7. **자동 테스트** — `claude plugin test`로 안전장치가 항상 동작하는지 검증한다.

핵심은 이거예요: **Hook은 "명령을 실행"하고, Mod는 "Claude Code 자체를 프로그래밍"한다.** 모든 훅은 `($, e, next)` 모양이고, `next(e)`를 부르면 원래대로 진행, 안 부르면 내가 대신 답한다.

## 산출물 4종 (체크리스트)

- [x] 가이드 — [`GUIDE.md`](./GUIDE.md): 0~7단계별 규칙·산출물·체크리스트
- [x] 규칙 — `GUIDE.md` 각 단계의 "규칙" (특히 3단계 `.catch` 규칙, 6단계 `$.state` 규칙)
- [x] 자동화 — [`todo-mod/`](./todo-mod/): 완성된 Mod 전체 코드와 테스트
- [x] 샘플 — [`SAMPLE.md`](./SAMPLE.md): 실제로 재현 가능한 동작 스텝·프롬프트

## 사용 방법

1. `GUIDE.md`를 0단계부터 순서대로 따라간다.
2. 각 단계의 "산출물" 코드 블록을 그대로 복사해 `todo-app/mods/todo-mod/` 아래에 붙인다.
3. 단계마다 `claude plugin validate mods/todo-mod`로 검사하고 "체크리스트"를 직접 확인한다.
4. 막히면 [`todo-mod/`](./todo-mod/)의 완성 코드와 비교한다.
5. 7단계까지 끝나면 `SAMPLE.md`의 프롬프트를 그대로 입력해 전체 흐름을 검증한다.

## 품질 기준

`todo-mod/`의 코드는 Claude Code 2.1.296에서 `claude plugin validate`, TypeScript 타입 체크, `claude plugin test`(1 pass)를 모두 통과했다. Mod API는 얼리 액세스이므로 버전이 바뀌면 `validate`부터 다시 실행해 확인한다.
