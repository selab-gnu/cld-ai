# Node.js 기본 튜토리얼

이 문서는 Node.js를 처음 접하는 사람을 위한 7단계 학습 가이드입니다. 각 단계는 **규칙**(꼭 지켜야 할 원칙), **산출물**(단계를 마치면 손에 남아야 할 결과물), **체크리스트**(다음 단계로 넘어가기 전 확인 사항)로 구성되어 있습니다.

# 1 단계: Node.js란 무엇인가

## 규칙
- Node.js는 브라우저 밖에서 자바스크립트를 실행할 수 있게 해주는 런타임임을 이해한다.
- Chrome V8 엔진 기반이며, 이벤트 기반 · 논블로킹 I/O 모델을 사용한다는 점을 기억한다.
- "Node.js = 언어"가 아니라 "Node.js = 자바스크립트 실행 환경"이라는 점을 혼동하지 않는다.

## 산출물
- Node.js가 무엇이고 왜 쓰이는지 한두 문장으로 설명할 수 있는 상태.
- 브라우저 자바스크립트와 Node.js 자바스크립트의 차이점 목록.

## 체크리스트
[ ] Node.js와 브라우저 JS의 차이를 설명할 수 있다.
[ ] 이벤트 루프라는 개념을 들어본 적이 있다.
[ ] 왜 서버 개발에 Node.js가 쓰이는지 이해했다.


# 2 단계: 설치 및 개발 환경 준비

## 규칙
- 공식 사이트(nodejs.org)의 LTS(장기 지원) 버전을 설치한다.
- 설치 후 반드시 터미널에서 버전을 확인해 정상 설치를 검증한다.
- 코드 편집기(VS Code 등)를 함께 준비한다.

## 산출물
```bash
node -v
npm -v
```
- 위 두 명령어가 정상적으로 버전을 출력하는 터미널 화면.
- 작업용 폴더(예: `node-tutorial/`) 생성 완료.

## 체크리스트
[ ] `node -v` 명령이 버전을 출력한다.
[ ] `npm -v` 명령이 버전을 출력한다.
[ ] 코드를 작성할 편집기가 준비되어 있다.


# 3 단계: 첫 번째 프로그램 실행 (Hello World)

## 규칙
- `.js` 확장자 파일에 코드를 작성한다.
- `node 파일명.js` 명령으로 실행한다.
- `console.log()`로 출력 결과를 눈으로 확인하는 습관을 들인다.

## 산출물
`hello.js`
```javascript
console.log("Hello, Node.js!");
```
실행 결과:
```bash
$ node hello.js
Hello, Node.js!
```

## 체크리스트
[ ] `hello.js` 파일을 직접 작성했다.
[ ] 터미널에서 `node hello.js`로 실행해 결과를 확인했다.
[ ] 출력 문자열을 바꿔서 다시 실행해봤다.


# 4 단계: 모듈 시스템 이해하기 (require / module.exports)

## 규칙
- Node.js는 파일 단위로 코드를 나누는 모듈 시스템을 기본 제공한다.
- 다른 파일의 기능을 쓰려면 `require()`로 불러오고, 공개하려면 `module.exports`로 내보낸다.
- 내장 모듈(`fs`, `path`, `os` 등)과 직접 만든 모듈을 구분해서 이해한다.

## 산출물
`math.js`
```javascript
function add(a, b) {
  return a + b;
}
module.exports = { add };
```
`app.js`
```javascript
const math = require("./math");
console.log(math.add(2, 3)); // 5
```

## 체크리스트
[ ] 직접 모듈 파일을 만들고 `module.exports`로 내보냈다.
[ ] 다른 파일에서 `require()`로 불러와 실행했다.
[ ] 내장 모듈(`os` 등)을 한 번 이상 사용해봤다.


# 5 단계: npm과 패키지 관리

## 규칙
- `npm init`으로 프로젝트를 초기화하고 `package.json`을 생성한다.
- 외부 패키지는 `npm install 패키지명`으로 설치하며, `node_modules`는 직접 수정하지 않는다.
- `package.json`의 `dependencies`와 `scripts` 항목의 역할을 이해한다.

## 산출물
```bash
npm init -y
npm install chalk
```
`app.js`
```javascript
const chalk = require("chalk");
console.log(chalk.green("설치 성공!"));
```
- 생성된 `package.json`, `package-lock.json`, `node_modules/`.

## 체크리스트
[ ] `npm init`으로 `package.json`을 생성했다.
[ ] 외부 패키지를 하나 이상 설치하고 사용했다.
[ ] `package.json`에 설치한 패키지가 기록된 것을 확인했다.


# 6 단계: 간단한 웹 서버 만들기 (http 모듈)

## 규칙
- 내장 `http` 모듈만으로도 서버를 만들 수 있다는 점을 이해한다.
- 서버는 포트를 지정해 `listen()`으로 실행한다.
- 요청(`req`)과 응답(`res`) 객체의 기본 역할을 구분한다.

## 산출물
`server.js`
```javascript
const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Hello, 서버입니다!");
});

server.listen(3000, () => {
  console.log("서버 실행 중: http://localhost:3000");
});
```
- 브라우저에서 `http://localhost:3000` 접속 시 응답 확인.

## 체크리스트
[ ] `node server.js`로 서버를 실행했다.
[ ] 브라우저 또는 curl로 응답을 확인했다.
[ ] 포트 번호를 바꿔서 다시 실행해봤다.


# 7 단계: 비동기 처리 이해하기 (콜백 / Promise / async-await)

## 규칙
- Node.js는 논블로킹 방식이므로 시간이 걸리는 작업(파일 읽기, 네트워크 요청 등)은 비동기로 처리된다.
- 콜백 → Promise → async/await 순으로 발전해온 문법적 배경을 이해한다.
- 에러 처리는 `try/catch`(async-await) 또는 `.catch()`(Promise)로 반드시 챙긴다.

## 산출물
```javascript
const fs = require("fs/promises");

async function readFile() {
  try {
    const data = await fs.readFile("hello.js", "utf-8");
    console.log(data);
  } catch (err) {
    console.error("에러 발생:", err.message);
  }
}

readFile();
```

## 체크리스트
[ ] 콜백 방식과 async/await 방식의 차이를 설명할 수 있다.
[ ] `fs/promises`처럼 Promise 기반 API를 사용해봤다.
[ ] `try/catch`로 에러 처리를 직접 구현했다.


---

## 참고: 예제 실행 흐름 (SAMPLE.md 형식 참고)

## 1단계: 실습 폴더 및 파일 준비
- `node-tutorial/` 폴더 생성 후 각 단계별 `.js` 파일 작성.

## 2단계: 터미널에서 Node.js 실행
- `node 파일명.js` 형태로 각 단계 코드를 순서대로 실행.

## 3단계: 결과 확인 및 자유 실습
- 콘솔 출력, 브라우저 응답 등을 직접 확인하고 코드를 변형해보며 익힌다.
