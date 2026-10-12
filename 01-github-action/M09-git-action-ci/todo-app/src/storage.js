// localStorage를 읽고 쓰는 유일한 곳. 다른 파일은 localStorage에 직접 접근하지 않는다.
import { parseTodos } from './todo.js';

const STORAGE_KEY = 'my-todo:todos';

// 저장된 목록을 읽는다. 예외를 던지지 않는다.
export function loadTodos() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    return { ...parseTodos(text), available: true };
  } catch {
    return { todos: [], corrupted: false, available: false };
  }
}

// 목록 전체를 저장한다. 성공하면 true, 실패하면 false를 돌려준다.
export function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    return true;
  } catch {
    return false;
  }
}
