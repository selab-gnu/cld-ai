# 개념

Firebase는 구글이 제공하는 백엔드 서비스 모음이다. 그중 Cloud Firestore는 서버를 직접 만들지 않아도 웹사이트에서 바로 데이터를 저장하고 불러올 수 있는 데이터베이스다. Firestore는 데이터를 "컬렉션(collection) 안의 문서(document)" 형태로 저장한다. 이 가이드에서는 "할 일 목록(todos)" 예제를 통해 Firebase의 가장 기본적인 사용법을 익힌다.

# 1 단계: Firebase 프로젝트 만들기
- https://console.firebase.google.com 접속 → 구글 계정으로 로그인
- "프로젝트 추가"(Add project) 클릭 : "Get Started by setting up a Firebse project" 버튼이 보이면 이를 누르면 됨. 
- 프로젝트 이름(예: my-todo-app) 입력 후 "Continue" 버튼 클릭

## 규칙
- Google Analytics는 이 예제에서는 필요 없으므로 꺼도 된다
- "프로젝트 만들기" 클릭 후 생성이 끝날 때까지 기다린다

## 산출물
- 생성된 Firebase 프로젝트

## 체크리스트
- [ ] Firebase 콘솔 화면에 내 프로젝트 대시보드가 보인다.
- [ ] 프로젝트 이름을 메모장에 저장했다.

# 2 단계: Cloud Firestore 데이터베이스 만들기
- 왼쪽 메뉴에서 "Databases & Storage" → "Firestore" 클릭
- "데이터베이스 만들기"(Create database) 클릭
- 위치(Location)는 가까운 지역으로 선택 (예: asia-northeast3, 서울)
- 보안 규칙은 우선 "테스트 모드로 시작"(Start in test mode)을 선택한다
- "Create" 클릭

## 규칙
— 테스트 모드는 일정 기간 동안 모두에게 읽기/쓰기를 허용하므로 학습용으로만 사용한다

## 산출물
- 생성된 Firestore 데이터베이스

## 체크리스트
- [ ] Firestore Database 화면에 빈 데이터베이스가 보인다.
- [ ] "테스트 모드" 규칙이 적용돼 있다 (규칙 탭에서 만료일 확인 가능).

# 3 단계: 웹 앱 등록하고 설정 정보(firebaseConfig) 확인하기

- 왼쪽 메뉴 상단의 설정(톱니바퀴) 아이콘 클릭 → "Project settings" 선택
- General 탭 화면을 아래로 스크롤하면 "Your apps" 카드가 보임
- 아직 등록된 앱이 없으므로 플랫폼 아이콘(웹, iOS, Android)이 줄지어 있음 → 웹을 나타내는 "</>" 모양 아이콘 클릭
- 앱 닉네임 입력 (예: todo-web) → Firebase Hosting 설정 체크박스는 체크하지 않고 그대로 둠 → "앱 등록(Register app)" 클릭
- 화면에 표시되는 firebaseConfig 객체(apiKey, authDomain, projectId 등)를 통째로 복사해 메모장에 저장
  → "콘솔로 이동(Continue to console)" 클릭

## 규칙
- "Firebase Hosting 설정"은 건너뛰어도 된다
- 화면에 표시되는 `firebaseConfig` 객체(apiKey, projectId 등)를 통째로 복사해 메모장에 저장한다
- 이 값은 SAMPLE.md에서 그대로 사용한다

## 산출물
- `firebaseConfig` 객체 (apiKey, authDomain, projectId, appId 등)

## 체크리스트
- [ ] `firebaseConfig` 전체를 복사해뒀다.
- [ ] `projectId` 값이 2단계에서 만든 프로젝트와 일치한다.

# 4 단계: 브라우저에서 바로 열리는 예제 페이지 준비하기

## 규칙
- 컴퓨터에 `index.html` 파일을 새로 만든다
- SAMPLE.md의 전체 코드를 그대로 복사해 붙여넣는다
- 코드 안의 `firebaseConfig` 자리에 3단계에서 복사한 값을 그대로 넣는다

## 산출물
- `index.html` 파일 (설치 없이 더블클릭으로 실행 가능)

## 체크리스트
- [ ] 파일을 더블클릭하면 브라우저에서 페이지가 열린다.
- [ ] 브라우저 콘솔(F12 → Console 탭)에 빨간 에러가 없다.

# 5 단계: 할 일 추가/조회 기능 확인하기

## 규칙
- 입력창에 할 일 내용을 쓰고 "추가" 버튼 클릭 → 내부적으로 `addDoc(collection(db, "todos"), ...)` 호출
- 페이지가 열릴 때 `getDocs(collection(db, "todos"))`로 기존 목록을 불러온다
- 정상 동작하면 화면에 방금 추가한 항목이 바로 나타난다

## 산출물
- 실제로 추가/조회가 동작하는 페이지

## 체크리스트
- [ ] "추가" 버튼을 누르면 화면에 새 항목이 나타난다.
- [ ] 페이지를 새로고침해도 항목이 남아있다 (Firestore에 저장됐다는 증거).

# 6 단계: 기본 보안(Security Rules) 이해하고 설정하기

## 규칙
- Firestore Database → "규칙"(Rules) 탭 클릭
- 2단계에서 선택한 테스트 모드 규칙은 일정 기간(보통 30일) 후 자동으로 잠기므로, 아래처럼 연습용 규칙으로 명시적으로 바꿔둔다

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /todos/{docId} {
      allow read, write: if true;
    }
  }
}
```

- 실제 서비스에서는 `if true` 대신 로그인한 사용자만 허용하는 조건이 필요하다는 점을 기억한다 (이 예제 범위 밖)
- "게시"(Publish) 클릭

## 산출물
- `todos` 컬렉션에 적용된 보안 규칙

## 체크리스트
- [ ] 규칙 탭에 위 코드가 저장되어 있다.
- [ ] "게시" 후 상단에 반영 완료 메시지가 보인다.

# 7 단계: Firebase 콘솔에서 데이터 최종 확인하기

## 규칙
- Firestore Database → "데이터"(Data) 탭 열기
- 브라우저에서 추가했던 항목이 `todos` 컬렉션의 문서로 보이는지 확인

## 산출물
- Firebase 콘솔에서 확인된 문서 데이터

## 체크리스트
- [ ] 앱에서 추가한 데이터가 콘솔에서도 그대로 보인다.
- [ ] `isDone` 필드가 기본값(false)으로 들어가 있다.
