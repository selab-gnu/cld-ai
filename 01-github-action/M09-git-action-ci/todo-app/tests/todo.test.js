import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as todo from '../src/todo.js';

test('상수: 최대 글자 수는 200이고 보기는 세 가지다', () => {
  assert.equal(todo.MAX_LENGTH, 200);
  assert.deepEqual(todo.FILTERS, ['all', 'active', 'completed']);
});

// ---------- User Story 1: 할 일 추가 ----------

test('countChars: 빈 문자열은 0자다', () => {
  assert.equal(todo.countChars(''), 0);
});

test('countChars: 앞뒤 공백은 빼고 가운데 공백은 센다', () => {
  assert.equal(todo.countChars('  우유 사기  '), 5);
  assert.equal(todo.countChars('abc'), 3);
});

test('countChars: 이모지는 조합된 것도 1자로 센다', () => {
  assert.equal(todo.countChars('👍'), 1);
  assert.equal(todo.countChars('👨‍👩‍👧'), 1);
});

test('validateText: 앞뒤 공백을 제거한 내용을 돌려준다', () => {
  assert.deepEqual(todo.validateText('  우유 사기 '), { ok: true, text: '우유 사기' });
});

test('validateText: 비어 있거나 공백뿐이면 거부한다', () => {
  assert.deepEqual(todo.validateText(''), { ok: false, reason: 'empty' });
  assert.deepEqual(todo.validateText('   '), { ok: false, reason: 'empty' });
});

test('validateText: 200자는 허용하고 201자는 거부한다', () => {
  assert.equal(todo.validateText('가'.repeat(200)).ok, true);
  assert.deepEqual(todo.validateText('가'.repeat(201)), { ok: false, reason: 'too-long' });
});

test('validateText: 앞뒤 공백을 빼고 200자면 허용한다', () => {
  const result = todo.validateText(`  ${'가'.repeat(200)}  `);
  assert.equal(result.ok, true);
  assert.equal(result.text, '가'.repeat(200));
});

test('hasActiveDuplicate: 대소문자와 공백 개수 차이는 같은 내용으로 본다', () => {
  const todos = [{ id: 1, text: 'Buy milk', completed: false }];
  assert.equal(todo.hasActiveDuplicate(todos, 'buy   MILK'), true);
  assert.equal(todo.hasActiveDuplicate(todos, '  Buy milk  '), true);
});

test('hasActiveDuplicate: 완료한 할 일과는 비교하지 않는다', () => {
  const todos = [{ id: 1, text: '우유 사기', completed: true }];
  assert.equal(todo.hasActiveDuplicate(todos, '우유 사기'), false);
});

test('hasActiveDuplicate: 공백이 있고 없고는 다른 내용이다', () => {
  const todos = [{ id: 1, text: '우유 사기', completed: false }];
  assert.equal(todo.hasActiveDuplicate(todos, '우유사기'), false);
});

test('hasActiveDuplicate: 빈 목록에는 중복이 없다', () => {
  assert.equal(todo.hasActiveDuplicate([], '우유 사기'), false);
});

test('addTodo: 빈 목록에 추가하면 id가 1인 진행 중 할 일이 생긴다', () => {
  assert.deepEqual(todo.addTodo([], '우유 사기'), {
    ok: true,
    todos: [{ id: 1, text: '우유 사기', completed: false }],
    duplicate: false,
  });
});

test('addTodo: 새 할 일은 맨 뒤에 붙고 id는 가장 큰 id + 1이다', () => {
  const todos = [
    { id: 1, text: '하나', completed: false },
    { id: 5, text: '다섯', completed: true },
  ];
  const result = todo.addTodo(todos, '새 할 일');
  assert.equal(result.todos.length, 3);
  assert.deepEqual(result.todos[2], { id: 6, text: '새 할 일', completed: false });
  assert.deepEqual(result.todos.slice(0, 2), todos);
});

test('addTodo: 앞뒤 공백만 제거하고 나머지는 입력 그대로 저장한다', () => {
  const result = todo.addTodo([], '  buy   MILK  ');
  assert.equal(result.todos[0].text, 'buy   MILK');
});

test('addTodo: 같은 내용의 진행 중인 할 일이 있어도 추가하고 중복을 알린다', () => {
  const todos = [{ id: 1, text: '우유 사기', completed: false }];
  const result = todo.addTodo(todos, '우유 사기');
  assert.equal(result.ok, true);
  assert.equal(result.duplicate, true);
  assert.equal(result.todos.length, 2);
  assert.notEqual(result.todos[0].id, result.todos[1].id);
});

test('addTodo: 빈 내용은 거부하고 목록을 바꾸지 않는다', () => {
  const todos = [{ id: 1, text: '하나', completed: false }];
  const result = todo.addTodo(todos, '   ');
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'empty');
  assert.deepEqual(result.todos, todos);
});

test('addTodo: 201자는 거부하고 목록을 바꾸지 않는다', () => {
  const todos = [{ id: 1, text: '하나', completed: false }];
  const result = todo.addTodo(todos, '가'.repeat(201));
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'too-long');
  assert.deepEqual(result.todos, todos);
});

test('addTodo: 입력으로 받은 배열을 고치지 않는다', () => {
  const todos = [{ id: 1, text: '하나', completed: false }];
  const before = structuredClone(todos);
  todo.addTodo(todos, '둘');
  assert.deepEqual(todos, before);
});

// ---------- User Story 2: 완료 여부와 남은 개수 ----------

test('toggleTodo: 해당 id의 완료 여부만 뒤집는다', () => {
  const todos = [
    { id: 1, text: '하나', completed: false },
    { id: 2, text: '둘', completed: true },
  ];
  assert.deepEqual(todo.toggleTodo(todos, 1), [
    { id: 1, text: '하나', completed: true },
    { id: 2, text: '둘', completed: true },
  ]);
  assert.deepEqual(todo.toggleTodo(todos, 2), [
    { id: 1, text: '하나', completed: false },
    { id: 2, text: '둘', completed: false },
  ]);
});

test('toggleTodo: 없는 id면 내용이 같은 목록을 돌려준다', () => {
  const todos = [{ id: 1, text: '하나', completed: false }];
  assert.deepEqual(todo.toggleTodo(todos, 99), todos);
});

test('toggleTodo: 입력으로 받은 배열과 객체를 고치지 않는다', () => {
  const todos = [{ id: 1, text: '하나', completed: false }];
  const before = structuredClone(todos);
  const result = todo.toggleTodo(todos, 1);
  assert.deepEqual(todos, before);
  assert.notEqual(result, todos);
  assert.notEqual(result[0], todos[0]);
});

test('countActive: 진행 중인 할 일만 센다', () => {
  assert.equal(todo.countActive([]), 0);
  assert.equal(
    todo.countActive([
      { id: 1, text: '하나', completed: false },
      { id: 2, text: '둘', completed: true },
      { id: 3, text: '셋', completed: false },
    ]),
    2,
  );
  assert.equal(todo.countActive([{ id: 1, text: '하나', completed: true }]), 0);
});

// ---------- User Story 3: 저장된 값 해석 ----------

test('parseTodos: 저장된 값이 없으면 빈 목록이고 손상이 아니다', () => {
  assert.deepEqual(todo.parseTodos(null), { todos: [], corrupted: false });
});

test('parseTodos: 올바른 값은 그대로 목록으로 돌려준다', () => {
  const todos = [
    { id: 1, text: '우유 사기', completed: false },
    { id: 2, text: '책 반납하기', completed: true },
  ];
  assert.deepEqual(todo.parseTodos(JSON.stringify(todos)), { todos, corrupted: false });
  assert.deepEqual(todo.parseTodos('[]'), { todos: [], corrupted: false });
});

test('parseTodos: 잘못된 값은 모두 빈 목록과 손상 표시로 돌려준다', () => {
  const broken = [
    'abc',
    '{}',
    '"문자열"',
    '[1]',
    '[null]',
    '[{"id":0,"text":"가","completed":false}]',
    '[{"id":1.5,"text":"가","completed":false}]',
    '[{"id":"1","text":"가","completed":false}]',
    '[{"id":1,"text":"","completed":false}]',
    '[{"id":1,"text":5,"completed":false}]',
    '[{"id":1,"text":"가","completed":"true"}]',
    '[{"id":1,"text":"가","completed":false},{"id":1,"text":"나","completed":false}]',
  ];
  for (const text of broken) {
    assert.deepEqual(todo.parseTodos(text), { todos: [], corrupted: true }, text);
  }
});

// ---------- User Story 4: 삭제와 초점 대상 ----------

test('removeTodo: 해당 id의 할 일만 빼고 순서를 유지한다', () => {
  const todos = [
    { id: 1, text: '하나', completed: false },
    { id: 2, text: '둘', completed: false },
    { id: 3, text: '셋', completed: true },
  ];
  assert.deepEqual(todo.removeTodo(todos, 2), [todos[0], todos[2]]);
});

test('removeTodo: 내용이 같아도 지정한 id만 뺀다', () => {
  const todos = [
    { id: 1, text: '우유 사기', completed: false },
    { id: 2, text: '우유 사기', completed: false },
  ];
  assert.deepEqual(todo.removeTodo(todos, 1), [todos[1]]);
});

test('removeTodo: 없는 id면 그대로, 마지막 하나를 빼면 빈 목록이다', () => {
  const todos = [{ id: 1, text: '하나', completed: false }];
  assert.deepEqual(todo.removeTodo(todos, 99), todos);
  assert.deepEqual(todo.removeTodo(todos, 1), []);
});

test('removeTodo: 입력으로 받은 배열을 고치지 않는다', () => {
  const todos = [{ id: 1, text: '하나', completed: false }];
  const before = structuredClone(todos);
  todo.removeTodo(todos, 1);
  assert.deepEqual(todos, before);
});

test('findFocusTarget: 다음 할 일, 없으면 앞 할 일, 없으면 null이다', () => {
  const todos = [
    { id: 1, text: '하나', completed: false },
    { id: 2, text: '둘', completed: false },
    { id: 3, text: '셋', completed: false },
  ];
  assert.equal(todo.findFocusTarget(todos, 2), 3);
  assert.equal(todo.findFocusTarget(todos, 3), 2);
  assert.equal(todo.findFocusTarget(todos, 1), 2);
  assert.equal(todo.findFocusTarget([todos[0]], 1), null);
  assert.equal(todo.findFocusTarget(todos, 99), null);
  assert.equal(todo.findFocusTarget([], 1), null);
});

// ---------- User Story 5: 걸러 보기 ----------

test('filterTodos: 보기에 맞는 할 일만 순서대로 돌려준다', () => {
  const todos = [
    { id: 1, text: '하나', completed: false },
    { id: 2, text: '둘', completed: true },
    { id: 3, text: '셋', completed: false },
  ];
  assert.deepEqual(todo.filterTodos(todos, 'all'), todos);
  assert.deepEqual(todo.filterTodos(todos, 'active'), [todos[0], todos[2]]);
  assert.deepEqual(todo.filterTodos(todos, 'completed'), [todos[1]]);
});

test('filterTodos: 알 수 없는 보기는 전체로 다루고 빈 목록은 빈 목록이다', () => {
  const todos = [{ id: 1, text: '하나', completed: true }];
  assert.deepEqual(todo.filterTodos(todos, 'xyz'), todos);
  assert.deepEqual(todo.filterTodos([], 'active'), []);
});

test('filterTodos: 입력으로 받은 배열을 고치지 않고 새 배열을 돌려준다', () => {
  const todos = [{ id: 1, text: '하나', completed: false }];
  const before = structuredClone(todos);
  const result = todo.filterTodos(todos, 'all');
  assert.deepEqual(todos, before);
  assert.notEqual(result, todos);
});
