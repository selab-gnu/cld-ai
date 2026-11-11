# 하우투

## 저장 위치를 바꾸려면

`TODO_FILE` 환경 변수에 파일 경로를 지정합니다. 업무용과 개인용 목록을 나눌 때 씁니다.

```bash
TODO_FILE=work.json node src/cli.js add 회의 준비
TODO_FILE=work.json node src/cli.js list
```

Windows PowerShell에서는 `$env:TODO_FILE="work.json"`을 먼저 실행합니다.

## HTTP API로 사용하려면

1. 서버를 시작합니다. 기본 포트는 3000입니다.

   ```bash
   npm start
   ```

   ```
   todo-app 서버: http://localhost:3000
   ```

2. 다른 터미널에서 요청을 보냅니다.

   ```bash
   curl -X POST localhost:3000/todos -H 'Content-Type: application/json' -d '{"title":"우유 사기"}'
   ```

   ```
   {"id":1,"title":"우유 사기","done":false}
   ```

   ```bash
   curl -X POST localhost:3000/todos/1/done
   ```

   ```
   {"id":1,"title":"우유 사기","done":true}
   ```

3. 서버는 `Ctrl + C`로 끕니다.

포트는 `PORT=4000 npm start`처럼 바꿀 수 있습니다. 모든 경로와 응답은 [OpenAPI 문서](../api/openapi.yaml)를 참고하세요.

## 할 일을 삭제하려면

```bash
node src/cli.js remove 2
```

```
삭제했습니다.
```

삭제한 할 일은 복구할 수 없습니다. API로는 `curl -X DELETE localhost:3000/todos/2`를 보냅니다(성공하면 응답 본문 없이 204).

## 오류가 났는지 스크립트에서 확인하려면

CLI는 오류가 나면 종료 코드 `1`로 끝납니다.

```bash
node src/cli.js done 99 || echo "실패"
```
