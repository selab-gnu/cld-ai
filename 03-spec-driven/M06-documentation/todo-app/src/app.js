import { createServer } from "node:http";
import { loadTodos, saveTodos } from "./store.js";
import { addTodo, completeTodo } from "./todo.js";

// 서버가 처리하는 경로 목록. scripts/check-docs.mjs가 API 문서와 비교할 때도 쓴다.
export const routes = [
  { method: "GET", path: "/todos" },
  { method: "POST", path: "/todos" },
  { method: "POST", path: "/todos/{id}/done" },
];

// 오류 코드별 HTTP 상태 코드.
const STATUS_BY_CODE = {
  EMPTY_TITLE: 400,
  INVALID_JSON: 400,
  NOT_FOUND: 404,
  ROUTE_NOT_FOUND: 404,
};

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function sendError(res, code, message) {
  sendJson(res, STATUS_BY_CODE[code] ?? 500, { error: { code, message } });
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
  }
  if (raw === "") {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("요청 본문이 올바른 JSON이 아닙니다.");
    error.code = "INVALID_JSON";
    throw error;
  }
}

// filePath에 할 일을 저장하는 HTTP 서버를 만든다. listen은 호출하는 쪽에서 한다.
export function createApp(filePath) {
  return createServer(async (req, res) => {
    try {
      const { pathname } = new URL(req.url, "http://localhost");
      const todos = loadTodos(filePath);

      if (req.method === "GET" && pathname === "/todos") {
        return sendJson(res, 200, todos);
      }

      if (req.method === "POST" && pathname === "/todos") {
        const { title } = await readJson(req);
        const next = addTodo(todos, String(title ?? ""));
        saveTodos(filePath, next);
        return sendJson(res, 201, next.at(-1));
      }

      const doneMatch = pathname.match(/^\/todos\/(\d+)\/done$/);
      if (req.method === "POST" && doneMatch) {
        const id = Number(doneMatch[1]);
        const next = completeTodo(todos, id);
        saveTodos(filePath, next);
        return sendJson(res, 200, next.find((todo) => todo.id === id));
      }

      return sendError(res, "ROUTE_NOT_FOUND", "경로를 찾을 수 없습니다.");
    } catch (error) {
      return sendError(res, error.code ?? "INTERNAL", error.message);
    }
  });
}
