# [버그] `done`에 숫자가 아닌 번호를 넣으면 "NaN번 할 일을 찾을 수 없습니다"가 출력된다

- 상태: 해결됨 (REQ-011 추가, `completeTodo`에서 번호 형식 검사)
- 심각도: 낮음 (메시지, 표시 문제)
- 영역: CLI
- 관련 요구사항: REQ-011 (보고 당시에는 없었음. REQ-005는 "없는 번호"만 다룸)

## 재현 절차
1. `TODO_FILE=bug-demo.json node src/cli.js add 우유 사기`
2. `TODO_FILE=bug-demo.json node src/cli.js done abc`

## 기대 결과
번호 형식이 잘못되었다는 것을 알려 주는 메시지가 출력되고, 종료 코드는 1이다.

## 실제 결과
```text
오류: NaN번 할 일을 찾을 수 없습니다.
```
종료 코드는 1이고 목록은 바뀌지 않는다. 같은 증상이 아래에서도 나타난다.

```text
$ node src/cli.js done
오류: NaN번 할 일을 찾을 수 없습니다.
$ node src/cli.js done 1.5
오류: 1.5번 할 일을 찾을 수 없습니다.
```

## 환경
- Linux / Node.js 22.23.4 / 커밋 41438c3

## 원인 추정
`src/cli.js` L14에서 인자를 검사 없이 `Number(args[0])`로 바꾸므로 `"abc"`와 빈 값은 `NaN`이 된다. `src/todo.js` L21의 `completeTodo`는 번호 형식을 따로 검사하지 않고 "찾을 수 없음"으로 처리한다.

## 제안
- 요구사항 추가: "만약 번호가 1 이상의 정수가 아니면, 시스템은 아무것도 바꾸지 않고 번호 형식 오류를 알려야 한다."
- `completeTodo`에서 번호 형식을 먼저 검사하면 CLI와 HTTP API에 같은 규칙이 적용된다.
