# 33.0 First-user UX Audit — Moderator Guide

참가자에게 시작 전에 말할 문장은 이것뿐이다.

> 이 앱 한번 처음부터 사용해보고, 이해 안 되는 부분이 있으면 그냥 말해줘.

기능이나 7일 구조를 설명하지 않는다. 막히기 전에는 클릭 위치를 알려주지 않는다. 각 단계에서 관찰을 먼저 끝낸 뒤 질문한다.

## 실행

프로젝트 루트에서 `npm run dev -- --host 127.0.0.1`을 실행한다. 표시된 포트가 5173이면 아래 주소를 사용한다. 다른 포트라면 포트만 바꾼다.

| 범위 | Moderator URL | 시작 상태 |
|---|---|---|
| HOME→DAY1 | `http://127.0.0.1:5173/artifacts/first-user-33.0/qa.html?stage=fresh` | 빈 Memory storage |
| Basic 재관찰 | `...?stage=basic` | DAY1 완료 당일 HOME |
| DAY2 | `...?stage=day2` | DAY2 unlock HOME |
| DAY3 | `...?stage=day3` | DAY3 unlock HOME |
| DAY4 | `...?stage=day4` | DAY4 unlock HOME |
| DAY5 | `...?stage=day5` | DAY5 unlock HOME |
| DAY6 | `...?stage=day6` | DAY6 unlock HOME |
| DAY7→Final | `...?stage=day7` | DAY7 unlock HOME |

각 URL은 production storage가 아닌 독립 Memory storage를 사용한다. production unlock, schema, scoring은 바뀌지 않는다. 참가자에게 query 이름이나 시작 상태 표를 보여주지 않는다.

## 관찰 순서

1. HOME은 5초간 개입하지 않고 CTA 탐색과 앱 성격 추측을 기록한다.
2. INTRO에서 읽는 범위와 7일 구조 이해를 기록한다.
3. DAY1 다섯 검사는 중간 질문 없이 완료하고 재미/피로를 마지막에 묻는다.
4. Basic은 스크롤 도달 지점을 기록한 뒤 완료인지 1차 결과인지 묻는다.
5. DAY2~6은 조작과 조건 차이 인지를 먼저 관찰한 뒤 요청서의 중립 질문을 사용한다.
6. DAY7 선택 이유를 묻고 Final은 30초간 침묵 관찰한다.
7. Change Map, Share, Icon 질문을 마지막에 진행한다.

Critical usability가 아니면 세션 도중 제품을 수정하거나 설명하지 않는다. 동일 지적 인원수가 모인 뒤 P0~P3로 분류한다.
