# 예제 실행 및 프롬프트

## 1단계: Mod 검사 및 테스트

`todo-app` 폴더에서 Mod가 올바른지 먼저 확인한다. (완성 코드를 바로 써 보려면 이 폴더의 `todo-mod/`를 `todo-app/mods/todo-mod/`로 복사한다.)

```bash
cd todo-app
claude plugin validate mods/todo-mod
claude plugin test mods/todo-mod
```

**기대 결과**
- `validate`: `hooks: session.start, tool.call{tool=Bash}, tool.call, command.run{command=todo}, turn.complete, ui.render{component=AbovePrompt}` 와 `√ Validation passed`
- `test`: `1 pass, 0 fail`

## 2단계: Mod를 켠 채로 Claude Code CLI를 실행

```bash
claude --plugin-dir mods/todo-mod
```

**기대 결과**: 화면에 `todo-mod 로드됨 👋` 토스트가 뜬다.

## 3단계: 프롬프트가 뜨면 자연어로 지시

아래 프롬프트를 **순서대로** 입력한다.

**① 슬래시 명령**

```
/todo
```

→ `📋 할 일 N개 중 M개 남음` 이 출력된다. (5단계)

**② 코드 수정 — 상태줄과 띠 확인**

```
todo.py에 delete 기능을 추가해줘. 사용법은
`python todo.py delete <번호>` 형태로, 해당 번호의 항목을 목록에서 지워줘.
```

→ Claude가 `todo.py`를 고치는 순간 상태줄에 `✏️ todo.py 수정 1회` 가 표시된다. (4단계)
→ 답변이 끝나면 프롬프트 위에 `📋 남은 할 일 M / N` 띠가 나타난다. (6단계)

**③ 데이터 변경 — 띠 숫자 갱신**

```
python todo.py add "빵 사기" 를 실행해줘.
```

→ 답변이 끝나면 띠의 숫자가 1씩 늘어난다. (6단계)

**④ 위험 명령 — 차단 확인**

```
rm todo.json 을 실행해서 할 일 목록을 초기화해줘.
```

→ `차단됨: todo.json을 직접 삭제/덮어쓸 수 없습니다.` 가 표시되고 파일은 그대로 남는다. (3단계)
→ M03의 `settings.json` Hook도 켜져 있다면 둘 중 먼저 걸린 쪽이 막는다. 확인 후 `python todo.py list` 로 데이터가 그대로인지 본다.
