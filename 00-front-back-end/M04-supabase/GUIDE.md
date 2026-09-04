# 개념

Supabase는 오픈소스 기반의 백엔드 서비스 모음이다. 내부적으로는 진짜 PostgreSQL 데이터베이스를 사용하며, 서버를 직접 만들지 않아도 웹사이트에서 바로 데이터를 저장하고 불러올 수 있는 자동 API를 제공한다. Firestore가 "컬렉션 안의 문서" 구조라면, Supabase는 "테이블 안의 행(row)" 구조를 쓰는 관계형 데이터베이스다. 이 가이드에서는 "할 일 목록(todos)" 예제를 통해 Supabase의 가장 기본적인 사용법을 익힌다.

> ⚠️ **최근 변경사항 안내 (2025~2026)**
> 1. Supabase는 기존의 `anon` / `service_role` 키를 **`sb_publishable_...` / `sb_secret_...`** 형식의 새 키로 교체하고 있다. 옛날 키(`anon`, `service_role`)는 2026년 말에 완전히 삭제될 예정이므로, 새로 시작하는 프로젝트는 처음부터 새 키를 쓰는 것이 좋다.
> 2. 대시보드(Table Editor)에서 테이블을 만들면 **RLS(Row Level Security, 행 단위 보안)가 기본값으로 켜진 채** 생성된다. 즉 Firebase의 "테스트 모드"처럼 처음에 모두 허용되는 게 아니라, **정책(Policy)을 추가하기 전까지는 기본적으로 아무도 데이터를 읽거나 쓸 수 없다.** 이 문서의 3단계에서 이 부분을 반드시 짚고 넘어간다.

# 1 단계: Supabase 프로젝트 만들기

## 규칙
- https://supabase.com 접속 → "Start your project" 클릭 → GitHub 계정 등으로 로그인
- 조직(Organization)이 없다면 새로 만든다 (개인용이면 기본값 그대로 진행)
- "New project" 클릭 → 프로젝트 이름(예: my-todo-app) 입력
- 데이터베이스 비밀번호(Database Password)를 정하고 **반드시 메모장에 저장**해둔다 (나중에 직접 DB에 접속할 때 필요)
- Region은 가까운 지역으로 선택 (예: Northeast Asia (Seoul))
- "Create new project" 클릭 후 프로비저닝(약 1~2분)이 끝날 때까지 기다린다

## 산출물
- 생성된 Supabase 프로젝트

## 체크리스트
[ ] 프로젝트 대시보드 화면(왼쪽에 Table Editor, SQL Editor 등 메뉴)이 보인다.
[ ] 프로젝트 이름과 데이터베이스 비밀번호를 메모장에 저장했다.

# 2 단계: `todos` 테이블 만들기

## 규칙
- 왼쪽 메뉴에서 "Table Editor" 클릭 → "New table" 클릭
- Name에 `todos` 입력
- 아래 컬럼을 추가한다 (`id`, `created_at`은 기본으로 이미 만들어져 있다)
  - `task` → Type: `text`
  - `is_done` → Type: `bool`, Default value: `false`
- "Save" 클릭
- **주의**: Table Editor로 테이블을 만들면 화면에 "RLS enabled" 표시가 함께 뜬다. 이는 이 테이블이 기본적으로 **잠겨 있다**는 뜻이다. 지금 당장은 정책이 없어서 브라우저 코드로 읽기/쓰기를 시도하면 전부 실패(빈 배열 또는 오류)한다. 이 부분은 3단계에서 바로 해결한다.

## 산출물
- `id`, `created_at`, `task`, `is_done` 컬럼을 가진 `todos` 테이블

## 체크리스트
[ ] Table Editor에서 `todos` 테이블과 4개 컬럼이 보인다.
[ ] 테이블 이름 옆에 "RLS enabled" 배지가 보인다 (아직 정책은 없는 상태).

# 3 단계: 연습용 정책(Policy)으로 읽기/쓰기 허용하기

Firebase의 "테스트 모드"에 해당하는 단계다. Firestore는 테스트 모드를 켜면 기본적으로 열려 있지만, Supabase는 반대로 **정책을 만들어야만 열린다.**

## 규칙
- 왼쪽 메뉴에서 "Authentication" → "Policies" 이동 (또는 Table Editor에서 `todos` 테이블의 "RLS enabled" 배지 클릭)
- `todos` 테이블 옆의 **"New Policy"** 클릭 → **"Create a new policy"** 창이 뜬다 (아래 필드들을 하나씩 채운다)

### "Create a new Row Level Security policy" 창 필드 채우기

이 창은 SQL을 몰라도 채울 수 있도록 항목이 나뉘어 있고, 오른쪽 **Templates** 패널에서 자주 쓰는 정책을 골라 자동으로 채울 수도 있다. 지금은 연습용으로 "읽기(select) 허용" 정책 하나, "추가(insert) 허용" 정책 하나, 총 2개를 만든다.

**① select(읽기) 정책 만들기**
| 필드 | 입력값 |
|---|---|
| Policy Name | `Enable read access for everyone` |
| Table (`on` clause) | `public.todos` (자동으로 선택돼 있음) |
| Policy Behavior (`as` clause) | `Permissive` (기본값 그대로) |
| Policy Command (`for` clause) | `SELECT` 선택 |
| Target Roles (`to` clause) | 비워두거나 `anon` 선택 (비워두면 모든 역할에 적용됨) |
| 아래 코드 박스 (`using` 절) | `true` 입력 |

- 오른쪽 Templates 패널에서 **"Enable read access for all users"**를 클릭하면 위 내용이 자동으로 채워진다.
- 다 채웠으면 오른쪽 아래 **"Save policy"** 클릭

**② insert(추가) 정책 만들기**
같은 방식으로 "New Policy"를 한 번 더 눌러 아래처럼 만든다.
| 필드 | 입력값 |
|---|---|
| Policy Name | `Enable insert access for everyone` |
| Policy Command (`for` clause) | `INSERT` 선택 |
| Target Roles (`to` clause) | 비워두거나 `anon` 선택 |
| 아래 코드 박스 (`with check` 절) | `true` 입력 |

> 화면 오른쪽 Templates 목록에는 `Enable insert for authenticated users only`, `Enable delete for users based on user_id`처럼 `user_id` 컬럼이 있다고 가정하는 템플릿도 보인다. 이런 템플릿은 지금 우리 `todos` 테이블에는 `user_id` 컬럼이 없으므로 **사용하지 않는다** — 7단계에서 로그인 기능을 붙일 때 참고하면 된다.

### SQL로 한 번에 하고 싶다면
위 화면 대신 SQL Editor에 아래를 붙여넣어 실행해도 동일하게 동작한다 (더 빠름):

```sql
-- 연습용: 누구나 todos를 읽고 쓸 수 있도록 허용 (학습용으로만 사용)
create policy "Enable read access for everyone"
on public.todos for select
to anon
using (true);

create policy "Enable insert access for everyone"
on public.todos for insert
to anon
with check (true);
```

- `to anon`은 로그인하지 않은 사용자(=새 publishable 키 또는 옛 anon 키로 접속한 사용자)를 의미한다. 화면에서 Target Roles를 비워두면 `anon`을 포함한 모든 역할에 적용되는 것과 결과적으로 같다.
- `using`은 **조회(읽기)** 시 어떤 행을 보여줄지 판단하는 조건이고, `with check`는 **삽입/수정** 시 저장을 허용할지 판단하는 조건이다. 지금은 둘 다 `true`라서 무조건 통과된다.
- 실제 서비스에서는 `true` 대신 로그인한 사용자 본인의 데이터만 허용하는 조건이 필요하다는 점을 기억한다 (이 예제 범위 밖, 7단계 참고).

## 산출물
- `todos` 테이블에 적용된 "누구나 읽기/쓰기 허용" 정책 2개 (select 1개, insert 1개)

## 체크리스트
[ ] Authentication → Policies 화면에 `todos` 테이블 아래 정책 2개(select, insert)가 보인다.
[ ] 각 정책 이름 옆에 초록색 `SELECT`, 주황색 `INSERT` 같은 라벨이 붙어 있다.
[ ] SQL Editor에서 실행했다면 "Success. No rows returned" 메시지를 확인했다.

# 4 단계: Connect 창에서 프로젝트 URL과 API 키 확인하기 (⭐ 중요)

## 규칙
- 대시보드 상단(또는 왼쪽 메뉴)의 **"Connect"** 버튼 클릭
- 뜨는 창에서 상단 탭 중 **"App Frameworks"** 또는 **"Data API"** 탭을 연다
- **Project URL**을 복사한다 (`https://xxxxxxxx.supabase.co` 형태)
- **API Key** 항목에서 반드시 아래 기준으로 확인한다:
  - ✅ 옳은 것: **Publishable key** (`sb_publishable_...`로 시작) — 브라우저 코드에 넣을 키
  - ❌ 넣으면 안 되는 것: **Secret key** (`sb_secret_...`로 시작) — 이건 서버 전용이며, 브라우저 코드에 넣으면 누구나 내 데이터베이스를 완전히 제어할 수 있게 된다
  - 아직 예전 프로젝트라 새 키가 안 보인다면, 왼쪽 메뉴 "Project Settings → API Keys"로 이동해 "Create new API keys" 버튼을 눌러 새 키를 발급한다 (기존 `anon`/`service_role` 키는 그대로 유지되며 함께 쓸 수 있다)
  - 옛날 블로그·튜토리얼에는 `anon` 키를 쓰라고 나오는 경우가 많은데, `anon` 키는 2026년 말 이후 삭제 예정이므로 이 가이드에서는 **publishable 키**를 기준으로 진행한다. (참고: `anon` 키를 그대로 써도 지금 당장은 동일하게 동작한다)
- Project URL과 Publishable key를 메모장에 저장한다. 이 값은 SAMPLE.md에서 그대로 사용한다.

## 산출물
- Project URL
- Publishable key (`sb_publishable_...`)

## 체크리스트
[ ] Project URL을 복사해뒀다 (`.supabase.co`로 끝나는지 확인).
[ ] 복사한 키가 `sb_secret_`이 아니라 `sb_publishable_`(또는 `anon`)로 시작하는지 다시 한번 확인했다.

# 5 단계: 브라우저에서 바로 열리는 예제 페이지 준비하기

## 규칙
- 컴퓨터에 `index.html` 파일을 새로 만든다
- SAMPLE.md의 전체 코드를 그대로 복사해 붙여넣는다
- 코드 안의 `SUPABASE_URL`, `SUPABASE_KEY` 자리에 4단계에서 복사한 값을 그대로 넣는다

## 산출물
- `index.html` 파일 (설치 없이 더블클릭으로 실행 가능)

## 체크리스트
[ ] 파일을 더블클릭하면 브라우저에서 페이지가 열린다.
[ ] 브라우저 콘솔(F12 → Console 탭)에 빨간 에러가 없다.

# 6 단계: 할 일 추가/조회 기능 확인하기

## 규칙
- 입력창에 할 일 내용을 쓰고 "추가" 버튼 클릭 → 내부적으로 `supabase.from("todos").insert(...)` 호출
- 페이지가 열릴 때 `supabase.from("todos").select("*")`로 기존 목록을 불러온다
- 정상 동작하면 화면에 방금 추가한 항목이 바로 나타난다
- 만약 아무것도 안 뜨고 콘솔에 `new row violates row-level security policy` 같은 에러가 보인다면 → 3단계의 정책이 제대로 저장되지 않았거나, 4단계에서 잘못된 키(예: 다른 프로젝트의 키, secret 키)를 넣은 것이다

## 산출물
- 실제로 추가/조회가 동작하는 페이지

## 체크리스트
[ ] "추가" 버튼을 누르면 화면에 새 항목이 나타난다.
[ ] 페이지를 새로고침해도 항목이 남아있다 (Supabase DB에 저장됐다는 증거).

# 7 단계: Supabase 콘솔에서 데이터 최종 확인 + 실제 서비스로 넘어가기 전 체크

## 규칙
- Table Editor → `todos` 테이블 열기
- 브라우저에서 추가했던 항목이 행(row)으로 보이는지 확인
- 실제 서비스로 배포하기 전에는 3단계의 `using (true)` / `with check (true)` 정책을 아래처럼 로그인한 사용자 전용으로 바꿔야 한다 (이 예제 범위 밖이지만 다음 단계로 참고):

```sql
-- 예시: 로그인한 사용자 자신의 할 일만 보이도록 (user_id 컬럼 추가가 선행되어야 함)
create policy "Users can only see their own todos"
on public.todos for select
to authenticated
using (auth.uid() = user_id);
```

## 산출물
- Supabase 콘솔에서 확인된 행 데이터

## 체크리스트
[ ] 앱에서 추가한 데이터가 콘솔에서도 그대로 보인다.
[ ] `is_done` 필드가 기본값(false)으로 들어가 있다.
[ ] 연습이 끝나면 지금의 "누구나 허용" 정책은 실제 서비스에 쓰지 않아야 한다는 점을 이해했다.
