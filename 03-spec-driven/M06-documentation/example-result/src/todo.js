// 할 일 목록을 다루는 순수 함수들. 원본 배열은 바꾸지 않고 새 배열을 돌려준다.

// 규칙 위반을 나타내는 오류. code로 오류 종류를 구분한다.
export class TodoError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export function addTodo(todos, title) {
  const trimmed = title.trim();
  if (trimmed === "") {
    throw new TodoError("EMPTY_TITLE", "제목은 비어 있을 수 없습니다.");
  }
  const nextId = todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
  return [...todos, { id: nextId, title: trimmed, done: false }];
}

// 번호는 1 이상의 정수여야 한다.
function assertValidId(id) {
  if (!Number.isInteger(id) || id < 1) {
    throw new TodoError("INVALID_ID", "번호는 1 이상의 정수여야 합니다.");
  }
}

export function completeTodo(todos, id) {
  assertValidId(id);
  if (!todos.some((todo) => todo.id === id)) {
    throw new TodoError("NOT_FOUND", `${id}번 할 일을 찾을 수 없습니다.`);
  }
  return todos.map((todo) => (todo.id === id ? { ...todo, done: true } : todo));
}

export function removeTodo(todos, id) {
  assertValidId(id);
  if (!todos.some((todo) => todo.id === id)) {
    throw new TodoError("NOT_FOUND", `${id}번 할 일을 찾을 수 없습니다.`);
  }
  return todos.filter((todo) => todo.id !== id);
}

export function formatTodos(todos) {
  if (todos.length === 0) {
    return "할 일이 없습니다.";
  }
  return todos
    .map((todo) => `${todo.done ? "[x]" : "[ ]"} ${todo.id}. ${todo.title}`)
    .join("\n");
}
