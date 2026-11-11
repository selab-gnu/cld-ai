import assert from "node:assert/strict";
import { test } from "node:test";
import { addTodo, completeTodo, formatTodos, removeTodo } from "../src/todo.js";

test("[REQ-001][REQ-002] addTodo는 1부터 번호를 매긴다", () => {
  const todos = addTodo(addTodo([], "우유 사기"), "책 읽기");
  assert.deepEqual(
    todos.map((todo) => todo.id),
    [1, 2],
  );
});

test("[REQ-003] addTodo는 빈 제목을 거부한다", () => {
  assert.throws(() => addTodo([], "   "), { code: "EMPTY_TITLE" });
});

test("[REQ-004] completeTodo는 해당 항목만 완료로 바꾼다", () => {
  const todos = completeTodo(addTodo(addTodo([], "a"), "b"), 2);
  assert.deepEqual(
    todos.map((todo) => todo.done),
    [false, true],
  );
});

test("[REQ-005] completeTodo는 없는 번호를 거부한다", () => {
  assert.throws(() => completeTodo([], 99), { code: "NOT_FOUND" });
});

test("[REQ-011] completeTodo는 정수가 아닌 번호를 거부한다", () => {
  for (const id of [Number.NaN, 0, 1.5]) {
    assert.throws(() => completeTodo(addTodo([], "a"), id), { code: "INVALID_ID" });
  }
});

test("[REQ-006] formatTodos는 완료 여부를 체크박스로 보여준다", () => {
  const todos = completeTodo(addTodo([], "우유 사기"), 1);
  assert.equal(formatTodos(todos), "[x] 1. 우유 사기");
});

test("[REQ-012] removeTodo는 해당 항목만 지운다", () => {
  const todos = removeTodo(addTodo(addTodo([], "a"), "b"), 1);
  assert.deepEqual(todos, [{ id: 2, title: "b", done: false }]);
});

test("[REQ-013] removeTodo는 없는 번호를 거부한다", () => {
  assert.throws(() => removeTodo([], 99), { code: "NOT_FOUND" });
});
