# 제품 명세 — 쓸능검

## DAILY Ability 의미

DAY 1은 절대 Ability baseline을 만든다. DAY 2~6은 절대 Ability를 다시 평가하지 않고 reference 대비 challenge 조건에서 얼마나 흔들리는지를 baseline에 최대 ±8 modifier로 반영한다. DAY 6는 spread를 reference, clustered를 challenge로 삼는 Focus supporting modifier를 사용하며 여섯 번째 Ability를 만들지 않는다.

## 제품 정의

`쓸능검`은 Apps in Toss용 비게임 행동 기반 검사 앱이다. 사용자가 실제 행동 검사를 수행하면 일상에 거의 쓸모없는 능력을 실제 수치로 분석하고, 서로 다른 로컬 날짜에 짧은 추가 검사를 이어가며 7번째 분석일에 개인 쓸능검 사용설명서를 완성한다.

- Brand: `쓸능검`
- Descriptor: `쓸데없는 능력 정밀검사`
- Internal project codename/path: `hachannyeok`

서버, 외부 DB, 로그인은 사용하지 않는다. DAY는 연속 출석일이 아니라 유효 검사를 완료한 분석일 순서다. 방문을 놓쳐도 손실이 없고 같은 로컬 날짜에 여러 분석일을 완료할 수 없다.

## 핵심 가치와 시간 규격

- 질문형 테스트가 아닌 행동 측정형 검사
- 실제 raw evidence에 근거한 결정적 결과
- 첫날만으로 완결된 기본 분석
- 추가 방문마다 새로운 조건에서 확인되는 자기 정보
- 제품 카피의 DAY 1 예상 시간: `약 90초`
- 내부 QA의 DAY 1 완주 목표: 90~120초
- DAY 2~6: 각 10~20초, DAY 7: 15~20초

재방문 보상은 코인·포인트·출석 보상이 아니라 새롭게 확인되는 측정 근거와 해석이다.

## DAY 1 — 표준 조건 baseline

DAY 1은 단순하고 반복 가능한 표준 조건에서 5개 능력의 baseline을 확보한다.

| 능력 | DAY 1 조건 | 핵심 측정 |
| --- | --- | --- |
| 시간 감각 | 방해 없는 동일 조건, 목표 3초, 3회 | absolute error, signed error, consistency. early/late는 기본 경향만 산출 |
| 중심 인지 | 장식과 시각적 유도가 없는 기본 도형 | normalized center error, x/y 기본 편향, consistency |
| 균형 분배 | 세로 2등분 1회 + 가로 2등분 1회 | two-way distribution error, 방향 편향 |
| 손가락 통제 | 예측 가능한 일정 속도의 움직임 | normalized stop error, early/late 기본 경향, consistency |
| 시각 집중 | 기본 탐색 과제 | accuracy, correct-response time |

DAY 1에는 3등분, 장식 조건, 갑작스러운 속도 변경, 순간 위치 기억을 넣지 않는다. 상황 변화에 따른 편향이나 통제 저하는 DAY 2~6에서 별도 raw evidence로 측정한다.

DAY 1 결과는 기본 종합점수, 5개 능력치, 기본 유형, 대표 자격 2~3개, 실제 측정값, 강점과 보완 영역, 기본 사용설명서 및 공유 결과를 포함한다. 추가 분석을 하지 않아도 미완성 결과처럼 보이지 않아야 한다.

## DAY 2~6 — baseline과 다른 신규 근거

| 분석일 | 목적과 조건 | 신규 raw evidence | 대표 해석 예 |
| --- | --- | --- | --- |
| DAY 2 | 목표 3초 plain 2회 + distracted 2회 | condition별 mean absolute error, distraction delta, signed shift | `주변 자극이 있을 때 시간을 더 빠르게 판단하는 편입니다.` |
| DAY 3 | plain 1회 + decoratedLeft 1회 + decoratedRight 1회 | decorated center shift, directional bias, bias magnitude | `오른쪽 장식에 시선이 끌리면 중심도 평균 4.2% 이동합니다.` |
| DAY 4 | 두 구분선 3등분 2회 | three-way distribution error, largest/smallest/terminal segment bias | `셋으로 나눌 때 마지막 영역을 작게 잡는 편입니다.` |
| DAY 5 | predictable 2회 + surprise 2회 | control degradation under surprise, reaction lead/lag, error delta | `갑작스러운 변화에서 평균 13% 빨리 반응합니다.` |
| DAY 6 | 위치 3개 표시/회상 trial 2회 | spatial memory accuracy, directional forgetting bias, response time | `왼쪽 위치를 기억할 때 오차가 더 작습니다.` |

DAY 6는 spread A `(.22,.28),(.72,.30),(.50,.72)`와 clustered B `(.34,.38),(.62,.42),(.48,.66)`를 전체 attempt index로 A/B/A/B/A 순서로 사용한다. 각 trial은 1200ms 노출, 300ms blank 뒤 정답을 숨긴 채 세 위치를 선택한다.

DAY 6 evidence는 최종 분석에서 focus의 보조 evidence로만 사용한다. `memory`라는 여섯 번째 Ability Score를 만들지 않는다.

### DAILY 완료 결과 계약

모든 DAY 2~6 완료 화면은 실제 결과 변화 개수와 무관하게 다음 세 부분을 항상 보여준다.

1. 새로운 측정 근거
2. 그 근거에 대한 해석
3. 기존 baseline과의 관계

예: `방해 조건 시간 오차 +0.18초` → `주변 자극이 있을 때 조금 빠르게 판단합니다.` → `기본 시간 감각 점수 변화 없음`.

점수, 유형, 자격은 계산 결과가 각 임계값을 넘을 때만 변경한다. 바뀌지 않았다면 `점수는 그대로지만 새로운 경향이 확인됐습니다.`처럼 그대로 표시한다. 단일 DAILY가 DAY 1 전체 결과를 덮어쓰지 않는다.

## DAY 7 — 적응형 최종 보정 검사

DAY 7은 선택형 분석이 아니라 15~20초의 **적응형 최종 보정 검사**다. DAY 1~6의 evidence confidence를 ability별 `(evidenceCoverage, conditionCoverage, stability availability/stability)` 우선순위 tuple로 비교하여 근거 신뢰도가 가장 낮은 능력 하나만 추가 검증한다. evidenceCoverage 분모는 선택 전 Ability별 minimum valid evidence(time 5, center 5, balance 4, control 5, focus 4)이며 초과 valid retry는 이득을 주지 않는다. 임의 가중합을 쓰지 않고 모든 능력을 다시 측정하지 않는다.

동률은 evidence coverage, condition coverage, stability 근거 없음 우선, 둘 다 근거가 있으면 낮은 stability, 마지막 `time → center → balance → control → focus` 순서로 결정한다. 선택 ability별 assessment는 time 3회(최소 2, distracted 1 필수), center 3회(전부 유효), balance 2회(전부 유효), control 3회(최소 2, surprise 1 필수), focus 2회(전부 유효)로 고정한다. 선택한 능력과 assessment type, raw result를 저장한다. 선택 Ability 점수만 preFinal 80% + final equivalent 20%, preFinal 대비 최대 ±6으로 최종 보정하며 다른 점수는 유지한다.

DAY 7 결과에는 누적 데이터에서만 만들 수 있는 다음 독점 보상을 포함한다.

- Most Stable Ability(비교 근거가 없으면 insufficient-evidence fallback)
- Most Condition-Sensitive Ability(후보 없음/뚜렷한 저하 없음 fallback 포함)
- 추가 분석에서 가장 긍정적으로 보정된 능력(Most Positively Updated Ability)
- 서로 다른 날짜·조건의 evidence를 결합한 대표 Cross Insight 최대 2개(근거가 없으면 0개와 fallback)

Cross Insight 예: `평소에는 정확하지만 방해 조건에서 가장 크게 흔들리는 능력은 시간 감각입니다.` DAY 1 결과를 단순 재포장한 문장은 Cross Insight로 세지 않는다.

## 사용자 표시용 분석 단계

분석 진행은 퍼센트나 `분석 정확도`로 표시하지 않는다.

- DAY 1 완료: `기본 분석 완료`
- DAY 2~6 완료: `심화 분석 1/5`부터 `심화 분석 5/5`
- DAY 7 가능: `최종 분석 준비 완료`
- DAY 7 완료: `최종 분석 완료`

## 홈 STATE A~F

STATE는 저장 값이 아니라 persisted raw records와 현재 `LocalDateKey`에서 파생한다. DAY 6 완료 당일은 D이며 다음 유효 날짜에 E가 된다. 우선순위의 단일 계약은 `STORAGE_SPEC.md`를 따른다.

| 상태 | 홈 Primary CTA |
| --- | --- |
| A — baseline 없음 | `정밀검사 시작` 또는 checkpoint가 있으면 `검사 이어하기` |
| B — DAY 1 완료 당일 | `기본 분석서 보기` |
| C — 다음 DAILY 가능 | `오늘의 추가 분석` |
| D — 오늘 분석 완료 | `업데이트된 분석서 보기` |
| E — DAY 7 가능 | `최종 분석 시작` |
| F — DAY 7 완료 | `최종 사용설명서 보기` |

## 공유 → 신규 유입 제품 계약

흐름은 `DAY 1 결과 → 결과 공유 → 수신자가 콘텐츠 확인 → Apps in Toss 쓸능검 진입 → 최초 사용자 DAY 1 시작 화면 → Primary CTA 나도 측정하기`다.

공유 콘텐츠는 대표 자격, 유형, 실제 수치 2개, 짧은 해석, CTA를 포함한다. 구현 단계에서 Apps in Toss 공식 문서와 SDK 타입으로 share API, app entry URL, deep link 및 parameter 전달 가능 여부를 검증한다.

- 공식 진입 링크가 지원되면 링크를 포함한다.
- parameter landing이 지원되면 shared-entry 전용 landing을 사용할 수 있다.
- 지원되지 않으면 일반 앱 홈으로 진입하되 최초 사용자에게 `나도 측정하기`를 즉시 보여준다.
- 링크를 넣을 수 없는 채널은 텍스트/이미지 fallback을 제공한다.

서버가 없으므로 친구 결과 자동 조회, 상대 결과 서버 매칭, 지속적 친구 비교, 실제 친구 랭킹은 지원하지 않는다.

## 재검사와 데이터 초기화

invalid trial은 assessment별 target과 minimum valid 조건을 채우기 위해 한도 안에서 다시 시도할 수 있다. 중단된 DAY 2~7 short assessment는 completion record 없이 assessment 전체를 다시 시작한다. MVP에서는 DAY 1 완료 후 baseline re-assessment/overwrite나 부분 재검사를 제공하지 않는다. 처음부터 다시 하려면 `Settings / 데이터 초기화 → 확인 → 앱의 전체 로컬 기록 삭제 → STATE A` 흐름만 사용한다.

각 assessment는 minimum valid를 일찍 충족해도 먼저 최소 `targetTrialCount` attempt를 모두 실행한다. 이후 minimum valid/condition minimum이 부족할 때만 한 번에 한 attempt씩 retry하고, 조건을 충족하는 즉시 완료한다. 시도 한도는 provisional `MAX_TRIAL_ATTEMPTS_PER_ASSESSMENT = targetTrialCount + 3`이며 한도에서도 조건을 만족하지 못하면 `assessmentIncomplete`로 종료하고 영속 completion record를 저장하지 않는다.

## MVP 필수 및 제외 범위

필수 범위는 상태별 홈, DAY 1 검사와 기본 결과, DAY 2~6 신규 evidence, DAY 7 적응형 보정과 최종 리포트, 공식 지원 범위 내 공유, 버전이 있는 기기 로컬 저장, 중복 방지·재개·재시도·전체 초기화다.

서버, 외부 DB, 로그인, 온라인 랭킹, 친구 관계·전적·비교, 결제, 광고, 게시판, AI 호출, 랜덤 유형, 가짜 백분위, 코인·포인트·캐릭터 성장, 연속 출석 보상은 제외한다.
