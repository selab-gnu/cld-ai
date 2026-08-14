# 개념

# 0 단계: 사전 준비

- [ ] Amp CLI 또는 Claude Code(`npm install -g @anthropic-ai/claude-code`)가 설치·인증되어 있음
- [ ] `jq`가 설치되어 있음 (`brew install jq`)
- [ ] 작업할 프로젝트가 git 저장소로 초기화되어 있음 (`git init` 완료, 커밋 가능한 상태)
- [ ] 이미 작은 예제로 Ralph를 1회 이상 돌려본 경험이 있음 (사용자 확인됨)

# 1 단계: `prd`, `ralph` 스킬을 전역으로 설치하기

이미 아래 명령어를 실행하려는 상태이므로, 그대로 진행하면 됩니다.

```bash
cp -r /tmp/ralph/skills/prd ~/.claude/skills/
cp -r /tmp/ralph/skills/ralph ~/.claude/skills/
```

## 규칙
> 참고: 저장소 README 기준 공식 경로는 `skills/prd`, `skills/ralph`(저장소 루트 기준)입니다. `/tmp/ralph`는 저장소를 clone한 위치이므로, 실제로는 본인이 `git clone https://github.com/snarktank/ralph /tmp/ralph`으로 받아둔 경로와 일치해야 합니다.
> 이 스킬들은 **프로젝트별이 아니라 전역(`~/.claude/skills/`)**으로 설치됩니다. 즉 한 번 설치하면 이후 모든 프로젝트에서 재사용 가능합니다.
> Claude Code 마켓플레이스 방식(`/plugin marketplace add snarktank/ralph` → `/plugin install ralph-skills@ralph-marketplace`)을 쓴다면 이 수동 복사는 생략해도 됩니다. 둘 중 하나만 하면 됩니다.

### 산출물
- `~/.claude/skills/prd/`
- `~/.claude/skills/ralph/`

### 체크리스트
- [ ] `ls ~/.claude/skills/` 실행 시 `prd`, `ralph` 폴더가 보임
- [ ] Claude Code를 새로 열었을 때 "create a prd" 같은 표현에 스킬이 자동으로 반응함 (또는 `/prd` 커맨드 사용 가능)

# 2 단계: 

## 규칙

## 산출물

## 체크리스트
[ ] 확인한다.


# 3 단계: 

## 규칙

## 산출물

## 체크리스트
[ ] 확인한다.


# 4 단계: 

## 규칙

## 산출물

## 체크리스트
[ ] 확인한다.


# 5 단계: 

## 규칙

## 산출물

## 체크리스트
[ ] 확인한다.

# 6 단계: 

## 규칙

## 산출물

## 체크리스트
[ ] 확인한다.

