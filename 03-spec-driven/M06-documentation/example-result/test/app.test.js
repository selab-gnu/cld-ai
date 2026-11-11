import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "../src/app.js";

let server;
let baseUrl;

before(async () => {
  const dir = mkdtempSync(join(tmpdir(), "todo-app-"));
  server = createApp(join(dir, "todos.json"));
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

after(() => server.close());

function post(path, body) {
  return fetch(baseUrl + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

test("[REQ-001][REQ-010] POST /todos는 할 일을 만들고 201을 돌려준다", async () => {
  const res = await post("/todos", { title: "우유 사기" });
  assert.equal(res.status, 201);
  assert.deepEqual(await res.json(), { id: 1, title: "우유 사기", done: false });
});

test("[REQ-010] GET /todos는 전체 목록을 돌려준다", async () => {
  const res = await fetch(`${baseUrl}/todos`);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).length, 1);
});

test("[REQ-004][REQ-010] POST /todos/{id}/done은 완료 처리한 항목을 돌려준다", async () => {
  const res = await post("/todos/1/done");
  assert.equal(res.status, 200);
  assert.equal((await res.json()).done, true);
});

test("[REQ-003] 빈 제목이면 400과 EMPTY_TITLE을 돌려준다", async () => {
  const res = await post("/todos", { title: " " });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.code, "EMPTY_TITLE");
});

test("[REQ-011] 번호가 0이면 400과 INVALID_ID를 돌려준다", async () => {
  const res = await post("/todos/0/done");
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.code, "INVALID_ID");
});

test("[REQ-005] 없는 번호를 완료하면 404와 NOT_FOUND를 돌려준다", async () => {
  const res = await post("/todos/99/done");
  assert.equal(res.status, 404);
  assert.equal((await res.json()).error.code, "NOT_FOUND");
});

test("[REQ-012][REQ-010] DELETE /todos/{id}는 할 일을 지우고 204를 돌려준다", async () => {
  const res = await fetch(`${baseUrl}/todos/1`, { method: "DELETE" });
  assert.equal(res.status, 204);
  const list = await (await fetch(`${baseUrl}/todos`)).json();
  assert.equal(list.length, 0);
});

test("[REQ-013] 없는 번호를 삭제하면 404와 NOT_FOUND를 돌려준다", async () => {
  const res = await fetch(`${baseUrl}/todos/99`, { method: "DELETE" });
  assert.equal(res.status, 404);
  assert.equal((await res.json()).error.code, "NOT_FOUND");
});
