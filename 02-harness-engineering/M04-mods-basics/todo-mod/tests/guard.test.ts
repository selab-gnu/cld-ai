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
