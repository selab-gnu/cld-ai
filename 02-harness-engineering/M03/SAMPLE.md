# 예제 실행 및 프롬프트

## 1단계: 커밋할 변경 만들기

Todo 앱에 아직 없는 기능 하나를 정해서 Claude에게 시킨다. 예: 할 일을 완료 처리하는 `complete` 기능.

```bash
git add -A
git commit -m "chore: todo 앱 초기 버전 (add, list)"
```

## 2단계: Claude Code CLI를 실행

```bash
cd todo-app
claude
```

## 3단계: 프롬프트가 뜨면 자연어로 지시

다음과 같이 그대로 입력한다.

```
todo.py에 complete 기능을 추가해줘. 사용법은
`python todo.py complete <번호>` 형태로, 해당 번호의 항목을 완료(done=True) 처리해줘.
```

**기대 결과**
- Claude가 `todo.py`를 수정하는 순간, GUIDE.md 5단계에서 만든 PostToolUse Hook이 자동으로 실행되어
  1) `black todo.py`로 코드 스타일이 정리되고,
  2) `python todo.py list`가 자동 실행되어 수정 직후 바로 동작을 확인할 수 있다.
- 만약 Claude가 실수로 `rm todo.json` 같은 명령을 실행하려 하면, GUIDE.md 6단계의 PreToolUse Hook이 이를 막고 차단 이유를 출력한다.
