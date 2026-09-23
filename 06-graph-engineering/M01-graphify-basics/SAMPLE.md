# 예제 실행 및 프롬프트

> 전제: GUIDE.md 1~4단계까지 완료되어 `graphify-out/graph.html`, `GRAPH_REPORT.md`, `graph.json`이 이미 생성되어 있고, `graphify hook install`도 실행된 상태를 가정한다.

## 1단계: 커밋할 변경 만들기

실습용 저장소에서 아무 코드 파일이나 하나 수정한다. 예를 들어 함수 하나를 추가하거나 이름을 바꾼다.

```
git add -A
git commit -m "feat: add rate limiter helper"
```

`graphify hook install`로 등록된 post-commit 훅이 백그라운드에서 즉시 그래프를 재빌드한다(AST만 사용하므로 API 비용 없음). 큰 저장소에서는 재빌드가 몇 초 정도 늦게 반영될 수 있다.

## 2단계: Claude Code CLI를 실행

저장소 루트에서 Claude Code를 연다.

```
claude
```

`graphify claude install`을 이미 실행해 두었다면, 소스 파일을 하나씩 읽기 전에 그래프 질의를 먼저 시도하도록 유도하는 안내가 CLAUDE.md에 들어 있어, 별도 지시 없이도 어시스턴트가 `graphify query`를 우선 사용한다.

## 3단계: 프롬프트가 뜨면 자연어로 지시

아래처럼 자연어로 질문한다. 파일을 하나씩 열어보라고 지시할 필요가 없다.

```
방금 추가한 rate limiter 헬퍼가 어떤 모듈과 연결돼 있는지 알려줘.
```

```
인증(auth) 로직과 데이터베이스 커넥션 풀 사이의 연결 경로를 찾아줘.
```

어시스턴트는 내부적으로 다음과 같은 명령을 호출해 답한다.

```
graphify query "rate limiter가 연결된 모듈"
graphify path "AuthMiddleware" "DatabasePool"
```

## 4단계: 터미널에서 직접 질의해 보기

어시스턴트 없이 CLI만으로도 같은 그래프를 조회할 수 있다.

```
graphify explain "RateLimiter"
```

결과에는 소스 위치, 속한 커뮤니티, 연결된 노드 목록과 각 연결이 `EXTRACTED`(소스에 명시)인지 `INFERRED`(추론)인지가 함께 표시된다.

```
graphify query "이 프로젝트에서 가장 많이 참조되는 설정 파일은?"
```

## 5단계: 팀원과 동기화하기

다른 사람이 만든 변경을 받아온 뒤에는 그래프도 함께 갱신한다.

```
git pull
graphify update .
```

두 명령을 매번 따로 치는 대신, GUIDE.md 7단계에서 만든 alias를 쓰면 한 번에 끝난다.

```
git gpull
```

## 체크리스트
[ ] 코드 변경을 커밋해 post-commit 훅이 그래프를 재빌드하는지 확인한다.
[ ] Claude Code(또는 사용 중인 어시스턴트)에서 자연어 질문으로 그래프 질의가 자동으로 호출되는지 확인한다.
[ ] `graphify explain`/`graphify path`를 터미널에서 직접 실행해 결과를 확인한다.
[ ] `git pull` 이후 `graphify update .`(또는 alias)로 동기화한다.
