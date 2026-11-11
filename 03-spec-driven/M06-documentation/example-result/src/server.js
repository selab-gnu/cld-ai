import { createApp } from "./app.js";

// PORT, TODO_FILE 환경 변수로 포트와 저장 위치를 바꿀 수 있다.
const port = Number(process.env.PORT ?? 3000);
const filePath = process.env.TODO_FILE ?? "todos.json";

createApp(filePath).listen(port, () => {
  console.log(`todo-app 서버: http://localhost:${port}`);
});
