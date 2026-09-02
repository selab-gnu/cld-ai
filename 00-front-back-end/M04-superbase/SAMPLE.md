# 예제 실행 및 프롬프트

GUIDE.md의 1~3단계까지 마쳤다면(프로젝트 생성, todos 테이블 생성, URL·anon key 확보), 아래 코드를 그대로 사용하면 된다.

## 1단계: 내 프로젝트 정보 넣기

`index.html` 상단의 아래 두 줄을 내 값으로 바꾼다.

```js
const SUPABASE_URL = "https://xxxxx.supabase.co";      // GUIDE.md 3단계에서 복사한 Project URL
const SUPABASE_ANON_KEY = "여기에_anon_public_key_붙여넣기";
```

## 2단계: index.html 전체 코드 (그대로 복사해서 저장)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>내 할 일 목록 (Supabase 예제)</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
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

  <script>
    const SUPABASE_URL = "https://xxxxx.supabase.co";
    const SUPABASE_ANON_KEY = "여기에_anon_public_key_붙여넣기";

    const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    async function loadTodos() {
      const { data, error } = await client
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("불러오기 실패:", error);
        return;
      }

      const list = document.getElementById("todoList");
      list.innerHTML = "";
      data.forEach((todo) => {
        const li = document.createElement("li");
        li.textContent = (todo.is_done ? "✅ " : "⬜ ") + todo.task;
        list.appendChild(li);
      });
    }

    async function addTodo() {
      const input = document.getElementById("taskInput");
      const task = input.value.trim();
      if (!task) return;

      const { error } = await client.from("todos").insert({ task: task });

      if (error) {
        console.error("추가 실패:", error);
        alert("추가에 실패했습니다. 콘솔(F12)을 확인하세요.");
        return;
      }

      input.value = "";
      loadTodos();
    }

    document.getElementById("addBtn").addEventListener("click", addTodo);
    window.addEventListener("DOMContentLoaded", loadTodos);
  </script>
</body>
</html>
```

## 3단계: 실행 방법

1. 위 코드를 `index.html`이라는 이름으로 저장한다.
2. 파일을 더블클릭해서 브라우저로 연다.
3. 입력창에 할 일을 쓰고 "추가" 버튼을 누른다.
4. 화면에 바로 항목이 나타나면 성공이다.
5. Supabase 대시보드의 Table Editor에서 `todos` 테이블을 열어 같은 데이터가 보이는지 확인한다.

## 4단계: 완료 표시 기능 추가해보기 (선택 심화)

기본 예제에는 "완료 체크" 기능이 없다. 스스로 확장해보고 싶다면 아래처럼 Claude Code에게 요청할 수 있다.

> "index.html에 있는 할 일 목록 앱에 체크박스를 추가해서, 클릭하면 `is_done` 값을 true/false로 토글하고 Supabase에도 반영되게 해줘."

## 5단계: 문제가 생겼을 때 물어보는 방법

에러가 나면 아래처럼 구체적으로 물어보면 빠르게 원인을 찾을 수 있다.

> "index.html에서 할 일을 추가했는데 화면에 안 나타나. 콘솔(F12)에 뜬 에러 메시지는 다음과 같아: [여기에 에러 메시지 붙여넣기]. 원인이 뭘까?"

> "Supabase RLS 정책 때문에 insert가 막히는 것 같아. todos 테이블에 누구나 읽고 쓸 수 있는 정책을 SQL로 만들어줘."
