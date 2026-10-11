# 개념

이 가이드는 **Claude Code Mod(모드)** 를 아주 작은 예제로 처음부터 만들어 봅니다.
M03에서 만든 **Todo 앱**(`todo-app`)을 그대로 재사용하므로, M03을 먼저 끝내고 오면 가장 쉽습니다.

## Mod란?

Mod는 Claude Code **자체의 화면과 동작을 바꾸는 작은 플러그인**입니다. TypeScript 파일 하나에 "이 이벤트가 일어나면 이렇게 해라"를 함수로 적습니다.

| | M03의 Hook (`settings.json`) | M04의 Mod (`register.tsx`) |
|---|---|---|
| 작성 방법 | JSON 안에 셸 명령 한 줄 | TypeScript 함수 |
| 할 수 있는 일 | 도구 실행 전/후에 명령 실행, 차단 | 차단 + **화면 꾸미기**(토스트, 상태줄, 프롬프트 위 띠, 패널) + **슬래시 명령 추가** + 상태 저장 |
| 실행 위치 | 내 컴퓨터의 셸 | Claude Code 안의 격리된 환경 (Node·DOM 없음, 모든 외부 접근은 `$`로) |
| 테스트 | 직접 해보는 수밖에 없음 | `claude plugin test`로 자동 테스트 가능 |

## 꼭 외울 3가지

1. **`on(이벤트, 매처?, 훅)`** — 이벤트에 훅을 붙인다. 예: `on('tool.call', { tool: 'Bash' }, 훅)`
2. **훅의 모양은 항상 `($, e, next)`**
   - `$` : Claude Code에 일을 시키는 리모컨 (`$.ui.toast(...)`, `$.fs.read(...)` 등)
   - `e` : 지금 일어난 이벤트의 내용 (예: 실행하려는 Bash 명령 `e.command`)
   - `next(e)` : "원래 하던 대로 계속 진행해" 버튼. **부르면 진행, 안 부르면 내가 대신 답한 것**
3. **Mod는 파일 3개로 시작한다** — `plugin.json`(이름표), `hooks.json`(어느 파일을 읽을지), `register.tsx`(실제 코드)

> ⚠️ Mod API는 **얼리 액세스**입니다. 버전에 따라 바뀔 수 있으므로, 이 가이드의 코드는 Claude Code **2.1.296** 에서 `validate`·타입 체크·`test`를 통과한 것입니다.

---

# 0 단계: 사전 준비

- Claude Code 버전을 확인한다: `claude --version` (오래됐다면 업데이트한다).
- `claude plugin validate --help` 가 동작하는지 확인한다. 동작하지 않으면 Mod를 지원하지 않는 버전이다.
- M03의 `todo-app` 폴더가 있고 `python todo.py list` 가 동작한다. (python인지 python3인지도 M03처럼 확인)
- TypeScript를 몰라도 된다. 코드 블록을 그대로 복사해서 붙이면 된다.

## 체크리스트
- [ ] `claude --version` 결과를 적어 두었다.
- [ ] `claude plugin validate --help` 가 도움말을 출력한다.
- [ ] `todo-app` 폴더에서 `python todo.py list` 가 동작한다.

---

# 1 단계: Mod 설계 — 무엇을 만들지 표로 정하기

## 규칙
- M03처럼 **이벤트 → 매처 → 동작** 을 먼저 표로 정리하고 구현한다.
- 한 단계에 기능 하나씩만 추가하고, 추가할 때마다 `validate`로 확인한다.

## 산출물
Mod 설계표 (이 가이드에서 만들 `todo-mod`)

| 단계 | 이벤트 | 매처 | 동작 | 목적 |
|---|---|---|---|---|
| 2 | `session.start` | 없음 | 토스트 "todo-mod 로드됨" | Mod가 켜졌는지 눈으로 확인 |
| 3 | `tool.call` | `{ tool: 'Bash' }` | `rm todo.json` 등 차단 | 데이터 유실 방지 (M03 6단계의 Mod 버전) |
| 4 | `tool.call` | 없음 (안에서 Edit/Write 확인) | 상태줄에 "todo.py 수정 N회" | 변경 횟수 한눈에 보기 |
| 5 | `command.run` | `{ command: 'todo' }` | `/todo` 입력 시 할 일 개수 출력 | 나만의 슬래시 명령 |
| 6 | `turn.complete` + `ui.render` | `{ component: 'AbovePrompt' }` | 프롬프트 위에 "남은 할 일 2 / 3" | 항상 보이는 미니 대시보드 |

## 체크리스트
- [ ] 각 행이 "내가 매번 직접 확인하던 일"인지 점검했다.
- [ ] Hook(M03)으로도 되는 것(3단계)과 Mod만 되는 것(2·4·5·6단계)을 구분했다.

---

# 2 단계: 최소 Mod 만들기 — 파일 3개 + 토스트

## 규칙
- Mod는 `todo-app/mods/todo-mod/` 폴더 하나에 모은다. (프로젝트 코드와 섞지 않는다)
- `plugin.json`의 `name`과 폴더 이름을 똑같이 `todo-mod`로 맞춘다.
- 코드 파일은 처음부터 `.tsx`로 만든다. (6단계에서 화면을 그릴 때 JSX가 필요하기 때문)

## 산출물

폴더 구조

```
todo-app/
├── todo.py
├── todo.json
├── CLAUDE.md
├── .claude/settings.json      ← M03의 Hook (그대로 둬도 된다)
└── mods/
    └── todo-mod/
        ├── .claude-plugin/
        │   └── plugin.json    ← ① 이름표
        └── hooks/
            ├── hooks.json     ← ② 어떤 코드 파일을 읽을지
            └── register.tsx   ← ③ 실제 코드
```

① `mods/todo-mod/.claude-plugin/plugin.json`

```json
{
  "name": "todo-mod",
  "version": "0.1.0",
  "description": "Todo 앱 작업을 돕는 첫 번째 mod"
}
```

② `mods/todo-mod/hooks/hooks.json`

```json
{ "modules": ["./register.tsx"] }
```

③ `mods/todo-mod/hooks/register.tsx`

```tsx
import type { Register } from 'claude-code'

export const register: Register = on => {
  // 세션이 시작되면 화면 구석에 토스트를 띄운다
  on('session.start', async ($, e, next) => {
    $.ui.toast('todo-mod 로드됨 👋')
    return next(e) // 원래 하던 시작 동작을 계속 진행
  })
}
```

검사하고 실행하기

```bash
cd todo-app
claude plugin validate mods/todo-mod     # ① 문법/구조 검사
claude --plugin-dir mods/todo-mod        # ② 이 mod를 켠 채로 Claude Code 실행
```

> 💡 `--plugin-dir`로 켠 세션은 파일을 **저장하면 자동으로 다시 로드**됩니다. 3단계부터는 Claude Code를 켜 둔 채로 코드를 고치고 저장만 하면 됩니다.

## 체크리스트
- [ ] `claude plugin validate` 결과에 `hooks: session.start` 와 `√ Validation passed` 가 보인다. (`author` 경고는 무시해도 된다)
- [ ] `claude --plugin-dir mods/todo-mod` 로 실행하자 "todo-mod 로드됨 👋" 토스트가 떴다.

---

# 3 단계: 안전장치 — 위험한 Bash 명령 차단

## 규칙
- `todo.json`을 지우거나(`rm`) 덮어쓰는(`>`) Bash 명령은 무조건 차단한다. (M03 6단계와 같은 규칙)
- 차단은 `next`를 **부르지 않고** `{ deny: '이유' }` 를 돌려주는 것이다.
- 차단용 훅에는 반드시 `.catch(...)` 를 붙인다. 훅이 에러로 죽었을 때 "그냥 통과"가 아니라 "차단"되게 하기 위해서다.

## 산출물
`register.tsx`의 `register` 함수 **위쪽**에 상수 한 줄을 추가한다.

```tsx
const DANGER = /rm\s+.*todo\.json|>\s*todo\.json/
```

`register` 함수 **안쪽**, 2단계 `session.start` 블록 아래에 추가한다.

```tsx
  // [3단계] 위험한 Bash 명령 차단
  on('tool.call', { tool: 'Bash' }, ($, e, next) =>
    DANGER.test(e.command)
      ? { deny: '차단됨: todo.json을 직접 삭제/덮어쓸 수 없습니다.' } // next를 안 부름 = 차단
      : next(e),                                                       // 안전하면 원래대로 실행
  ).catch(($, e, next) =>
    next.called ? next(e) : { deny: 'todo-mod: 안전 검사에 실패해 차단했습니다.' },
  )
```

M03과 비교해 보기

| M03 Hook (셸 한 줄) | M04 Mod |
|---|---|
| `jq -r '.tool_input.command'` 로 명령을 꺼냄 | `e.command` 로 바로 읽음 |
| `exit 2` 로 차단 | `{ deny: '이유' }` 를 돌려줌 |
| 에러가 나면 어떻게 될지 불분명 | `.catch`로 "에러 = 차단"을 명시 |

## 체크리스트
- [ ] `claude plugin validate` 결과에 `gating hook with .catch: tool.call{tool=Bash}` 가 보인다.
- [ ] Claude에게 "`rm todo.json` 실행해줘"라고 요청했더니 차단 메시지가 나왔다.
- [ ] "`python todo.py list` 실행해줘"는 정상 실행됐다.

---

# 4 단계: 반응하기 — `todo.py` 수정 횟수를 상태줄에 표시

## 규칙
- 이번 훅은 막는 게 아니라 **결과를 보고 반응**만 한다. 그래서 먼저 `await next(e)` 로 도구를 실행시킨 뒤, 그 결과를 보고 상태줄을 바꾼다.
- 차단용이 아니므로 `.catch`는 붙이지 않는다. (실패하면 이 훅만 건너뛰고 나머지는 정상 진행된다)

## 산출물
`register` 함수 **안쪽 맨 위**(첫 `on(...)` 위)에 변수를 추가한다.

```tsx
  let edits = 0
```

3단계 블록 아래에 추가한다.

```tsx
  // [4단계] todo.py가 수정되면 상태줄에 횟수 표시
  on('tool.call', async ($, e, next) => {
    const ran = await next(e) // 먼저 도구를 실제로 실행
    const isTodoEdit =
      (e.tool === 'Edit' || e.tool === 'Write') && e.file_path.endsWith('todo.py')
    if (isTodoEdit && ran.deny === undefined) {
      edits += 1
      $.ui.status(`✏️ todo.py 수정 ${edits}회`)
    }
    return ran // 실행 결과를 그대로 돌려준다
  })
```

> 💡 `edits` 같은 일반 변수는 mod가 다시 로드되면(파일 저장 시) 0으로 돌아갑니다. 유지해야 하는 값은 6단계의 `$.state`를 씁니다.

## 체크리스트
- [ ] Claude에게 "todo.py에 `complete` 기능을 추가해줘"라고 시켰다.
- [ ] 프롬프트 아래 상태줄에 `✏️ todo.py 수정 1회` 가 나타났다.

---

# 5 단계: 슬래시 명령 만들기 — `/todo`

## 규칙
- 명령은 `session.start` 에서 **등록**하고, `command.run` 훅에서 **응답**한다. (등록 + 응답 두 군데)
- 파일은 `$.fs.read` 로 읽는다. Mod에는 Node가 없어서 `fs` 모듈을 쓸 수 없다.
- `todo.json`이 아직 없을 수도 있으니 먼저 `$.fs.exists` 로 확인한다.

## 산출물
① 파일 **맨 위 import 줄**을 아래처럼 바꾼다. (`EngineInterface` 추가)

```tsx
import type { EngineInterface, Register } from 'claude-code'
```

② `register` 함수 **위쪽**에 도우미 함수를 추가한다.

```tsx
const DB = 'todo.json'

type Item = { text: string; done: boolean }

// todo.json을 읽어 전체/남은 개수를 센다. 파일이 없으면 0개로 본다.
async function countTodos($: EngineInterface) {
  if (!(await $.fs.exists(DB))) return { total: 0, left: 0 }
  const items = JSON.parse(await $.fs.read(DB)) as Item[]
  return { total: items.length, left: items.filter(i => !i.done).length }
}
```

③ 2단계 `session.start` 블록을 아래처럼 바꾼다. (명령 등록 추가)

```tsx
  on('session.start', async ($, e, next) => {
    $.ui.toast('todo-mod 로드됨 👋')
    await $.command.register({
      name: 'todo',
      description: 'todo.json의 할 일 개수를 보여준다',
    })
    return next(e)
  })
```

④ 4단계 블록 아래에 응답 훅을 추가한다.

```tsx
  // [5단계] /todo 슬래시 명령
  on('command.run', { command: 'todo' }, async $ => {
    const { total, left } = await countTodos($)
    return { text: `📋 할 일 ${total}개 중 ${left}개 남음` }
  })
```

## 체크리스트
- [ ] `claude plugin validate` 결과에 `answers its own command: command.run{command=todo}` 가 보인다.
- [ ] 프롬프트에 `/` 를 입력하면 목록에 `/todo` 가 보인다.
- [ ] `/todo` 를 실행하면 `📋 할 일 N개 중 M개 남음` 이 출력된다.

---

# 6 단계: 화면 꾸미기 — 프롬프트 위에 "남은 할 일" 띠

## 규칙
- 화면에 그리는 값은 일반 변수가 아니라 **`$.state`** 에 저장한다. (재로드돼도 유지되고, 값이 바뀌면 화면이 자동으로 다시 그려진다)
- `$.state`에 넣는 값은 **타입 계약 파일**(`types/index.d.ts`)에 미리 선언하고, `plugin.json`에 그 파일을 적는다.
- 그리는 훅(`ui.render`)에서는 **읽기만** 한다. 값 쓰기는 다른 이벤트(`turn.complete`)에서 한다.

## 산출물
① 새 파일 `mods/todo-mod/types/index.d.ts` — "todo-mod는 summary라는 값을 저장한다"는 약속

```ts
export type TodoSummary = { total: number; left: number }

declare module 'claude-code' {
  interface PluginState {
    'todo-mod': { summary: TodoSummary | null }
  }
}
```

② `plugin.json`에 `types` 한 줄을 추가한다.

```json
{
  "name": "todo-mod",
  "version": "0.1.0",
  "description": "Todo 앱 작업을 돕는 첫 번째 mod",
  "types": "./types/index.d.ts"
}
```

③ `register.tsx` **맨 위 import 부분**을 아래처럼 바꾸고, `summary` 상태를 만든다.

```tsx
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { TodoSummary } from '../types'

const summary = atom({ plugin: 'todo-mod', key: 'summary' } as const, null)
```

④ 5단계 `countTodos`의 첫 줄에 반환 타입을 붙인다.

```tsx
async function countTodos($: EngineInterface): Promise<TodoSummary> {
```

⑤ `register` 함수 안, 5단계 블록 아래에 추가한다.

```tsx
  // [6단계] 턴이 끝날 때마다 개수를 다시 세서 저장 (= 쓰기)
  on('turn.complete', async ($, e, next) => {
    const counted = await countTodos($).catch(() => null)
    await update($, summary, () => counted)
    return next(e)
  })

  // [6단계] 프롬프트 위 띠에 그리기 (= 읽기만)
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const s = await read($, summary)
    if (s === null || e.props.hasSurvey) return next(e) // 보여줄 게 없으면 원래대로
    const { Text } = $.ui.resolve(e) // 화면 부품은 여기서 꺼내 쓴다
    return <Text dimColor>📋 남은 할 일 {s.left} / {s.total}</Text>
  })
```

## 체크리스트
- [ ] `claude plugin validate` 결과에 `declares state: todo-mod.summary` 와 `state writes / reads: todo-mod.summary` 가 보인다.
- [ ] Claude에게 아무 질문이나 한 번 하고 답이 끝나자, 프롬프트 위에 `📋 남은 할 일 M / N` 띠가 나타났다.
- [ ] `python todo.py add "빵 사기"` 를 Claude에게 시킨 뒤, 띠의 숫자가 1 늘었다.

---

# 7 단계: 자동 테스트 & 문제 해결

## 규칙
- "막아야 하는 것"(3단계 안전장치)은 반드시 자동 테스트로 남긴다. 사람이 매번 `rm todo.json`을 시켜볼 수는 없다.
- 테스트 안에서는 실제 셸을 돌리지 않는다. 가짜 "엔진" 훅이 대신 결과를 돌려준다.

## 산출물
`mods/todo-mod/tests/guard.test.ts`

```ts
import { expect, test } from 'claude-code/testing'

test('todo.json을 지우는 Bash 명령은 차단된다', async ($, on) => {
  // 실제 셸 대신, 아래 hook이 "엔진" 역할을 하며 가짜 결과를 돌려준다
  on('tool.call', { tool: 'Bash' }, () => ({ result: 'ran', text: 'ran' }))

  const blocked = await $.tool.call({ tool: 'Bash', command: 'rm todo.json' })
  expect(blocked.deny).toContain('차단됨')

  const allowed = await $.tool.call({ tool: 'Bash', command: 'python todo.py list' })
  expect(allowed.deny).toBeUndefined()
  expect(allowed.text).toBe('ran')
})
```

실행

```bash
claude plugin test mods/todo-mod
```

최종 폴더 구조

```
mods/todo-mod/
├── .claude-plugin/plugin.json
├── hooks/
│   ├── hooks.json
│   └── register.tsx
├── types/index.d.ts
└── tests/guard.test.ts
```

> 전체 완성 코드는 이 폴더의 [`todo-mod/`](./todo-mod/) 에 있습니다. 막히면 비교해 보세요.

문제 해결표

| 증상 | 확인할 것 |
|---|---|
| 토스트가 안 뜬다 | `claude --plugin-dir mods/todo-mod` 로 실행했는지, `plugin.json`의 `name`이 맞는지 |
| 코드를 고쳤는데 반영이 안 된다 | 파일을 저장했는지. 그래도 안 되면 Claude Code를 껐다 켠다 |
| 훅이 아무 일도 안 한다 | `claude --debug --plugin-dir mods/todo-mod` 로 실행해 에러 줄을 확인 |
| 띠가 안 보인다 | 한 턴이 끝난 뒤에 나타난다. `types` 파일과 `plugin.json`의 `types` 줄 확인 |
| `validate`가 실패한다 | 에러 메시지에 적힌 파일·줄을 그대로 Claude에게 보여주고 고쳐 달라고 한다 |

## 체크리스트
- [ ] `claude plugin test mods/todo-mod` 결과가 `1 pass, 0 fail` 이다.
- [ ] 3단계의 `DANGER` 정규식에서 `rm` 부분을 일부러 지우고 테스트하면 실패하는 것을 확인했다. (확인 후 원래대로 되돌린다)
