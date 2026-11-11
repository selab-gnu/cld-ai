---
name: api-docs
description: HTTP API 명세(docs/api/openapi.yaml)를 만들거나 고칠 때 사용한다. src/app.js의 경로·요청·응답·오류 코드를 OpenAPI 3.1 문서로 정리하고 Redocly로 검사한다.
---

# API 문서 (OpenAPI)

## 원칙

- **원본은 `docs/api/openapi.yaml` 하나**다. 사람이 보는 HTML(`docs/api/index.html`)은 여기서 생성하며 커밋하지 않는다.
- 명세는 `src/app.js`의 실제 동작과 같아야 한다. `routes` 배열과 명세의 경로 목록은 `npm run docs:check`가 비교한다.

## 작성 규칙

- `openapi: 3.1.0`. `info`에 `title`, `version`, `description`, `license`를 쓴다. `servers`에 `http://localhost:3000`.
- 인증이 없는 API이므로 최상위에 `security: []`를 적어 "인증 없음"을 명시한다.
- 들여쓰기는 공백 2칸. 경로는 `paths:` 바로 아래 2칸, 메서드는 4칸(검사 스크립트가 이 들여쓰기로 읽는다).
- 모든 작업에 `operationId`(영문 camelCase), `summary`(한국어 한 줄), `tags`를 붙인다.
- 성공 응답과 **발생 가능한 모든 오류 응답**을 적는다. 오류 본문은 `components/schemas/Error`를 재사용한다.
- 오류 코드(`EMPTY_TITLE`, `NOT_FOUND` 등)는 `Error.code`의 `enum`에 모두 적고, 각 응답에 `example`을 단다.
- 스키마는 `components/schemas`에 두고 `$ref`로 참조한다.
- 경로 매개변수는 `components/parameters`에 정의한다.

## 절차

1. `src/app.js`의 `routes`, 각 분기의 상태 코드, `STATUS_BY_CODE`를 읽는다.
2. 명세를 쓰거나 고친다.
3. `npm run docs:api:lint`를 실행해 오류와 경고를 모두 없앤다. 이 앱에 맞지 않는 규칙은 명세를 억지로 고치지 말고 `redocly.yaml`에서 끄되, 끄는 이유를 주석으로 남긴다. 규칙을 끄기 전에 사람에게 확인받는다.
4. `npm run docs:check`의 [2] API 문서에 오류가 없는지 확인한다.
5. 필요하면 `npm run docs:api:build`로 HTML을 만들어 브라우저에서 확인한다.
