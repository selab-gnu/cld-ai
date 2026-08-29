# 예제 실행 및 프롬프트

## 1단계: 커밋할 변경 만들기

GUIDE.md의 1~5단계를 따라 `my-vite-app` 프로젝트를 생성하고, `main.js`에 화면 표시 코드를 작성합니다.

변경이 끝나면 아래처럼 Git으로 기록해 둡니다.
```bash
git init
git add .
git commit -m "Vite 기본 튜토리얼 완성"
```

## 2단계: 개발 서버 실행

터미널에서 프로젝트 폴더로 이동한 뒤 개발 서버를 실행합니다.
```bash
cd my-vite-app
npm run dev
```

터미널에 아래와 비슷한 로컬 주소가 표시됩니다.
```
Local:   http://localhost:5173/
```

## 3단계: 브라우저에서 결과 확인 및 빌드 테스트

브라우저에서 `http://localhost:5173/` 주소로 접속해 "Hello Vite!" 문구가 보이는지 확인합니다.

- `main.js`의 글자를 다른 내용으로 바꾸고 저장해, 새로고침 없이 즉시 반영되는지(HMR) 확인합니다.
- 확인이 끝나면 아래 명령으로 배포용 빌드를 만들고 미리보기 합니다.
  ```bash
  npm run build
  npm run preview
  ```

정상적으로 동작하면 튜토리얼이 완료된 것입니다. Vite의 역할(개발 서버, HMR, 빌드)이 익숙해졌다면, 이제 GUIDE.md의 React 튜토리얼로 넘어가 실제 컴포넌트 기반 개발을 시작해보세요.
