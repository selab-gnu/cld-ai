# 개념

React는 사용자 인터페이스(UI)를 만들기 위한 자바스크립트 라이브러리입니다. 화면을 작은 "컴포넌트" 단위로 나누어 만들고, 이 컴포넌트들을 조립해서 전체 화면을 구성합니다.

이 튜토리얼에서는 버튼을 누르면 숫자가 올라가는 아주 간단한 **카운터(Counter) 앱**을 만들면서 React의 핵심 개념을 하나씩 익힙니다.

- **컴포넌트(Component)**: 화면의 한 조각을 만드는 함수
- **JSX**: 자바스크립트 안에서 HTML처럼 생긴 문법을 쓰는 방식
- **State(상태)**: 컴포넌트가 기억하고 있다가 바뀌면 화면을 다시 그리게 만드는 값
- **이벤트 핸들러**: 클릭 같은 사용자 동작에 반응하는 함수


# 1 단계: 개발 환경 준비하기

- 다음 명령어로 생성된 React 프로젝트 폴더를 준비한다.
  ```bash
  npm create vite@latest my-counter-app -- --template react
  cd my-counter-app
  npm install
  ```

## 규칙
- Node.js(18 버전 이상 권장)가 컴퓨터에 설치되어 있어야 합니다.
- 터미널(명령 프롬프트)에서 `node -v`, `npm -v` 명령어로 설치 여부를 먼저 확인합니다.
- Vite를 이용해 새 React 프로젝트를 생성합니다. (Create React App보다 빠르고 설정이 간단합니다.)
- 프로젝트 이름은 영어 소문자와 하이픈만 사용합니다. (예: `my-counter-app`)

## 산출물
- `my-counter-app` 폴더와 그 안의 기본 파일들 (`src/App.jsx`, `src/main.jsx` 등)

## 체크리스트
- [ ] Node.js와 npm이 정상적으로 설치되어 있는지 확인한다.
- [ ] `npm create vite@latest` 명령으로 프로젝트를 생성한다.
- [ ] `npm install`로 필요한 패키지를 설치한다.


# 2 단계: 첫 번째 컴포넌트 만들기

- `src/Counter.jsx` 파일을 새로 생성
  ```jsx
  function Counter() {
    return (
      <div>
        <p>현재 숫자: 0</p>
        <button>+1 증가</button>
      </div>
    );
  }

  export default Counter;
  ```
- `App.jsx`에서 `Counter` 컴포넌트를 불러와 화면에 표시
  ```jsx
  import Counter from './Counter';

  function App() {
    return (
      <div>
        <h1>나의 첫 React 앱</h1>
        <Counter />
      </div>
    );
  }

  export default App;
  ```

## 규칙
- 실제로 코드를 작성할 폴더는 `src` 폴더이며, `src/App.jsx`가 우리가 직접 수정할 메인 컴포넌트입니다. (`src/main.jsx`는 시작점 역할만 하므로 수정하지 않습니다.)
- 컴포넌트는 첫 글자가 대문자인 함수로 만들고, 화면에 그릴 내용을 `return` 문으로 반환합니다.
- JSX에서는 태그가 하나의 최상위 요소로 감싸져 있어야 합니다. (예: `<div>...</div>` 하나로 전체를 감싸기)
- JSX 안에서 자바스크립트 값을 쓰고 싶으면 중괄호 `{ }`를 사용합니다.

## 체크리스트
- [ ] `App.jsx`의 기본 코드를 정리하고 `main.jsx`와의 역할 차이를 이해한다.
- [ ] `Counter.jsx` 파일을 새로 만들고 JSX로 숫자와 버튼을 표시한다.
- [ ] `App.jsx`에서 `Counter` 컴포넌트를 불러와 사용한다.


# 3 단계: State(상태)로 값 기억하기

## 규칙
- 화면이 바뀌어야 하는 값은 일반 변수가 아니라 `useState`로 관리해야 합니다.
- `useState`는 React에서 `import { useState } from 'react'`로 가져와 사용합니다.
- `useState(초깃값)`은 `[현재값, 값을바꾸는함수]` 형태의 배열을 돌려줍니다.
- 값을 직접 바꾸지 말고 반드시 `set` 함수를 통해서만 바꿉니다. (예: `count = count + 1`은 금지, `setCount(count + 1)`은 허용)

## 산출물
- `useState`를 적용한 `Counter.jsx`
  ```jsx
  import { useState } from 'react';

  function Counter() {
    const [count, setCount] = useState(0);

    return (
      <div>
        <p>현재 숫자: {count}</p>
        <button>+1 증가</button>
      </div>
    );
  }

  export default Counter;
  ```

## 체크리스트
- [ ] `useState`를 `import` 한다.
- [ ] `count`라는 상태 변수와 `setCount` 함수를 만든다.
- [ ] 화면에 `{count}`로 현재 값을 표시한다.


# 4 단계: 이벤트로 기능 추가하기

## 규칙
- 버튼 클릭 같은 이벤트는 `onClick` 속성에 함수를 연결해서 처리합니다.
- `onClick={handleClick}`처럼 함수 이름만 전달하고, `onClick={handleClick()}`처럼 바로 실행하면 안 됩니다.
- 기능을 하나 더 추가할 때도 새로운 `handle` 함수를 만들어 역할을 분리합니다. (예: 증가는 `handleClick`, 초기화는 `handleReset`)
- 숫자가 특정 조건을 만족할 때 다른 문구를 보여주고 싶다면, JSX 안에서 삼항 연산자(`조건 ? A : B`)를 사용합니다.

## 산출물
- 클릭·초기화·조건부 문구가 모두 추가된 `Counter.jsx`
  ```jsx
  import { useState } from 'react';

  function Counter() {
    const [count, setCount] = useState(0);

    function handleClick() {
      setCount(count + 1);
    }

    function handleReset() {
      setCount(0);
    }

    return (
      <div>
        <p>현재 숫자: {count}</p>
        <p>{count >= 5 ? '5 이상이 되었습니다!' : '5까지 눌러보세요.'}</p>
        <button onClick={handleClick}>+1 증가</button>
        <button onClick={handleReset}>초기화</button>
      </div>
    );
  }

  export default Counter;
  ```

## 체크리스트
- [ ] `handleClick` 함수를 만들어 버튼의 `onClick`에 연결한다.
- [ ] `handleReset` 함수를 추가해 초기화 버튼을 만든다.
- [ ] 삼항 연산자로 조건에 따라 다른 문구가 보이도록 만든다.

# 5 단계: 스타일 적용하고 최종 확인하기

## 규칙
- 간단한 스타일은 `className`을 사용해 CSS 파일과 연결하거나, `style={{ }}` 형태의 인라인 스타일을 사용합니다.
- 인라인 스타일은 자바스크립트 객체이므로 속성 이름을 카멜케이스(예: `fontSize`)로 씁니다.
- 스타일은 기능이 정상 동작하는 것을 확인한 뒤 마지막에 다듬습니다.

## 산출물
- 스타일이 적용된 최종 `Counter.jsx`
  ```jsx
  import { useState } from 'react';

  function Counter() {
    const [count, setCount] = useState(0);

    function handleClick() {
      setCount(count + 1);
    }

    function handleReset() {
      setCount(0);
    }

    return (
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <p style={{ fontSize: '24px' }}>현재 숫자: {count}</p>
        <p>{count >= 5 ? '5 이상이 되었습니다!' : '5까지 눌러보세요.'}</p>
        <button onClick={handleClick} style={{ marginRight: '8px' }}>
          +1 증가
        </button>
        <button onClick={handleReset}>초기화</button>
      </div>
    );
  }

  export default Counter;
  ```

## 체크리스트
- [ ] 인라인 스타일 또는 CSS 클래스를 적용해 화면을 보기 좋게 다듬는다.
- [ ] 최종 코드에 문법 오류가 없는지 살펴본다.
- [ ] 다음 단계(실행 및 확인)로 넘어갈 준비를 한다.
