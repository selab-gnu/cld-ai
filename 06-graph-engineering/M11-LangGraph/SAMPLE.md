# 예제 실행 및 프롬프트

> 전제: GUIDE.md 1~6단계까지 완료되어, 도구 호출과 조건부 라우팅, `MemorySaver` 체크포인터까지 갖춘 `graph` 객체가 `agent.py`에 정의되어 있다고 가정한다.

## 1단계: 스크립트로 바로 실행해보기

`agent.py` 맨 아래에 실행 코드를 추가한다.

```python
if __name__ == "__main__":
    config = {"configurable": {"thread_id": "demo-1"}}
    while True:
        user_input = input("You: ")
        if user_input.lower() in ("exit", "quit"):
            break
        result = graph.invoke(
            {"messages": [{"role": "user", "content": user_input}]}, config
        )
        print("Agent:", result["messages"][-1].content)
```

```
python agent.py
```

## 2단계: 도구 호출을 유도하는 프롬프트 넣어보기

터미널에 아래와 같이 입력해 5단계에서 만든 `get_weather` 도구가 실제로 호출되는지 확인한다.

```
You: 서울 날씨 어때?
```

```
You: 부산은?
```

두 번째 질문에서도 이전 대화 맥락 없이 도구가 바로 호출되는지, 그리고 첫 질문과 도시 이름만 다르게 처리되는지 확인한다.

## 3단계: 대화 기억을 확인하는 프롬프트 넣어보기

같은 `thread_id`(`demo-1`)를 유지한 채로 이어서 입력한다.

```
You: 내 이름은 지민이야
You: 내 이름이 뭐라고 했지?
```

두 번째 답변에 "지민"이 정확히 언급되면 6단계의 체크포인터가 정상 동작하는 것이다.

## 4단계: langgraph dev로 그래프 실행을 눈으로 관찰하기

```
langgraph dev
```

브라우저에 열리는 LangGraph Studio에서 방금 터미널로 주고받은 것과 같은 메시지를 다시 입력해 보고, `llm` → `tools` → `llm` 순서로 노드가 실행되는 과정을 그래프 위에서 직접 확인한다.

## 5단계: 프롬프트만 바꿔서 새 기능 실험하기

기존 코드를 건드리지 않고, 다음처럼 프롬프트만 바꿔가며 그래프의 반응을 관찰한다.

```
You: 오늘 서울 날씨랑 부산 날씨를 비교해서 어디가 더 따뜻한지 알려줘.
```

이 질문은 도구를 두 번 호출해야 답할 수 있다. `tools` → `llm` → `tools` → `llm`처럼 루프가 한 번 더 도는지 Studio에서 확인한다.

## 체크리스트
[ ] `python agent.py`로 그래프와 대화형으로 상호작용한다.
[ ] 도구 호출이 필요한 질문과 필요 없는 질문을 각각 넣어 두 경로를 모두 확인한다.
[ ] 같은 `thread_id`로 이전 대화 내용을 기억하는지 확인한다.
[ ] `langgraph dev`(LangGraph Studio)에서 노드 실행 순서를 시각적으로 확인한다.
[ ] 도구를 여러 번 호출해야 하는 질문으로 반복 루프가 정상 동작하는지 확인한다.
