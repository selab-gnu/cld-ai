# 개념

Vite(비트, 프랑스어로 "빠르다")는 프론트엔드 프로젝트를 개발할 때 쓰는 **빌드 도구(build tool)**입니다. 코드를 작성하는 동안 실시간으로 확인할 수 있는 개발 서버를 켜주고, 완성된 코드를 배포용 파일로 묶어주는 역할을 합니다.

이 튜토리얼에서는 React 같은 프레임워크 없이, 순수 자바스크립트(Vanilla JS) 프로젝트로 Vite 자체가 무엇을 해주는지 직접 체험해봅니다.

- **개발 서버(Dev Server)**: 코드를 브라우저에서 바로 확인할 수 있게 켜주는 로컬 서버
- **HMR(Hot Module Replacement)**: 코드를 수정하면 새로고침 없이 변경 사항만 즉시 반영해주는 기능
- **번들링(Bundling)**: 배포할 때 여러 파일을 최적화된 형태로 묶어주는 작업
- **설정 파일(vite.config.js)**: Vite의 동작 방식을 커스터마이징하는 파일


# 1 단계: 개발 환경 준비하기

## 규칙
- Node.js(18 버전 이상 권장)가 설치되어 있어야 합니다.
- 터미널에서 `node -v`, `npm -v` 명령어로 설치 여부를 먼저 확인합니다.
- 프로젝트 이름은 영어 소문자와 하이픈만 사용합니다. (예: `my-vite-app`)

## 산출물
- Node.js와 npm이 설치되어 명령어가 정상 동작하는 상태
  ```bash
  node -v
  npm -v
  ```

## 체크리스트
- [ ] `node -v` 명령으로 Node.js 버전을 확인한다.
- [ ] `npm -v` 명령으로 npm 버전을 확인한다.


# 2 단계: Vite 프로젝트 생성하기

## 규칙
- `npm create vite@latest` 명령으로 새 프로젝트를 만듭니다.
- 템플릿 선택 시 React가 아닌 **Vanilla(순수 자바스크립트)**를 선택합니다. (Vite 자체 동작에만 집중하기 위해서입니다.)
- 프로젝트 생성 후에는 반드시 `npm install`로 필요한 패키지를 설치해야 실행할 수 있습니다.

## 산출물
- 다음 명령어로 생성된 Vite 프로젝트 폴더
  ```bash
  npm create vite@latest my-vite-app -- --template vanilla
  cd my-vite-app
  npm install
  ```
- `my-vite-app` 폴더와 그 안의 기본 파일들 (`index.html`, `main.js`, `style.css`, `vite.config.js` 등)

## 체크리스트
- [ ] `npm create vite@latest` 명령으로 vanilla 템플릿 프로젝트를 생성한다.
- [ ] `cd`로 프로젝트 폴더에 들어간다.
- [ ] `npm install`로 패키지를 설치한다.


# 3 단계: 프로젝트 구조 살펴보기

## 규칙
- `index.html`이 브라우저가 가장 먼저 읽는 진입점입니다. 이 파일 안에서 `main.js`를 불러옵니다.
- `main.js`가 실제 자바스크립트 코드를 작성하는 파일입니다.
- `package.json`에는 `npm run dev`, `npm run build` 같은 명령어(스크립트)가 정의되어 있습니다.
- Vite는 별도의 복잡한 설정 없이도 이 구조만으로 바로 실행됩니다.

## 산출물
- 각 파일의 역할을 파악한 상태
  - `index.html`: 화면의 뼈대, `<script type="module" src="/main.js">`로 자바스크립트 연결
  - `main.js`: 실행되는 자바스크립트 코드
  - `style.css`: 화면 스타일
  - `package.json`: 프로젝트 정보와 실행 명령어 목록

## 체크리스트
[ ] `index.html`을 열어 `main.js`가 어떻게 연결되어 있는지 확인한다.
[ ] `main.js` 파일의 내용을 살펴본다.
[ ] `package.json`의 `scripts` 항목에서 `dev`, `build` 명령어를 확인한다.


# 4 단계: 개발 서버 실행하고 HMR 체험하기

## 규칙
- `npm run dev` 명령으로 개발 서버를 켭니다.
- 터미널에 표시되는 로컬 주소(예: `http://localhost:5173`)로 브라우저에서 접속합니다.
- 서버가 켜진 상태에서 `main.js`나 `style.css`를 수정하고 저장하면, 브라우저를 새로고침하지 않아도 변경 사항이 바로 반영되는지 확인합니다. 이것이 HMR입니다.

## 산출물
- 개발 서버가 실행된 상태
  ```bash
  npm run dev
  ```
- `main.js`에 아래 코드를 추가해 화면에 글자를 표시
  ```javascript
  document.querySelector('#app').innerHTML = `
    <h1>Hello Vite!</h1>
  `;
  ```
- 코드를 수정할 때마다 브라우저가 즉시 바뀌는 것을 확인

## 체크리스트
[ ] `npm run dev`로 개발 서버를 실행한다.
[ ] 브라우저에서 로컬 주소로 접속해 화면을 확인한다.
[ ] `main.js`의 글자를 수정하고 저장해서 새로고침 없이 반영되는지(HMR) 확인한다.


# 5 단계: 빌드하고 결과물 확인하기

## 규칙
- 실제 서비스에 배포할 때는 `npm run build` 명령으로 최적화된 파일을 만듭니다.
- 빌드 결과물은 기본적으로 `dist` 폴더에 생성됩니다.
- `npm run preview` 명령으로 빌드된 결과물을 로컬에서 미리 확인할 수 있습니다.
- 개발 중에는 `dev`, 배포 전에는 `build`, 배포 파일 확인은 `preview`라는 역할 구분을 기억합니다.

## 산출물
- 빌드 명령 실행 결과
  ```bash
  npm run build
  ```
- 생성된 `dist` 폴더 (압축되고 최적화된 HTML/CSS/JS 파일들)
- 빌드 결과 미리보기
  ```bash
  npm run preview
  ```

## 체크리스트
[ ] `npm run build`로 프로젝트를 빌드한다.
[ ] `dist` 폴더가 생성되었는지 확인한다.
[ ] `npm run preview`로 빌드 결과를 브라우저에서 확인한다.
