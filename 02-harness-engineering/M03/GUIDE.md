# 개념

이 가이드는 **Claude Code 하네스 엔지니어링**(규칙 + 자동화 Hook을 갖춘 `.claude` 폴더 설계)을 아주 작은 예제로 실습합니다.

예제 프로젝트는 **Todo 앱**(할 일을 추가·완료·삭제하는 파이썬 CLI)이며, 목표는 아래 4가지 산출물을 직접 손으로 만들어 보는 것입니다.

- **가이드** — 지금 보고 있는 이 문서
- **규칙** — `CLAUDE.md` (Claude가 지켜야 할 프로젝트 규칙)
- **자동화** — `.claude/settings.json`의 Hook (파일을 고칠 때마다 자동 실행되는 명령)
- **샘플** — `SAMPLE.md` (실제로 재현 가능한 프롬프트와 실행 결과)

Hook의 핵심은 "Claude에게 부탁하는 것"이 아니라 "조건만 맞으면 무조건 실행되는 규칙"이라는 점입니다. 프롬프트는 무시될 수 있지만, Hook은 항상 실행됩니다.

---
# 0 단계: 사전 준비
- black이라는 포맷팅 도구가 설치되어야 한다. 그리고 클로드 안에서 인식이 되어야 한다.
- python도 클로드에서 인식하는 도구가 python인지 python3인지 확인한다.

# 1 단계: 예제 프로젝트 준비 (Todo 앱 스캐폴딩)

## 규칙
- 언어는 Python 3, 외부 라이브러리 없이 표준 라이브러리만 사용한다.
- 할 일 목록은 `todo.json` 파일 하나에 저장한다.
- 최초 버전은 `add`(추가), `list`(목록 보기) 두 기능만 구현한다. `complete`, `delete`는 이후 단계에서 Claude에게 직접 시켜본다.

## 산출물
`todo.py` — 최소 기능 버전

```python
import json, sys
from pathlib import Path

DB = Path("todo.json")

def load():
    return json.loads(DB.read_text()) if DB.exists() else []

def save(items):
    DB.write_text(json.dumps(items, ensure_ascii=False, indent=2))

def add(text):
    items = load()
    items.append({"text": text, "done": False})
    save(items)
    print(f"추가됨: {text}")

def list_items():
    for i, item in enumerate(load()):
        mark = "x" if item["done"] else " "
        print(f"[{mark}] {i}: {item['text']}")

if __name__ == "__main__":
    cmd, *args = sys.argv[1:]
    if cmd == "add":
        add(" ".join(args))
    elif cmd == "list":
        list_items()
```

## 체크리스트
- [ ] `git init` 후 첫 커밋에 `todo.py`가 포함되어 있다.
- [ ] `python todo.py add "우유 사기"` → `python todo.py list` 실행 결과가 정상적으로 보인다.

---

# 2 단계: Claude Code 연결 및 `.claude` 폴더 만들기

## 규칙
- 팀/여러 프로젝트에 공통 적용할 규칙은 사용자 레벨(`~/.claude/settings.json`)에, 이 프로젝트에만 적용할 규칙은 프로젝트 레벨(`.claude/settings.json`)에 둔다.
- 이번 실습은 전부 **프로젝트 레벨**로 진행해서 다른 프로젝트에 영향이 가지 않게 한다.

## 산출물
프로젝트 루트에 아래 골격을 만든다.

```
todo-app/
├── todo.py
├── todo.json
└── .claude/
    └── settings.json   ← 아직은 빈 JSON: {}
```

## 체크리스트
- [ ] 프로젝트 폴더에서 `claude` 명령이 정상적으로 실행된다.
- [ ] `.claude/settings.json` 파일이 존재하고 내용은 `{}` 이다.

---

# 3 단계: `CLAUDE.md` 작성 — Claude가 지킬 규칙 정의

## 규칙
- 규칙은 사람이 읽어도 이해되는 문장으로, 최대한 짧고 구체적으로 쓴다.
- "이렇게 해줘" 수준이 아니라, 이후 Hook으로 강제할 규칙과 Hook 없이도 지켜야 할 규칙을 구분해서 적는다.

## 산출물
`CLAUDE.md`

```markdown
# Todo 앱 프로젝트 규칙

- `todo.json`을 직접 손으로 편집하지 말고 항상 `todo.py`의 함수를 통해서만 수정한다.
- 함수를 추가하거나 수정해도 `list_items()`의 출력 형식(`[x] 번호: 내용`)은 그대로 유지한다.
- 새 기능을 추가한 뒤에는 `python todo.py list`로 직접 실행해서 정상 동작을 확인한 뒤 보고한다.
```

## 체크리스트
- [ ] `CLAUDE.md`가 프로젝트 루트 혹은 프로젝트 루트 하에 '.claude' 폴더 아래에 있다.
- [ ] Claude Code 새 세션에서 `CLAUDE.md` 내용을 인식하는지 확인했다.

---

# 4 단계: Hook 설계 — 무엇을 자동화할지 정하기

## 규칙
- Hook은 "사람이 매번 확인하기 귀찮고, 조건이 명확한 것"에만 건다. 예: 포맷팅, 위험 명령 차단.
- 이벤트 → 매처 → 액션 3요소를 표로 먼저 정리하고 나서 구현한다.

## 산출물
Hook 설계표

| 이벤트 | 매처 | 액션 | 목적 |
|---|---|---|---|
| PostToolUse | Edit, Write | `black todo.py` | 코드 스타일 자동 통일 |
| PostToolUse | Edit, Write | `python todo.py list` | 수정 직후 자동으로 동작 확인 |
| PreToolUse | Bash | `todo.json` 삭제/덮어쓰기 명령 차단 | 데이터 유실 방지 |

## 체크리스트
- [ ] 표의 각 행이 "사람이 반복적으로 확인하던 일"인지 점검했다.
- [ ] 매처를 너무 넓게(`*`) 잡지 않았는지 확인했다.

---

# 5 단계: Hook 구현 — 자동 포맷팅 + 자동 확인

## 규칙
- Hook 명령은 실패하면 0이 아닌 종료 코드를 반환해야 Claude Code가 실패를 인지한다.
- 먼저 `pip install black`으로 포맷터를 설치해 둔다.

## 산출물
`.claude/settings.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|Bash",
        "hooks": [
          {
            "type": "command",
            "command": "out=$(black todo.py 2>&1 | tr '\\n' ' '); jq -n --arg m \"$out\" '{systemMessage:(\"🖤 black todo.py → \"+$m), hookSpecificOutput:{hookEventName:\"PostToolUse\", additionalContext:(\"[hook] black todo.py → \"+$m)}}'",
            "statusMessage": "black 포맷 검사 중..."
          }
        ]
      }
    ]
  }
}
```

## 체크리스트
- [ ] Claude에게 "todo.py에 `complete` 기능을 추가해줘"라고 시켰다.
- [ ] 파일이 수정된 직후 터미널에 `black` 실행 로그가 자동으로 찍혔다.

---

# 6 단계: 안전장치 Hook 추가 — 위험한 명령 차단

## 규칙
- `todo.json`을 지우거나 덮어쓰는 Bash 명령은 무조건 차단한다.
- 차단 시 이유를 사람이 이해할 수 있는 메시지로 출력한다.

## 산출물
5단계 `settings.json`에 아래 블록을 추가한다.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "cmd=$(jq -r '.tool_input.command // \"\"'); grep -qE 'rm .*todo\\.json|> *todo\\.json' <<< \"$cmd\" && { echo '차단됨: todo.json을 직접 삭제/덮어쓸 수 없습니다.' >&2; exit 2; }; exit 0"
          }
        ]
      }
    ]
  }
}
```

## 체크리스트
- [ ] Claude에게 일부러 "`rm todo.json` 실행해줘"라고 요청해봤다.
- [ ] 실제로 명령이 차단되고 이유 메시지가 출력되는 것을 확인했다.

---

# 7 단계: 검증 및 문서화 — 결과를 `SAMPLE.md`에 기록

## 규칙
- 다른 사람이 그대로 따라 했을 때 같은 결과가 나오도록, 실제로 실행한 프롬프트 원문과 결과를 그대로 남긴다.
- 요약하지 말고 핵심 로그만 그대로 붙여넣는다.

## 산출물
채워진 `SAMPLE.md` (별도 파일로 제공)

## 체크리스트
- [ ] `SAMPLE.md`의 3단계가 모두 채워져 있다.
- [ ] 이 문서만 보고 처음 보는 사람이 동일하게 재현할 수 있다.
