# 예제 실행 및 프롬프트

GUIDE.md의 1~4단계까지 마쳤다면(프로젝트 생성, `todos` 테이블 생성, 정책 추가, Project URL/Publishable key 확보), 아래 코드를 그대로 사용하면 된다.

## 1단계: 내 프로젝트 정보 넣기

`index.html` 상단의 `SUPABASE_URL`, `SUPABASE_KEY` 값을 GUIDE.md 4단계에서 복사한 값으로 바꾼다.

```js
const SUPABASE_URL = "여기에_Project_URL_붙여넣기"; // 예: https://xxxxxxxx.supabase.co
const SUPABASE_KEY = "여기에_publishable_key_붙여넣기"; // sb_publishable_... 로 시작 (sb_secret_... 절대 아님!)
```

> ⚠️ `SUPABASE_KEY` 자리에는 반드시 **Connect 창의 Publishable key** (`sb_publishable_...`)를 넣는다. 예전 자료를 보고 있다면 `anon` 키를 넣어도 지금은 동일하게 동작하지만, `sb_secret_...`로 시작하는 **Secret key**는 절대 넣지 않는다 — 브라우저 코드는 누구나 개발자도구로 열어볼 수 있어서, secret 키가 노출되면 내 데이터베이스 전체가 무방비로 뚫린다.

## 2단계: index.html 전체 코드 (그대로 복사해서 저장)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>내 할 일 목록 (Supabase 예제)</title>
  <style>
    body { font-family: sans-serif; max-width: 480px; margin: 40px auto; }
    li { margin: 6px 0; }
    input { padding: 6px; width: 70%; }
    button { padding: 6px 12px; }
  </style>
</head>
<body>
  <h2>할 일 목록</h2>
  <input id="taskInput" placeholder="할 일을 입력하세요" />
  <button id="addBtn">추가</button>
  <ul id="todoList"></ul>

  <script type="module">
    import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

    const SUPABASE_URL = "여기에_Project_URL_붙여넣기";
    const SUPABASE_KEY = "여기에_publishable_key_붙여넣기";

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    async function loadTodos() {
      try {
        const { data, error } = await supabase
          .from("todos")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const list = document.getElementById("todoList");
        list.innerHTML = "";
        data.forEach((todo) => {
          const li = document.createElement("li");
          li.textContent = (todo.is_done ? "✅ " : "⬜ ") + todo.task;
          list.appendChild(li);
        });
      } catch (err) {
        console.error("불러오기 실패:", err.message);
      }
    }

    async function addTodo() {
      const input = document.getElementById("taskInput");
      const task = input.value.trim();
      if (!task) return;

      try {
        const { error } = await supabase
          .from("todos")
          .insert({ task: task, is_done: false });

        if (error) throw error;

        input.value = "";
        loadTodos();
      } catch (err) {
        console.error("추가 실패:", err.message);
        alert("추가에 실패했습니다. 콘솔(F12)을 확인하세요.\n(정책이 없으면 'row-level security' 에러가 뜹니다)");
      }
    }

    document.getElementById("addBtn").addEventListener("click", addTodo);
    window.addEventListener("DOMContentLoaded", loadTodos);
  </script>
</body>
</html>
```

> `type="module"`이 꼭 필요하다. jsDelivr의 `+esm` 경로는 최신 `@supabase/supabase-js` 버전을 자동으로 가져오므로 버전 번호를 신경 쓰지 않아도 되지만, 특정 버전을 고정하고 싶다면 `@supabase/supabase-js@2/+esm`처럼 메이저 버전(`@2`)을 붙이면 된다. 최신 사용법은 [Supabase 공식 문서](https://supabase.com/docs/reference/javascript/introduction)에서 확인할 수 있다.

## 3단계: 실행 방법

1. 위 코드를 `index.html`이라는 이름으로 저장한다.
2. 파일을 더블클릭해서 브라우저로 연다.
3. 입력창에 할 일을 쓰고 "추가" 버튼을 누른다.
4. 화면에 바로 항목이 나타나면 성공이다.
5. Supabase 대시보드의 Table Editor → `todos`를 열어 같은 데이터가 보이는지 확인한다.

### 잘 안 될 때 가장 흔한 원인 (연결 관련)

| 증상 | 원인 |
|---|---|
| 콘솔에 `Failed to fetch` | `SUPABASE_URL`을 잘못 복사했거나 오타 (`.supabase.co`로 끝나야 함) |
| 콘솔에 `Invalid API key` | 키를 다른 프로젝트에서 복사했거나, 앞뒤 공백이 포함됨 |
| 콘솔에 `new row violates row-level security policy` | GUIDE.md 3단계의 정책이 저장 안 됐거나, `to anon`이 아니라 `to authenticated`로 잘못 만듦 |
| 아무 에러 없이 데이터가 항상 비어 보임 | select 정책이 없는 상태 (insert 정책만 있고 select 정책이 없는 경우 자주 발생) |

## 4단계: 완료 표시 기능 추가해보기 (선택 심화)

기본 예제에는 "완료 체크" 기능이 없다. 스스로 확장해보고 싶다면 아래처럼 Claude Code에게 요청할 수 있다.

> "index.html에 있는 할 일 목록 앱에 체크박스를 추가해서, 클릭하면 `is_done` 값을 true/false로 토글하고 Supabase의 `update()`로 반영되게 해줘."

## 5단계: 문제가 생겼을 때 물어보는 방법

에러가 나면 아래처럼 구체적으로 물어보면 빠르게 원인을 찾을 수 있다.

> "index.html에서 할 일을 추가했는데 화면에 안 나타나. 콘솔(F12)에 뜬 에러 메시지는 다음과 같아: [여기에 에러 메시지 붙여넣기]. 원인이 뭘까?"

> "Supabase RLS 정책 때문에 insert가 막히는 것 같아. `todos` 테이블에 누구나(anon) 읽고 쓸 수 있는 연습용 정책 SQL을 작성해줘."

> "Connect 창에서 어떤 키를 복사해야 할지 헷갈려. publishable 키랑 secret 키를 어떻게 구분해?"
