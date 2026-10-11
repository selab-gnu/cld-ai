import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { TodoSummary } from '../types'

const DB = 'todo.json'
const DANGER = /rm\s+.*todo\.json|>\s*todo\.json/
const summary = atom({ plugin: 'todo-mod', key: 'summary' } as const, null)

type Item = { text: string; done: boolean }

// todo.json을 읽어 전체/남은 개수를 센다. 파일이 없으면 0개로 본다.
async function countTodos($: EngineInterface): Promise<TodoSummary> {
  if (!(await $.fs.exists(DB))) return { total: 0, left: 0 }
  const items = JSON.parse(await $.fs.read(DB)) as Item[]
  return { total: items.length, left: items.filter(i => !i.done).length }
}

export const register: Register = on => {
  let edits = 0

  // [2단계] 세션이 시작되면 인사 + /todo 명령 등록
  on('session.start', async ($, e, next) => {
    $.ui.toast('todo-mod 로드됨 👋')
    await $.command.register({
      name: 'todo',
      description: 'todo.json의 할 일 개수를 보여준다',
    })
    await update($, summary, () => null)
    return next(e)
  })

  // [3단계] 위험한 Bash 명령 차단 (M03 PreToolUse Hook의 mod 버전)
  on('tool.call', { tool: 'Bash' }, ($, e, next) =>
    DANGER.test(e.command)
      ? { deny: '차단됨: todo.json을 직접 삭제/덮어쓸 수 없습니다.' }
      : next(e),
  ).catch(($, e, next) =>
    next.called ? next(e) : { deny: 'todo-mod: 안전 검사에 실패해 차단했습니다.' },
  )

  // [4단계] todo.py가 수정되면 상태줄에 횟수 표시
  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    const isTodoEdit =
      (e.tool === 'Edit' || e.tool === 'Write') && e.file_path.endsWith('todo.py')
    if (isTodoEdit && ran.deny === undefined) {
      edits += 1
      $.ui.status(`✏️ todo.py 수정 ${edits}회`)
    }
    return ran
  })

  // [5단계] /todo 슬래시 명령
  on('command.run', { command: 'todo' }, async $ => {
    const { total, left } = await countTodos($)
    return { text: `📋 할 일 ${total}개 중 ${left}개 남음` }
  })

  // [6단계] 턴이 끝날 때마다 개수를 다시 세서 저장
  on('turn.complete', async ($, e, next) => {
    const counted = await countTodos($).catch(() => null)
    await update($, summary, () => counted)
    return next(e)
  })

  // [6단계] 프롬프트 위 띠(band)에 남은 할 일 표시
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const s = await read($, summary)
    if (s === null || e.props.hasSurvey) return next(e)
    const { Text } = $.ui.resolve(e)
    return <Text dimColor>📋 남은 할 일 {s.left} / {s.total}</Text>
  })
}
