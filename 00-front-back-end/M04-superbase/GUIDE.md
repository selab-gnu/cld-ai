# 개념

Supabase는 "오픈소스 Firebase 대안"이라고 불리는 백엔드 서비스다. 복잡한 서버를 직접 만들지 않아도, 웹사이트에서 바로 데이터베이스에 데이터를 저장하고 불러올 수 있다. 이 가이드에서는 "할 일 목록(todos)" 예제를 통해 Supabase의 가장 기본적인 사용법을 익힌다.

# 1 단계: Supabase 계정 만들고 프로젝트 생성하기

- https://supabase.com 접속 → "Start your project" 클릭
- GitHub 계정 또는 이메일로 회원가입
- "New Organization" 클릭, 디폴트 조직 이름에 "Create orgaization"을 클릭
- "New Project" 클릭 → Project name(예: my-todo-app), Database Password(반드시 별도로 메모), Region(가까운 지역, 예: Northeast Asia (Seoul)) 입력 후 생성

## 규칙
- 프로젝트가 준비되는 데 1~2분 정도 걸린다

## 산출물
- 생성된 Supabase 프로젝트 (URL 형태: `https://xxxxx.supabase.co`)

## 체크리스트
[ ] 프로젝트 상태가 "Active"로 표시된다.
[ ] 프로젝트 URL과 DB 비밀번호를 메모장에 저장했다.

# 2 단계: 테이블 만들기 (todos)

## 규칙
- 왼쪽 메뉴에서 "Table Editor" 클릭
- "New table" 클릭 → 이름: `todos`
- 컬럼 추가:
  - `id` (기본 제공, 자동 증가)
  - `task` — type: text
  - `is_done` — type: bool, Default Value: false
  - `created_at` (기본 제공)
- "Save" 클릭해서 테이블 생성

## 산출물
- `todos` 테이블 (컬럼: id, task, is_done, created_at)

## 체크리스트
[ ] Table Editor에서 `todos` 테이블이 보인다.
[ ] `task`, `is_done` 컬럼이 정상적으로 만들어졌다.

# 3 단계: API 키와 URL 확인하기

## 규칙
- 왼쪽 메뉴 "Project Settings" → "API" 클릭
- "Project URL"과 "anon public" 키 값을 복사해 메모장에 저장
- 이 두 값은 SAMPLE.md에서 그대로 사용한다

## 산출물
- Project URL, anon key 값

## 체크리스트
[ ] Project URL을 확인했다.
[ ] anon public key를 확인했다.

# 4 단계: 브라우저에서 바로 열리는 예제 페이지 준비하기

## 규칙
- 컴퓨터에 `index.html` 파일을 새로 만든다
- SAMPLE.md의 전체 코드를 그대로 복사해 붙여넣는다
- 코드 안의 `SUPABASE_URL`, `SUPABASE_ANON_KEY` 자리에 3단계에서 확인한 값을 넣는다

## 산출물
- `index.html` 파일 (설치 없이 더블클릭으로 실행 가능)

## 체크리스트
[ ] 파일을 더블클릭하면 브라우저에서 페이지가 열린다.
[ ] 브라우저 콘솔(F12 → Console 탭)에 빨간 에러가 없다.

# 5 단계: 할 일 추가/조회 기능 확인하기

## 규칙
- 입력창에 할 일 내용을 쓰고 "추가" 버튼 클릭 → 내부적으로 `supabase.from('todos').insert(...)` 호출
- 페이지가 열릴 때 `supabase.from('todos').select('*')`로 기존 목록을 불러온다
- 정상 동작하면 화면에 방금 추가한 항목이 바로 나타난다

## 산출물
- 실제로 추가/조회가 동작하는 페이지

## 체크리스트
[ ] "추가" 버튼을 누르면 화면에 새 항목이 나타난다.
[ ] 페이지를 새로고침해도 항목이 남아있다 (Supabase에 저장됐다는 증거).

# 6 단계: 기본 보안(RLS) 이해하고 설정하기

## 규칙
- Table Editor → `todos` 테이블 → 상단의 "RLS" 토글 확인 (기본적으로 꺼져 있으면 아무나 접근 가능)
- 연습 목적이므로 "Enable read/write access for all users" 형태의 임시 정책을 하나 추가한다
- 실제 서비스에서는 로그인한 사용자별로만 접근을 허용하는 정책이 필요하다는 점을 기억한다 (이 예제 범위 밖)

## 산출물
- `todos` 테이블에 적용된 RLS 정책 1개

## 체크리스트
[ ] RLS가 "Enabled" 상태다.
[ ] 정책이 최소 1개 등록되어 있다.

# 7 단계: 대시보드에서 데이터 최종 확인하기

## 규칙
- Table Editor → `todos` 테이블 열기
- 브라우저에서 추가했던 항목이 실제 데이터베이스 행으로 보이는지 확인

## 산출물
- Supabase 대시보드에서 확인된 데이터 행

## 체크리스트
[ ] 앱에서 추가한 데이터가 테이블에서도 그대로 보인다.
[ ] `is_done` 값이 기본값(false)으로 들어가 있다.
