# 아키텍처 개요

> 이 문서는 코드(`src/`)에서 생성했으며 2026-11-11 기준입니다. 설계 이유는 [설계 결정 기록](../adr/README.md)을 참고하세요.

## 1. 시스템 컨텍스트

```mermaid
flowchart LR
    user(["사용자<br/>(터미널 사용자)"])
    client(["API 클라이언트<br/>(다른 프로그램, curl)"])
    system["todo-app<br/>(할 일 관리)"]
    user -->|"명령어로 추가·완료·조회"| system
    client -->|"HTTP/JSON 요청"| system
```

todo-app은 외부 시스템에 의존하지 않습니다. 사람은 CLI로, 다른 프로그램은 HTTP API로 사용합니다.

## 2. 컨테이너

```mermaid
flowchart LR
    user(["사용자"])
    client(["API 클라이언트"])
    subgraph todoapp["todo-app"]
        cli["CLI<br/>(Node.js, src/cli.js)"]
        server["HTTP 서버<br/>(Node.js, src/server.js)"]
        file[("저장 파일<br/>(JSON, todos.json)")]
    end
    user -->|"node src/cli.js add …"| cli
    client -->|"HTTP/JSON, 포트 3000"| server
    cli -->|"읽기/쓰기"| file
    server -->|"읽기/쓰기"| file
```

CLI와 HTTP 서버는 별개의 실행 단위이지만 같은 저장 파일을 씁니다. 저장 파일 위치는 `TODO_FILE` 환경 변수로 바꿀 수 있습니다(근거: `src/cli.js`, `src/server.js`). 저장 방식은 [ADR-0001](../adr/0001-json-file-storage.md)에서 정했습니다.

## 3. 컴포넌트

```mermaid
flowchart TD
    cli["cli.js<br/>명령 해석·출력"]
    server["server.js<br/>포트·저장 위치 설정"]
    app["app.js<br/>HTTP 경로 처리·오류 → 상태 코드"]
    todo["todo.js<br/>할 일 규칙 (순수 함수)"]
    store["store.js<br/>JSON 파일 읽기·쓰기"]
    cli --> todo
    cli --> store
    server --> app
    app --> todo
    app --> store
```

규칙은 모두 `todo.js`에 있고, 파일 입출력은 `store.js`에만 있습니다. `cli.js`와 `app.js`는 둘을 이어 붙이는 얇은 층입니다(근거: 각 파일의 `import` 문).

## 4. 동적 뷰 — 할 일 추가 (`POST /todos`)

```mermaid
sequenceDiagram
    actor C as API 클라이언트
    participant A as app.js
    participant S as store.js
    participant T as todo.js
    C->>A: POST /todos {"title": "우유 사기"}
    A->>S: loadTodos(filePath)
    S-->>A: 기존 목록
    A->>T: addTodo(목록, "우유 사기")
    alt 제목이 비어 있음
        T-->>A: TodoError(EMPTY_TITLE)
        A-->>C: 400 {"error": {"code": "EMPTY_TITLE", …}}
    else 정상
        T-->>A: 새 목록
        A->>S: saveTodos(filePath, 새 목록)
        A-->>C: 201 {"id": 1, "title": "우유 사기", "done": false}
    end
```

## 5. 관련 결정

- [ADR-0001: 할 일 목록을 JSON 파일 하나에 저장한다](../adr/0001-json-file-storage.md)
