# 예제 실행 및 프롬프트

GUIDE.md의 1단계를 마쳤다면(설정 파일 위치 이해), 아래 코드를 그대로 사용하면 된다.

## 1단계: 알림(Notification) 훅 — `~/.claude/settings.json`

운영체제에 맞는 탭의 코드를 그대로 복사해서 넣는다.

### macOS
```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

### Linux
```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "notify-send 'Claude Code' 'Claude Code needs your attention'"
          }
        ]
      }
    ]
  }
}
```

### Windows (PowerShell)
```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell.exe -Command \"[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('Claude Code needs your attention', 'Claude Code')\""
          }
        ]
      }
    ]
  }
}
```

`matcher`를 빈 문자열로 두면 모든 알림 상황에서 실행된다. 특정 상황에만 반응하게 하려면 `permission_prompt`(승인 대기), `idle_prompt`(60초간 응답 없음) 등의 값을 넣으면 된다.

## 2단계: 등록 확인 및 테스트

```
/hooks
```

목록에서 `Notification`을 선택해 내가 등록한 명령어가 그대로 보이는지 확인한다. 이후 `Esc` → `Shift+Tab`으로 수동 모드로 전환하고, Claude에게 승인이 필요한 작업을 시킨 뒤 다른 창으로 전환해본다.

## 3단계: (심화) 파일 저장 시 자동 포맷팅 훅 — `.claude/settings.json` (프로젝트 폴더)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
          }
        ]
      }
    ]
  }
}
```

테스트 방법: Claude에게 "JS 파일에 작은따옴표로 된 문자열 한 줄을 추가해줘"라고 요청한 뒤 파일을 열어본다. Prettier 기본 설정에서는 작은따옴표가 큰따옴표로 자동 변환된다.

## 4단계: 훅을 직접 만들지 말고 Claude에게 시키는 방법

훅의 JSON 문법이 헷갈린다면, 아래처럼 자연어로 요청하면 Claude Code가 대신 작성해준다.

> "`.env` 파일을 Claude가 절대 수정하지 못하게 막는 PreToolUse 훅을 만들어줘. 차단됐을 때는 왜 막혔는지 이유도 알려줘."

> "Bash 도구로 실행되는 모든 명령어를 `~/.claude/command-log.txt`에 기록하는 훅을 등록해줘."

## 5단계: 훅 스크립트를 터미널에서 직접 테스트하는 방법

훅이 스크립트 파일(`.sh`)이라면, Claude Code를 거치지 않고 아래처럼 가짜 입력을 흘려보내 직접 테스트할 수 있다.

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | ./my-hook.sh
echo $?   # 종료 코드 확인 (0=문제없음, 2=차단)
```

## 6단계: 알림이 안 뜰 때 (macOS 기준)

`osascript`는 Script Editor 앱을 통해 알림을 보내는데, 이 앱에 알림 권한이 없으면 조용히 실패한다.

1. 터미널에서 한 번 실행: `osascript -e 'display notification "test"'`
2. 시스템 설정 → 알림 → Script Editor를 찾아 "알림 허용"을 켠다
3. 다시 실행해서 알림이 뜨는지 확인한다

## 7단계: 문제가 생겼을 때 물어보는 방법

> "`~/.claude/settings.json`에 Notification 훅을 넣었는데 /hooks에 안 보여. 내 설정 파일 내용은 다음과 같아: [여기에 JSON 붙여넣기]. 뭐가 잘못됐을까?"

> "PostToolUse 훅을 등록했는데 파일이 포맷팅이 안 돼. jq는 설치돼 있어. 원인을 어떻게 찾아야 할까?"
