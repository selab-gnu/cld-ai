# 개념

**LangGraph**는 LLM 애플리케이션을 "그래프"로 모델링하는 파이썬(및 JS) 라이브러리다. 노드(node)는 하나의 작업 단위(함수)이고, 엣지(edge)는 노드 사이의 흐름을 정의하며, 상태(state)는 그래프를 실행하는 동안 노드들이 함께 읽고 쓰는 공유 데이터다. 일반적인 LangChain 체인이 한 방향으로만 흐르는 DAG였다면, LangGraph는 **사이클(반복)**을 허용해서 "LLM에게 다음에 뭘 할지 물어보고, 그 결과에 따라 다시 루프를 도는" 에이전트형 동작을 자연스럽게 표현할 수 있다.

핵심 개념 네 가지만 먼저 기억하면 된다.

- **State** — 그래프 실행 중 유지되는 공유 데이터(보통 `TypedDict`). 각 노드는 상태의 일부를 읽고, 업데이트할 필드만 반환한다.
- **Node** — `(state) -> 상태 업데이트`를 반환하는 평범한 파이썬 함수. "행동"에 해당한다.
- **Edge** — 노드 사이의 연결. 항상 같은 다음 노드로 가는 **일반 엣지**와, 상태를 보고 다음 노드를 고르는 **조건부 엣지**가 있다.
- **Checkpointer** — 그래프의 상태를 저장해서, 실행이 끊겨도 이어서 진행하거나 이전 대화를 기억하게 해주는 저장소(메모리, SQLite, Postgres 등).

이 가이드는 이 네 개념을 실제로 손으로 만들어보며 이해하도록 구성했다. Python 3.11+ 기준이며, 예제 코드는 Anthropic Claude를 사용하지만 `langchain-openai` 등 다른 채팅 모델 패키지로도 그대로 대체할 수 있다.

---

# 1 단계: 사전 준비하기

## 규칙

- Python 3.11 또는 3.12를 사용한다. LangGraph 1.x는 `TypedDict`와 `Annotated` 기반 리듀서를 적극적으로 쓰므로, `typing.Annotated`를 한 번도 안 써봤다면 먼저 간단히 훑어본다.
- 반드시 **가상환경**을 만들어 작업한다. 전역 파이썬에 설치하면 다른 프로젝트의 `langchain-core` 버전과 충돌하기 쉽다.
  ```
  python -m venv .venv
  source .venv/bin/activate      # Windows: .venv\Scripts\activate
  ```
- 사용할 채팅 모델의 API 키를 환경 변수로 준비한다(예: Anthropic).
  ```
  export ANTHROPIC_API_KEY=sk-ant-...
  ```

## 산출물

- LangGraph 실습 전용 가상환경과 API 키 환경 변수 설정 완료.

## 체크리스트
[ ] `python --version`이 3.11 이상인지 확인한다.
[ ] 가상환경을 만들고 활성화한다.
[ ] 사용할 채팅 모델의 API 키를 환경 변수로 export한다.

---

# 2 단계: LangGraph 설치하기

## 규칙

- 핵심 패키지와, 사용할 모델의 LangChain 통합 패키지를 함께 설치한다.
  ```
  pip install -U langgraph langchain-anthropic
  ```
  (OpenAI를 쓴다면 `langchain-openai`, Gemini라면 `langchain-google-genai`로 교체)
- 로컬 개발 서버(LangGraph Studio 연동)와 그래프 시각화까지 쓰고 싶다면 다음도 함께 설치해 둔다.
  ```
  pip install -U "langgraph-cli[inmem]" grandalf
  ```
- 설치가 끝나면 반드시 import가 되는지 확인한다.
  ```python
  from langgraph.graph import StateGraph
  print("LangGraph 설치 완료")
  ```

## 산출물

- `langgraph`, 모델 통합 패키지, (선택) `langgraph-cli`가 설치된 환경.

## 체크리스트
[ ] `pip install -U langgraph langchain-anthropic`을 실행한다.
[ ] `from langgraph.graph import StateGraph`가 오류 없이 실행되는지 확인한다.
[ ] (선택) `langgraph-cli`까지 설치했다면 `langgraph --help`가 동작하는지 확인한다.

---

# 3 단계: State와 Node 정의하기

## 규칙

- 상태는 `TypedDict`로 정의한다. 메시지 기록처럼 "덮어쓰지 않고 계속 추가"해야 하는 필드는 `Annotated[list, add_messages]`처럼 리듀서를 지정한다.
  ```python
  from typing import TypedDict, Annotated
  from langgraph.graph.message import add_messages

  class AgentState(TypedDict):
      messages: Annotated[list, add_messages]
  ```
- 노드는 상태를 받아서, **바뀐 필드만** 딕셔너리로 반환하는 평범한 함수다. 상태 전체를 다시 만들 필요가 없다.
  ```python
  from langchain_anthropic import ChatAnthropic

  model = ChatAnthropic(model="claude-sonnet-4-6")

  def call_model(state: AgentState):
      response = model.invoke(state["messages"])
      return {"messages": [response]}
  ```
- 노드 이름과 함수 이름을 헷갈리지 않게, 그래프에 등록할 때 쓰는 문자열 이름을 먼저 적어두고 시작하면 편하다(예: `"llm"`, `"tools"`, `"router"`).

## 산출물

- `AgentState` 타입 정의와, 모델을 호출하는 노드 함수 `call_model` 하나.

## 체크리스트
[ ] `messages` 필드가 `add_messages` 리듀서로 누적되도록 `AgentState`를 정의한다.
[ ] `call_model(state)`가 `{"messages": [...]}` 형태로 업데이트를 반환하는지 확인한다.
[ ] 노드 함수를 그래프 밖에서 `call_model({"messages": [...]})`로 단독 호출해 정상 동작을 확인한다.

---

# 4 단계: 첫 번째 그래프 만들고 실행하기

## 규칙

- `StateGraph(상태타입)`으로 그래프를 만들고, `add_node`로 노드를, `add_edge`로 흐름을 등록한다. 시작과 끝은 `START`/`END` 상수로 표시한다.
  ```python
  from langgraph.graph import StateGraph, START, END

  builder = StateGraph(AgentState)
  builder.add_node("llm", call_model)
  builder.add_edge(START, "llm")
  builder.add_edge("llm", END)

  graph = builder.compile()
  ```
- 그래프는 `compile()`을 호출해야 실행 가능한 객체가 된다. `compile()` 이전의 `builder`는 실행할 수 없다.
- 실행은 `invoke`(한 번에 결과) 또는 `stream`(중간 단계를 실시간으로)으로 한다.
  ```python
  result = graph.invoke({"messages": [{"role": "user", "content": "안녕, 너는 뭘 할 수 있어?"}]})
  print(result["messages"][-1].content)
  ```

## 산출물

- 사용자 메시지를 받아 모델 응답 하나를 돌려주는, 동작하는 최소 그래프.

## 체크리스트
[ ] 노드 하나짜리(`llm`) 그래프를 `compile()`까지 완료한다.
[ ] `graph.invoke(...)`로 실제 응답을 받는다.
[ ] `graph.stream(...)`으로 같은 요청을 스트리밍 모드로도 실행해 차이를 확인한다.

---

# 5 단계: 도구와 조건부 라우팅 추가하기

## 규칙

- 도구는 `@tool` 데코레이터로 만든 평범한 함수다.
  ```python
  from langchain_core.tools import tool

  @tool
  def get_weather(city: str) -> str:
      """도시 이름을 받아 날씨를 알려준다."""
      return f"{city}는 맑음, 22도입니다."

  model_with_tools = model.bind_tools([get_weather])
  ```
- 모델이 도구 호출을 요청했는지에 따라 다음 노드를 다르게 보내려면 `add_conditional_edges`를 쓴다. 조건 함수는 상태를 보고 다음 노드 이름(문자열)을 반환한다.
  ```python
  from langgraph.prebuilt import ToolNode

  def should_continue(state: AgentState):
      last = state["messages"][-1]
      return "tools" if getattr(last, "tool_calls", None) else END

  builder.add_node("tools", ToolNode([get_weather]))
  builder.add_conditional_edges("llm", should_continue, {"tools": "tools", END: END})
  builder.add_edge("tools", "llm")   # 도구 실행 후 다시 모델에게 돌아가 결과를 정리시킨다
  ```
- 처음부터 직접 구현하지 않고 표준 ReAct 패턴을 바로 쓰고 싶다면 `langgraph.prebuilt.create_react_agent`로 같은 구조를 한 줄에 만들 수 있다. 학습 목적이라면 5단계 방식으로 먼저 직접 만들어 흐름을 이해한 뒤, 실전에서는 `create_react_agent`로 넘어가는 것을 권장한다.

## 산출물

- 모델이 필요하면 도구를 호출하고, 도구 결과를 받아 다시 모델이 정리해서 답하는 루프가 있는 그래프.

## 체크리스트
[ ] `@tool`로 도구 함수를 하나 만들고 `bind_tools`로 모델에 연결한다.
[ ] `add_conditional_edges`로 "도구 호출 여부"에 따라 분기되는지 확인한다.
[ ] 도구가 실제로 필요한 질문(예: "서울 날씨 어때?")과 필요 없는 질문을 각각 넣어 두 경로가 모두 동작하는지 확인한다.

---

# 6 단계: 체크포인터로 대화 기억시키기

## 규칙

- 대화를 이어가려면(같은 세션에서 이전 메시지를 기억) `compile()` 시점에 체크포인터를 지정한다. 학습·프로토타입 단계에서는 메모리 저장소로 충분하다.
  ```python
  from langgraph.checkpoint.memory import MemorySaver

  graph = builder.compile(checkpointer=MemorySaver())
  ```
- 어떤 대화인지 구분하려면 `thread_id`를 `config`로 넘긴다. 같은 `thread_id`로 여러 번 `invoke`하면 이전 상태가 이어진다.
  ```python
  config = {"configurable": {"thread_id": "user-1"}}
  graph.invoke({"messages": [{"role": "user", "content": "내 이름은 민수야"}]}, config)
  graph.invoke({"messages": [{"role": "user", "content": "내 이름이 뭐라고 했지?"}]}, config)
  ```
- 재시작 후에도 대화가 남아 있어야 한다면 `MemorySaver` 대신 `SqliteSaver`(로컬 파일)나 `PostgresSaver`(운영 배포)로 바꾼다. 코드 구조는 동일하고 체크포인터 객체만 바뀐다.

## 산출물

- `thread_id`별로 대화 맥락이 유지되는 그래프.

## 체크리스트
[ ] `MemorySaver`를 붙여 `compile()`한다.
[ ] 같은 `thread_id`로 두 번 연속 `invoke`해서 이전 대화를 기억하는지 확인한다.
[ ] 다른 `thread_id`로 호출했을 때는 대화가 섞이지 않는지 확인한다.

---

# 7 단계: 그래프 시각화하고 로컬에서 관찰하기

## 규칙

- 그래프 구조를 그림으로 확인하려면 Mermaid로 렌더링한다.
  ```python
  graph.get_graph().draw_mermaid_png(output_file_path="graph.png")
  ```
- 실행 과정을 노드 단위로 눈으로 보고 싶다면 `langgraph dev`로 로컬 개발 서버(LangGraph Studio)를 띄운다. 프로젝트 루트에 `langgraph.json`으로 그래프 진입점을 지정해야 한다.
  ```json
  {
    "graphs": { "agent": "./agent.py:graph" },
    "env": ".env"
  }
  ```
  ```
  langgraph dev
  ```
- 각 호출에서 어떤 노드가 실행됐고, 모델에 어떤 프롬프트가 들어갔는지 상세히 추적하고 싶다면 LangSmith 연동을 켠다(`LANGSMITH_API_KEY`, `LANGSMITH_TRACING=true` 환경 변수 설정).

## 산출물

- 그래프 구조 이미지(`graph.png`) 또는 `langgraph dev`로 접속 가능한 로컬 Studio 화면.

## 체크리스트
[ ] `draw_mermaid_png()`로 그래프 구조 이미지를 한 번 생성해 본다.
[ ] `langgraph.json`을 작성하고 `langgraph dev`를 실행해 로컬 Studio에 접속한다.
[ ] Studio(또는 LangSmith)에서 5단계 도구 호출 분기가 실제로 어떻게 실행됐는지 추적해 본다.
