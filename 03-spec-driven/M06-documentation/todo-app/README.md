# todo-app

할 일 목록을 관리하는 작은 앱입니다. 명령줄(CLI)과 HTTP API 두 가지 방법으로 쓸 수 있습니다.

## 실행

```bash
npm test                         # 테스트
node src/cli.js add 우유 사기     # CLI로 할 일 추가
node src/cli.js list             # CLI로 목록 보기
npm start                        # HTTP 서버 시작 (http://localhost:3000)
```

외부 라이브러리 없이 Node.js 22 이상만 있으면 동작합니다.
