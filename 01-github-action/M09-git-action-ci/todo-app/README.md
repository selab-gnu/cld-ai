# 할 일 목록 (my-todo-ci)

브라우저에서 동작하는 할 일 관리 앱이다. 순수 HTML/CSS/JavaScript(ES 모듈)로 만들었고, 데이터는 브라우저 localStorage 에 저장한다. npm 의존성이 없다.

## 실행

```bash
python3 -m http.server 8000
```

브라우저에서 http://localhost:8000 을 연다. (`index.html` 을 더블클릭해 `file://` 로 열면 동작하지 않는다)

## 테스트

```bash
node --test
```

## 파일

| 파일 | 역할 |
| --- | --- |
| `index.html` | 화면 |
| `src/todo.js` | 할 일 추가·완료·삭제·필터 순수 함수 (테스트 대상) |
| `src/storage.js` | localStorage 저장·불러오기 |
| `src/app.js` | 화면 그리기와 이벤트 |
| `src/style.css` | 스타일 |
| `tests/todo.test.js` | `node:test` 단위 테스트 |
