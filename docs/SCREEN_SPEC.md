# 화면 명세

## 공통 원칙

- 모바일 세로 및 360×800 뷰포트를 우선한다.
- 한 화면의 visually dominant CTA는 하나뿐이다.
- DAY 1 제품 카피는 `약 90초`, DAY 2~6은 `10~20초`, DAY 7은 `15~20초`다.
- 진행 단계는 문구와 분수로만 표시하며 퍼센트 또는 `분석 정확도`를 사용하지 않는다.
- 연속 출석, 결석 손실, 카운트다운을 암시하지 않는다.

## STATE A와 DAY 1

### 홈

- 헤드라인: `쓸데없는 능력을 정밀하게 측정합니다.`
- 메타: `총 5개 검사 · 약 90초`
- Primary: `정밀검사 시작` (공유로 유입된 최초 사용자는 `나도 측정하기`)
- 유효 checkpoint가 있으면 Primary: `검사 이어하기`
- 결과가 없을 때 `내 분석서 보기`는 노출하지 않는다.
- 현재 기기 저장 안내를 표시한다.

### 검사 안내

- 5개 baseline 검사와 표준 조건, 예상 시간 안내
- 실제 행동값으로 분석한다는 설명
- 중단 시 마지막 완료 검사 checkpoint부터 재개한다는 안내
- 진단 경계 문구: `재미를 위한 행동 측정 결과이며, 의학·심리 진단이 아닙니다.`
- Primary: `검사 시작하기`

### 검사 공통

- 상단: `검사 n / 5`
- 검사명, 두 줄 이하 안내, 넓은 interaction 영역, trial 진행 표시
- 다른 메뉴 숨김, 중복 입력 방지
- background/date change 등 invalid trial은 사유를 안내하고 재시도

### 기본 분석 결과

정보 위계는 종합점수, 기본 유형, 대표 자격, 실제 측정값, 강점·보완 영역, 기본 사용설명서, `기본 분석 완료` 순이다. 하단에 진단 경계 문구를 둔다.

CTA 위계:

- Primary: `결과 공유하기`
- Secondary: `상세 분석 보기`
- Tertiary: `홈으로`

baseline을 즉시 덮어쓰는 재검사 버튼은 두지 않는다.

## 상태별 CTA 계약

| 화면/상태 | Primary | Secondary | Tertiary 또는 비고 |
| --- | --- | --- | --- |
| DAY 1 결과 | `결과 공유하기` | `상세 분석 보기` | `홈으로` |
| STATE B | `기본 분석서 보기` | 없음 | 오늘 새 DAILY 없음 안내 |
| STATE C | `오늘의 추가 분석` | `내 분석서 보기` | 없음 |
| STATE D | `업데이트된 분석서 보기` | 결과 공유가 실제로 적절할 때만 `결과 공유하기` | 없음 |
| STATE E | `최종 분석 시작` | `내 분석서 보기` | 없음 |
| STATE F | `최종 사용설명서 보기` | `최종 결과 공유하기` | 없음 |

## DAY 2~6 추가 분석

시작 화면에는 현재 분석일, 확인할 조건별 능력·특성, 10~20초 예상 시간, 완료 후 생길 신규 evidence를 안내하고 `추가 분석 시작`을 Primary로 둔다.

검사 목적은 다음과 같이 DAY 1 baseline과 분리한다.

- DAY 2: 기본/시각 방해 조건에서 시간 안정성 비교
- DAY 3: 같은 도형의 무장식/한쪽 장식 조건에서 중심 이동 비교
- DAY 4: 두 구분선으로 3등분
- DAY 5: 일정 속도 뒤 갑작스러운 속도 변화에서 통제력 저하 측정
- DAY 6: 표시 후 숨긴 위치를 선택하는 순간 위치 기억

고정 trial 구성은 DAY 2 plain 2+distracted 2, DAY 3 plain 1+좌측 장식 1+우측 장식 1, DAY 4 three-way 2, DAY 5 predictable 2+surprise 2, DAY 6 위치 3개 회상 2회다. minimum valid와 condition별 최소치는 `SCORING_SPEC.md`를 따른다.

DAY 4는 orientation/condition 구분이 없는 horizontal 단일 presentation 과제이며 raw에는 `condition`, `orientation`, `stimulusId`, `configId`를 저장하지 않는다. 초기값은 CONFIG_A `0.28/0.72`, CONFIG_B `0.38/0.62`이고 전체 attempt index에 따라 A/B를 반복한다. DAY 4의 conditionMinimum이 없는 것은 의도된 계약이다.

DAY 4 결과 위계는 `DAY 1 2등분 대비 3등분 안정성 → valid trial별/평균 실제 분배 → 마지막 구간 편향 → Balance 점수`다. 마지막 구간 방향 표시는 기존 terminal component normalization과 tendency display threshold를 통과할 때만 사용하며, 평균에서 상쇄가 생기면 valid trial row를 함께 표시한다.

DAY 5는 left-to-right `0.08→0.92` track에서 predictable A, surprise A, predictable B, surprise B를 attempt index로 반복한다. surprise transition에는 색상·텍스트·flash·sound·haptic cue를 추가하지 않고 속도 변화만 노출한다. 결과는 predictable/surprise 평균 정지 오차와 변화가 primary이며 Control 점수는 secondary다.

DAY 6는 spread A `(.22,.28),(.72,.30),(.50,.72)`와 clustered B `(.34,.38),(.62,.42),(.48,.66)`를 attempt index A/B/A/B/A로 반복한다. `READY → EXPOSURE 1200ms → BLANK 300ms → RECALL 3 taps → TRIAL RESULT`이며 fade 없이 target을 제거한다. Recall에는 정답 hint를 표시하지 않고 선택 marker만 표시한다. 마지막 completion attempt도 RESULT를 거친다.

완료 화면은 변화 개수를 강제하지 않고 항상 다음 세 블록을 보여준다.

1. `새로운 측정` — raw 또는 normalized evidence
2. `해석` — 근거 범위 안의 짧은 문장
3. `기존 결과와 비교` — baseline과의 관계, 점수·유형·자격의 변경 또는 유지

DAY 2 결과는 plain/distracted 평균 오차와 차이를 `ms` 단위의 2-column 비교 카드로 먼저 보여준다. 조건 차이가 primary insight이며 Time Ability 점수 변화는 secondary 정보로 둔다. V2 modifier는 조건 차이와 같은 방향을 사용하므로 V1 consistency contradiction 설명은 사용하지 않는다.

임계값을 넘지 않았다면 `점수는 그대로지만 새로운 경향이 확인됐습니다.`라고 표시할 수 있다. STATE D에는 다음 분석이 다른 로컬 날짜에 가능하다는 중립적 안내를 둔다.

## DAY 7 적응형 최종 보정

STATE E 화면은 누적 evidence 요약과 `근거가 가장 불확실한 능력 하나를 15~20초 동안 추가 확인합니다.`라는 설명을 제공한다. 사용자에게 여러 검사 중 선택하게 하지 않는다.

DAY 7은 새 난이도를 만들지 않고 선택 Ability에 해당하는 기존 deterministic config를 재사용한다. Time은 DAY 2 `plain/distracted/plain`, Center는 DAY 3 `plain/left/right`, Balance는 DAY 1 vertical two-way와 DAY 4 CONFIG_A three-way, Control은 DAY 5 Predictable A/Surprise A/Surprise B, Focus는 DAY 1 visual search Config 2와 DAY 6 clustered B를 전체 attempt index로 반복한다. invalid retry도 다음 attempt identity를 사용한다. completion 마지막 attempt도 반드시 TRIAL RESULT와 `결과 보기`를 거쳐 COMPLETE로 이동한다.

최종 사용설명서의 위계:

1. `최종 분석 완료`
2. 최종 유형과 5개 능력치
3. 심화·특급 자격
4. Most Stable Ability 또는 안정성 비교 근거 부족 fallback
5. Most Condition-Sensitive Ability 또는 후보 없음/뚜렷한 조건 민감성 없음 fallback
6. 추가 분석에서 가장 긍정적으로 보정된 능력
7. 근거가 있는 대표 Cross Insight 최대 2개. 0개면 근거 부족 fallback
8. 강점·약점·취급 주의사항과 실제 누적 evidence
9. 진단 경계 문구
10. 최종 공유

## 내 분석서와 설정

내 분석서는 현재 파생 유형·능력치, 분석 단계, traits/insights/자격, raw evidence 요약과 완료 분석일을 보여준다. Settings에는 `전체 데이터 초기화`만 제공한다.

초기화는 확인 후 이 앱의 전체 로컬 기록을 삭제하고 STATE A로 이동한다. 복구 불가를 사전에 알린다. 부분 재검사와 baseline overwrite는 MVP에 없다.

## 공유와 신규 유입

DAY 1 공유 콘텐츠는 대표 자격, 유형, 실제 수치 2개, 짧은 해석, `나도 측정하기` CTA를 포함한다. 공유 카드 또는 텍스트의 적절한 위치에 진단 경계 문구를 넣는다. DAY 7 공유는 누적 evidence와 대표 Cross Insight를 포함해 DAY 1과 구분한다.

공식 share/deep-link 지원은 구현 전 integration gate다. 지원되면 공식 entry link와 가능한 shared-entry parameter를 사용한다. 미지원이면 일반 앱 홈으로 보내며 최초 사용자에게 `나도 측정하기`를 Primary로 보여준다. 링크 불가 채널에는 텍스트/이미지 fallback을 쓴다. 공유 취소·실패 시 현재 결과를 유지한다.

## 오류와 세션 상태

- 저장 실패: 계산 결과를 `computedPendingSave` 메모리에 유지하고 동일 record 저장 재시도 제공
- DAY 2~7 앱 종료: 완료로 기록하지 않고 해당 검사 재시작
- DAY 1 앱 종료: 마지막 저장 checkpoint부터 재개
- 검사 중 로컬 날짜 변경: invalidated 처리하고 `날짜가 변경되어 측정을 다시 시작해 주세요.` 안내
- invalid trial: target/minimum valid를 채우도록 한도 내 추가 시도. 한도 초과 시 `assessmentIncomplete` 안내 후 completion을 저장하지 않고 전체 assessment 다시 시작 CTA 제공
- 중복 완료: 새 결과를 append하지 않고 기존 완료 결과 표시
- 손상 데이터: 안전한 초기화 안내. 신뢰할 수 없는 파생 결과를 보여주지 않음

## DAY 3 deterministic visual stimulus

Attempt index로 `day3-plain-01 → day3-left-01 → day3-right-01`을 반복한다. 좌측 장식은 filled circle `(x,y,r)` 5개 `(0.14,0.24,0.055)`, `(0.22,0.39,0.040)`, `(0.11,0.57,0.040)`, `(0.26,0.70,0.026)`, `(0.17,0.82,0.026)`이며 우측은 `xRight = 1 - xLeft` exact mirror다. plain에는 장식이 없고 중앙 x 0.35~0.65에는 장식을 두지 않는다. animation, border, shadow, gradient는 사용하지 않는다.
# Brand contract

- Brand: `쓸능검`
- Descriptor: `쓸데없는 능력 정밀검사`
- Internal project codename/path: `hachannyeok`
