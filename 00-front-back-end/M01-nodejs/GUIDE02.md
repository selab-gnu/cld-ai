# 개념: 비동기 처리 이해하기 (콜백 / Promise / async-await)

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
- [ ] 콜백 방식과 async/await 방식의 차이를 설명할 수 있다.
- [ ] `fs/promises`처럼 Promise 기반 API를 사용해봤다.
- [ ] `try/catch`로 에러 처리를 직접 구현했다.

이 단계는 내용이 많아서, 아래처럼 아주 작은 단위로 나눠서 하나씩 직접 실행해보며 따라갑니다. 각 스텝마다 파일을 만들고 `node 파일명.js`로 실행해서 눈으로 결과를 확인하세요.

---

# 1. 동기(synchronous) vs 비동기(asynchronous) 감 잡기

먼저 "동기"가 뭔지부터 봅니다. 동기 코드는 위에서 아래로, 한 줄이 끝나야 다음 줄이 실행됩니다.

`sync-example.js`
```javascript
console.log("1번");
console.log("2번");
console.log("3번");
```
순서 그대로 출력됩니다. 당연해 보이지만, 이게 "동기"입니다.

이제 비동기를 봅니다. Node.js에는 `setTimeout`이라는, "일정 시간 후에 실행해줘"라고 예약하는 내장 함수가 있습니다.

`async-example.js`
```javascript
console.log("1번");

setTimeout(() => {
  console.log("2번 (1초 후 실행됨)");
}, 1000);

console.log("3번");
```
## 규칙
코드는 1번 → 2번 → 3번 순서로 "적혀" 있지만, 실행 결과는 1번 → 3번 → 2번입니다. `setTimeout`이 "나는 1초 뒤에 실행할 테니, 너(Node.js)는 기다리지 말고 다음 줄(3번)을 먼저 실행해"라고 동작하기 때문입니다. 이게 비동기의 핵심입니다: **시간이 걸리는 작업은 뒤로 미뤄두고, 그 사이에 다른 코드를 먼저 실행한다.**

## 산출물

실행:
```bash
$ node sync-example.js
1번
2번
3번
```

실행:
```bash
$ node async-example.js
1번
3번
2번 (1초 후 실행됨)
```

## 체크포인트
- [ ] `sync-example.js`를 실행해서 순서대로 출력되는 것을 확인했다.
- [ ] `async-example.js`를 실행해서 순서가 바뀌는 것을 직접 확인했다.
- [ ] 왜 "3번"이 "2번"보다 먼저 출력되는지 스스로 설명할 수 있다.

---

# 2. 콜백(callback) 함수란?

방금 본 `setTimeout`의 화살표 함수 `() => { ... }`처럼, **"나중에 실행해달라고 다른 함수에게 넘겨주는 함수"**를 콜백 함수라고 부릅니다.

파일을 읽는 실제 예제로 연습해봅니다. 먼저 읽을 파일을 하나 만듭니다.

`greeting.txt`
```
안녕하세요, Node.js!
```

콜백 방식으로 파일을 읽는 코드:

`callback-read.js`
```javascript
const fs = require("fs");

console.log("파일 읽기 시작");

fs.readFile("greeting.txt", "utf-8", (err, data) => {
  if (err) {
    console.error("에러 발생:", err.message);
    return;
  }
  console.log("파일 내용:", data);
});

console.log("파일 읽기 요청을 보냄 (아직 안 끝남)");
```

여기서 `(err, data) => { ... }` 부분이 콜백 함수입니다. `fs.readFile`은 "파일을 다 읽으면 이 함수를 실행해줘"라는 뜻으로 콜백을 넘겨받습니다. 그래서 파일을 다 읽기 전에 마지막 `console.log`가 먼저 출력됩니다.

## 규칙
콜백 함수의 첫 번째 인자는 관례적으로 항상 `err`(에러)입니다. 에러가 없으면 `null`이 들어옵니다.

## 산출물
실행:
```bash
$ node callback-read.js
파일 읽기 시작
파일 읽기 요청을 보냄 (아직 안 끝남)
파일 내용: 안녕하세요, Node.js!
```

## 체크포인트
- [ ] `greeting.txt` 파일을 직접 만들었다.
- [ ] `callback-read.js`를 실행해서 출력 순서를 확인했다.
- [ ] 존재하지 않는 파일 이름(예: `"없는파일.txt"`)으로 바꿔서 실행해보고, `err` 콜백이 실행되는 것을 확인했다.

---

# 3. 콜백의 단점: 콜백 지옥(callback hell)

콜백을 여러 번 중첩해서 쓰면 코드가 오른쪽으로 계속 밀려나며 읽기 어려워집니다. 직접 겪어봅니다.

`callback-hell.js`
```javascript
const fs = require("fs");

fs.readFile("greeting.txt", "utf-8", (err, data1) => {
  if (err) return console.error(err.message);
  console.log("1차 읽기:", data1);

  fs.readFile("greeting.txt", "utf-8", (err, data2) => {
    if (err) return console.error(err.message);
    console.log("2차 읽기:", data2);

    fs.readFile("greeting.txt", "utf-8", (err, data3) => {
      if (err) return console.error(err.message);
      console.log("3차 읽기:", data3);
      console.log("모든 읽기 완료!");
    });
  });
});
```

실행해보면 결과는 잘 나오지만, 코드 모양이 계단처럼 점점 오른쪽으로 밀려나는 걸 볼 수 있습니다. 이 문제를 해결하기 위해 나온 것이 **Promise**입니다.

## 산출물
실행:
```bash
$ node callback-hell.js
1차 읽기: 안녕하세요, Node.js!

2차 읽기: 안녕하세요, Node.js!

3차 읽기: 안녕하세요, Node.js!

모든 읽기 완료!
```

## 체크포인트
- [ ] `callback-hell.js`를 실행해서 결과를 확인했다.
- [ ] 콜백이 중첩될수록 코드가 어떻게 변하는지(들여쓰기가 깊어지는 것) 직접 눈으로 봤다.

---

# 4. Promise로 바꿔보기

Node.js의 `fs` 모듈은 Promise 버전도 제공합니다. `require("fs")` 대신 `require("fs/promises")`를 씁니다.

`promise-read.js`
```javascript
const fs = require("fs/promises");

console.log("파일 읽기 시작");

fs.readFile("greeting.txt", "utf-8")
  .then((data) => {
    console.log("파일 내용:", data);
  })
  .catch((err) => {
    console.error("에러 발생:", err.message);
  });

console.log("파일 읽기 요청을 보냄 (아직 안 끝남)");
```

실행 결과는 콜백 버전과 순서가 같습니다(파일 읽기 시작 → 요청을 보냄 → 파일 내용). 달라진 건 문법입니다:
- 콜백을 직접 넘기는 대신, `fs.readFile(...)`이 **Promise 객체**를 반환합니다.
- 성공하면 `.then(콜백)`이 실행되고, 실패하면 `.catch(콜백)`이 실행됩니다.

이제 7-3의 콜백 지옥을 Promise의 `.then()` 체이닝으로 바꿔봅니다.

`promise-chain.js`
```javascript
const fs = require("fs/promises");

fs.readFile("greeting.txt", "utf-8")
  .then((data1) => {
    console.log("1차 읽기:", data1);
    return fs.readFile("greeting.txt", "utf-8");
  })
  .then((data2) => {
    console.log("2차 읽기:", data2);
    return fs.readFile("greeting.txt", "utf-8");
  })
  .then((data3) => {
    console.log("3차 읽기:", data3);
    console.log("모든 읽기 완료!");
  })
  .catch((err) => {
    console.error("에러 발생:", err.message);
  });
```

계단 모양 중첩이 사라지고, `.then()`이 옆으로 나란히 이어지는 형태가 된 것을 확인하세요. 에러 처리도 `.catch()` 하나로 모든 단계를 한 번에 잡아줍니다.

## 산출물
실행:
```bash
$ node promise-read.js
파일 읽기 시작
파일 읽기 요청을 보냄 (아직 안 끝남)
파일 내용: 안녕하세요, Node.js!
```

## 체크포인트
- [ ] `promise-read.js`를 실행해서 콜백 버전과 결과가 같은지 확인했다.
- [ ] `promise-chain.js`를 실행해서 콜백 지옥 코드와 비교했을 때 어떤 점이 더 읽기 쉬운지 느껴봤다.
- [ ] 일부러 파일명을 틀리게 써서 `.catch()`가 실행되는 것을 확인했다.

---

# 5. async/await로 더 깔끔하게

`async/await`는 Promise를 "동기 코드처럼 보이게" 써주는 문법입니다. 실제 동작 방식은 Promise와 동일하고, 문법만 더 읽기 쉽게 바뀝니다.

규칙은 두 가지만 기억하면 됩니다:
1. `await`를 쓰려면 그 함수 앞에 반드시 `async` 키워드를 붙인다.
2. `await`는 Promise가 끝날 때까지 "그 줄에서" 기다렸다가 결과값을 받아온다.

7-4의 `promise-read.js`를 async/await로 바꿔봅니다.

`await-read.js`
```javascript
const fs = require("fs/promises");

async function readGreeting() {
  console.log("파일 읽기 시작");
  const data = await fs.readFile("greeting.txt", "utf-8");
  console.log("파일 내용:", data);
}

readGreeting();
console.log("이 줄은 readGreeting 실행과 상관없이 먼저 찍힐 수도 있음");
```

`.then()`, `.catch()`가 사라지고 마치 동기 코드처럼 위에서 아래로 읽히는 것을 확인하세요.

이제 여러 번 읽는 7-4의 체이닝 버전도 바꿔봅니다.

`await-chain.js`
```javascript
const fs = require("fs/promises");

async function readThreeTimes() {
  const data1 = await fs.readFile("greeting.txt", "utf-8");
  console.log("1차 읽기:", data1);

  const data2 = await fs.readFile("greeting.txt", "utf-8");
  console.log("2차 읽기:", data2);

  const data3 = await fs.readFile("greeting.txt", "utf-8");
  console.log("3차 읽기:", data3);

  console.log("모든 읽기 완료!");
}

readThreeTimes();
```

`.then()`을 세 번 이어 쓰던 코드가, `await`을 세 줄 나열하는 것으로 훨씬 단순해졌습니다.

## 체크포인트
- [ ] `await-read.js`를 실행해서 결과를 확인했다.
- [ ] `await-chain.js`를 실행해서 `promise-chain.js`와 결과가 같은지 비교했다.
- [ ] `async` 키워드 없이 함수 안에서 `await`만 써보고 에러가 나는 것을 직접 확인했다. (문법 오류가 나야 정상입니다)

---

## 6. try/catch로 에러 처리하기

async/await에서는 `.catch()` 대신 자바스크립트의 기본 에러 처리 문법인 `try/catch`를 씁니다.

`try-catch-read.js`
```javascript
const fs = require("fs/promises");

async function readFileSafely() {
  try {
    const data = await fs.readFile("greeting.txt", "utf-8");
    console.log("파일 내용:", data);
  } catch (err) {
    console.error("에러 발생:", err.message);
  }
}

readFileSafely();
```

동작 방식:
- `try` 블록 안에서 `await`한 작업이 성공하면 `catch`는 실행되지 않고 그냥 지나갑니다.
- 실패하면(예: 파일이 없으면) 즉시 `catch` 블록으로 넘어가 `err`를 받습니다.

일부러 에러를 내서 확인해봅니다. `"greeting.txt"`를 `"없는파일.txt"`로 바꿔서 실행하면:
```bash
$ node try-catch-read.js
에러 발생: ENOENT: no such file or directory, open '없는파일.txt'
```
프로그램이 멈추지 않고 에러 메시지만 출력되는 것을 확인하세요. `try/catch`가 없었다면 프로그램이 그대로 죽어버립니다(uncaught exception).

## 체크포인트
- [ ] 정상적인 파일명으로 실행해서 `try` 블록이 성공하는 경우를 확인했다.
- [ ] 존재하지 않는 파일명으로 바꿔서 `catch` 블록이 실행되는 경우를 확인했다.
- [ ] `try/catch`를 완전히 지우고 실행했을 때 프로그램이 에러와 함께 멈추는 것을 비교해봤다.

---

# 7. 최종 산출물: 처음 목표 코드 완성하기

지금까지 만든 개념을 합치면, 원래 목표였던 아래 코드를 스스로 이해한 상태로 도달하게 됩니다.

`readFile-final.js`
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

(3단계에서 만든 `hello.js` 파일이 같은 폴더에 있어야 합니다. 없다면 아무 텍스트 파일이나 만들어서 파일명을 맞춰주세요.)

이 코드를 다시 읽으면 이제 다음이 다 눈에 들어와야 합니다:
- `async function`이 붙어 있으니 내부에서 `await`을 쓸 수 있다.
- `fs.readFile(...)`은 Promise를 반환하고, `await`이 그 결과가 나올 때까지 기다린다.
- 파일 읽기가 실패하면 `try` 블록을 벗어나 `catch (err)`로 넘어간다.

## 최종 체크리스트
- [ ] 콜백 방식(`callback-read.js`)과 async/await 방식(`await-read.js`)의 차이를 내 말로 설명할 수 있다.
- [ ] `fs/promises`처럼 Promise 기반 API를 직접 실행해봤다.
- [ ] `try/catch`로 에러 처리를 직접 구현하고, 에러가 나는 경우와 안 나는 경우를 모두 실행해봤다.
- [ ] 콜백 지옥(`callback-hell.js`) → Promise 체이닝(`promise-chain.js`) → async/await(`await-chain.js`) 세 코드를 나란히 비교해서 어떻게 발전했는지 이해했다.

