// 할 일 데이터를 다루는 순수 함수 모음.
// DOM, localStorage, 현재 시각, 난수를 쓰지 않고, 입력으로 받은 값을 고치지 않는다.

// 할 일 내용의 최대 글자 수
export const MAX_LENGTH = 200;

// 사용할 수 있는 보기
export const FILTERS = ['all', 'active', 'completed'];

// 사용자가 보는 글자 단위로 나누는 도구. 이모지도 한 글자로 센다.
const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' });

// 앞뒤 공백을 제거한 뒤의 글자 수를 돌려준다.
export function countChars(text) {
  let count = 0;
  for (const _ of segmenter.segment(text.trim())) {
    count += 1;
  }
  return count;
}

// 추가할 수 있는 내용인지 검사한다.
export function validateText(text) {
  const trimmed = text.trim();
  if (trimmed === '') {
    return { ok: false, reason: 'empty' };
  }
  if (countChars(trimmed) > MAX_LENGTH) {
    return { ok: false, reason: 'too-long' };
  }
  return { ok: true, text: trimmed };
}

// 같은 내용인지 비교할 때 쓰는 형태로 바꾼다.
// 앞뒤 공백, 연속된 공백의 개수, 영문 대소문자 차이를 없앤다.
function normalize(text) {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

// 진행 중인 할 일 중에 같은 내용이 있는지 알려 준다.
export function hasActiveDuplicate(todos, text) {
  const target = normalize(text);
  return todos.some((todo) => !todo.completed && normalize(todo.text) === target);
}

// 새 할 일의 id. 가장 큰 id + 1이고, 빈 목록이면 1이다.
function nextId(todos) {
  return todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
}

// 할 일을 목록 맨 뒤에 추가한 새 목록을 돌려준다.
export function addTodo(todos, text) {
  const result = validateText(text);
  if (!result.ok) {
    return { ok: false, reason: result.reason, todos };
  }
  const duplicate = hasActiveDuplicate(todos, result.text);
  const added = { id: nextId(todos), text: result.text, completed: false };
  return { ok: true, todos: [...todos, added], duplicate };
}

// 해당 id의 완료 여부를 뒤집은 새 목록을 돌려준다.
export function toggleTodo(todos, id) {
  return todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
}

// 진행 중인 할 일의 개수를 돌려준다.
export function countActive(todos) {
  return todos.filter((todo) => !todo.completed).length;
}

// 저장된 항목 하나가 올바른 할 일인지 검사한다.
function isValidTodo(item) {
  return (
    typeof item === 'object' &&
    item !== null &&
    Number.isInteger(item.id) &&
    item.id >= 1 &&
    typeof item.text === 'string' &&
    item.text !== '' &&
    typeof item.completed === 'boolean'
  );
}

// 저장소에서 읽은 문자열을 할 일 목록으로 바꾼다. 예외를 던지지 않는다.
export function parseTodos(text) {
  if (text === null) {
    return { todos: [], corrupted: false };
  }
  const corrupted = { todos: [], corrupted: true };
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return corrupted;
  }
  if (!Array.isArray(data) || !data.every(isValidTodo)) {
    return corrupted;
  }
  const ids = new Set(data.map((item) => item.id));
  if (ids.size !== data.length) {
    return corrupted;
  }
  const todos = data.map((item) => ({ id: item.id, text: item.text, completed: item.completed }));
  return { todos, corrupted: false };
}

// 해당 id의 할 일을 뺀 새 목록을 돌려준다.
export function removeTodo(todos, id) {
  return todos.filter((todo) => todo.id !== id);
}

// 화면에 보이던 목록에서 id의 할 일이 사라질 때 초점을 옮길 할 일의 id를 돌려준다.
// 다음 할 일, 없으면 앞 할 일, 그것도 없으면 null(입력란으로 옮긴다는 뜻)이다.
export function findFocusTarget(visibleTodos, id) {
  const index = visibleTodos.findIndex((todo) => todo.id === id);
  if (index === -1) {
    return null;
  }
  const neighbor = visibleTodos[index + 1] ?? visibleTodos[index - 1];
  return neighbor ? neighbor.id : null;
}

// 보기에 맞는 할 일만 골라 새 목록으로 돌려준다. 순서는 그대로다.
export function filterTodos(todos, filter) {
  if (filter === 'active') {
    return todos.filter((todo) => !todo.completed);
  }
  if (filter === 'completed') {
    return todos.filter((todo) => todo.completed);
  }
  return [...todos];
}
