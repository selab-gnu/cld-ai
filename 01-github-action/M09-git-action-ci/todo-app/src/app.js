// 화면 그리기와 이벤트 처리. 판단은 todo.js에, 저장은 storage.js에 맡긴다.
import {
  MAX_LENGTH,
  addTodo,
  countActive,
  countChars,
  filterTodos,
  findFocusTarget,
  removeTodo,
  toggleTodo,
} from './todo.js';
import { loadTodos, saveTodos } from './storage.js';

const SAVE_FAILED = '변경 내용을 저장하지 못했어요. 이 창을 닫으면 목록이 사라질 수 있어요.';
const CORRUPTED = '저장된 목록을 읽을 수 없어 빈 목록으로 시작해요.';

const form = document.querySelector('#add-form');
const input = document.querySelector('#new-todo');
const charCount = document.querySelector('#char-count');
const message = document.querySelector('#message');
const storageNotice = document.querySelector('#storage-notice');
const filters = document.querySelector('#filters');
const remaining = document.querySelector('#remaining');
const list = document.querySelector('#todo-list');
const emptyState = document.querySelector('#empty-state');

// 앱의 상태는 이 두 가지뿐이다. 보기(filter)는 저장하지 않는다.
let todos = [];
let filter = 'all';

// 할 일 한 줄을 만든다. 사용자 입력은 textContent로만 넣는다.
function createItem(todo) {
  const item = document.createElement('li');
  item.dataset.id = todo.id;
  if (todo.completed) {
    item.classList.add('completed');
  }

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `todo-${todo.id}`;
  checkbox.checked = todo.completed;

  const label = document.createElement('label');
  label.htmlFor = checkbox.id;
  label.textContent = todo.text;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'delete';
  button.textContent = '삭제';
  button.setAttribute('aria-label', `${todo.text} 삭제`);

  item.append(checkbox, label, button);
  return item;
}

// 목록이 비었을 때 보여 줄 문구를 고른다.
function emptyMessage(visibleCount) {
  if (todos.length === 0) {
    return '아직 할 일이 없어요. 첫 할 일을 추가해 보세요.';
  }
  if (visibleCount > 0) {
    return '';
  }
  if (filter === 'active') {
    return '진행 중인 할 일이 없어요.';
  }
  if (filter === 'completed') {
    return '완료한 할 일이 없어요.';
  }
  return '';
}

// 상태를 보고 화면을 처음부터 다시 그린다.
function render() {
  const visible = filterTodos(todos, filter);
  list.replaceChildren(...visible.map(createItem));
  emptyState.textContent = emptyMessage(visible.length);
  // 남은 개수는 보기와 상관없이 전체 목록으로 센다.
  remaining.textContent = `남은 할 일 ${countActive(todos)}개`;
}

// 목록을 바꾸는 유일한 통로. 바꾸고, 저장하고, 다시 그린다.
function commit(nextTodos) {
  todos = nextTodos;
  const saved = saveTodos(todos);
  storageNotice.textContent = saved ? '' : SAVE_FAILED;
  render();
}

// 입력란의 글자 수 표시를 갱신한다.
function updateCharCount() {
  const count = countChars(input.value);
  const over = count > MAX_LENGTH;
  charCount.textContent = over
    ? `${count}/${MAX_LENGTH} (${count - MAX_LENGTH}자 초과)`
    : `${count}/${MAX_LENGTH}`;
  charCount.classList.toggle('over-limit', over);
}

// 사라진 할 일 대신 초점을 받을 요소를 찾아 초점을 옮긴다.
// targetId가 null이면 입력란으로 간다.
function focusNeighbor(targetId, selector) {
  const target =
    targetId === null ? null : list.querySelector(`li[data-id="${targetId}"] ${selector}`);
  (target ?? input).focus();
}

// 할 일 추가 (Enter 키와 추가 버튼 모두 여기로 온다)
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const result = addTodo(todos, input.value);

  if (result.ok) {
    commit(result.todos);
    input.value = '';
    updateCharCount();
    message.textContent = result.duplicate
      ? '같은 내용의 할 일이 이미 있어요. 그대로 추가했어요.'
      : '';
  } else if (result.reason === 'empty') {
    message.textContent = '할 일 내용을 입력해 주세요.';
  } else {
    message.textContent = `할 일은 ${MAX_LENGTH}자까지 입력할 수 있어요. 지금은 ${countChars(input.value)}자예요.`;
  }
  input.focus();
});

input.addEventListener('input', updateCharCount);

// 완료 여부 변경
list.addEventListener('change', (event) => {
  if (event.target.type !== 'checkbox') {
    return;
  }
  const id = Number(event.target.closest('li').dataset.id);
  // 바꾸기 전에 보이던 목록으로 초점 대상을 미리 계산해 둔다.
  const neighborId = findFocusTarget(filterTodos(todos, filter), id);
  commit(toggleTodo(todos, id));

  const same = list.querySelector(`#todo-${id}`);
  if (same) {
    same.focus();
  } else {
    focusNeighbor(neighborId, 'input[type="checkbox"]');
  }
});

// 삭제 (확인을 묻지 않는다)
list.addEventListener('click', (event) => {
  const button = event.target.closest('button.delete');
  if (!button) {
    return;
  }
  const id = Number(button.closest('li').dataset.id);
  const neighborId = findFocusTarget(filterTodos(todos, filter), id);
  commit(removeTodo(todos, id));
  focusNeighbor(neighborId, 'button.delete');
});

// 보기 전환. 목록 자체는 바뀌지 않으므로 저장하지 않는다.
filters.addEventListener('change', (event) => {
  filter = event.target.value;
  render();
});

// 시작: 저장된 목록을 읽어 화면에 그린다.
const loaded = loadTodos();
todos = loaded.todos;
if (loaded.corrupted) {
  storageNotice.textContent = CORRUPTED;
} else if (!loaded.available) {
  storageNotice.textContent = SAVE_FAILED;
}
// 브라우저가 새로 고침 때 양식 상태를 되살려도 화면과 상태가 어긋나지 않게 맞춘다.
document.querySelector('#filter-all').checked = true;
updateCharCount();
render();
