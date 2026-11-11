---
name: user-manual
description: 사용자 매뉴얼(docs/manual/)을 쓰거나 고칠 때 사용한다. Diátaxis 틀(튜토리얼·하우투·레퍼런스·설명)로 나누어, 실제로 실행해 본 명령과 출력만 담는다.
---

# 사용자 매뉴얼 (Diátaxis)

## 구조

| 파일 | 종류 | 독자의 상황 | 쓰는 법 |
|---|---|---|---|
| `docs/manual/index.md` | 목차 | 어디부터 볼지 찾는 중 | 각 문서 한 줄 소개와 링크 |
| `docs/manual/tutorial.md` | 튜토리얼 | 처음 써 본다 | 처음부터 끝까지 따라 하는 한 가지 흐름. 선택지를 주지 않는다 |
| `docs/manual/how-to.md` | 하우투 | 특정 일을 하고 싶다 | "~하려면" 제목 아래 짧은 절차. 배경 설명은 링크로 |
| `docs/manual/reference.md` | 레퍼런스 | 정확한 사양을 찾는다 | CLI 명령, 환경 변수, 오류 메시지를 빠짐없이 표로. API는 `../api/openapi.yaml` 링크 |
| `docs/manual/explanation.md` | 설명 | 왜 이렇게 동작하는지 궁금하다 | 동작 원리와 제약. 설계 이유는 ADR 링크 |

한 문서에 두 종류를 섞지 않는다. 예를 들어 튜토리얼 중간에 모든 옵션을 나열하지 않는다.

## 작성 규칙

- **명령과 출력은 실제로 실행해서 얻은 것만 쓴다.** 깨끗한 임시 폴더나 `TODO_FILE=manual-demo.json`처럼 따로 쓰는 파일로 실행하고, 출력은 그대로 붙인다. 끝나면 그 파일은 지운다.
- 사용자 관점으로 쓴다. 내부 함수 이름(`addTodo` 등)은 레퍼런스와 설명에서만 필요할 때 쓴다.
- 레퍼런스의 오류 메시지 표는 `src/todo.js`, `src/cli.js`, `src/app.js`에 있는 메시지를 빠짐없이 옮긴다.
- 저장소 루트 `README.md`에서 `docs/manual/index.md`로 링크한다.

## 절차

1. `src/cli.js`, `src/server.js`, `src/app.js`를 읽고 사용자에게 보이는 기능을 정리한다.
2. 명령을 실제로 실행하며 튜토리얼 → 하우투 → 레퍼런스 → 설명 순으로 쓴다.
3. `npm run docs:check`의 [4] 문서 링크에 오류가 없는지 확인한다.
