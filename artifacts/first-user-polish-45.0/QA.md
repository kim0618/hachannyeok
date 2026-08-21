# 45.0 Targeted First-User Polish

## HOME

- Before: visible poster는 `약 90초 · 총 5개 검사`만 설명해 DAY1을 전체 제품으로 읽기 쉬웠다.
- After: poster 원본 위에 실제 DOM journey를 추가했다.
- Visible 7-day: `DAY 1 기준 측정 → DAY 2–6 조건 변화 → DAY 7 최종 보정`.
- DAY1의 `약 90초 · 총 5개 검사` 정보와 원본 PNG, CTA 위치·callback은 유지했다.

## INTRO

- 시작 전 첫 visible block에 `DAY 1 기준점 → DAY 2–6 조건 변화 → DAY 7 최종 보정`을 표시한다.
- visible journey가 접근성 트리에도 포함되므로 기존 sr-only의 중복 7일 문장은 제거했다.
- 포스터 원본, Start/Back overlay와 navigation은 유지했다.

## Basic

- Hero 최상단: `BASELINE · 1차 분석` / `DAY 1 / 7`.
- 보조 카피: `오늘은 5가지 기본 능력의 기준점을 만들었습니다. 남은 조건 측정 후 최종 결과가 완성됩니다.`
- Overall, Profile, 대표 자격, 기존 하단 DAY2 teaser는 모두 유지했다.
- Final 전용 completion/calibration/Change Map visual은 Basic에 추가하지 않았다.
- Simulated Final confusion risk: **1.8 / 5** (목표 ≤2.5).

## DAY5

- READY: `움직임이 중간에 달라질 수 있어요.` 안내 유지.
- RUNNING: `MOTION CONTROL / 움직임 통제 측정 / MEASUREMENT IN PROGRESS`로 양 condition을 동일하게 표시.
- RUNNING accessibility label도 condition identity를 포함하지 않는다.
- RESULT: `예측 가능한 움직임` 또는 `갑작스러운 변속` 실제 condition 공개 유지.
- Analysis: predictable/surprise 비교 유지.
- Condition order, config, target, piecewise speed, RAF, timing과 raw condition은 변경하지 않았다.
- RUNNING DOM 금지 문자열: `SURPRISE`, `PREDICTABLE`, `STEADY MOTION`, `VARIABLE MOTION`, `변속 조건`, `예측 조건` 모두 0.
- condition 차이는 실제 movement 외 icon/color/text cue로 구분되지 않는다.

## Terminology

- DAY7 Returning HOME의 `DAY 1~6 누적 evidence`를 `DAY 1~6 누적 측정 근거`로 변경했다.
- decorative English section label과 Final report 구조는 변경하지 않았다.

## Persona Re-QA

| Persona | HOME 7-day | Basic non-final | DAY5 neutral | DAY7 terminology |
|---|---|---|---|---|
| A · 빠른 사용자 | PASS | PASS | PASS | PASS |
| B · 꼼꼼한 사용자 | PASS | PASS | PASS | PASS |
| C · 테스트 콘텐츠 선호 | PASS | PASS | PASS | PASS |
| D · 관심 낮음 | PASS | PASS | PASS | PASS |
| E · UI 초보 | PASS | PASS | PASS | PASS |

- Visible UI만으로 5/5 persona가 7일 구조를 추론 가능.
- Basic은 점수보다 먼저 baseline/day index를 읽을 수 있음.
- DAY5 RUNNING은 현재 condition을 text/accessibility/color/icon으로 사전 식별할 수 없음.
- 이는 simulated re-QA이며 human participants는 0명이다.

## Responsive

- CSS 구조 검토: journey는 `minmax(0,1fr)` 3열, 340px 이하 gap/padding 축소, label nowrap을 사용한다.
- Basic framing은 flex + nowrap day indicator이며 340px copy 축소가 있다.
- DAY5 running layout width 계약은 기존 track/signature 구조를 유지한다.
- 360×800 / 390×844 / 412×786 실제 Chrome 재캡처: **NOT RE-RUN — Chrome/Vite 실행 승인이 사용량 한도로 거절됨**.
- 따라서 horizontal overflow 0은 automated browser evidence가 아니라 CSS/source review 상태이며, 다음 browser-capable session에서 이 QA harness를 사용해야 한다.

QA URL:

- `...?view=home`
- `...?view=intro`
- `...?view=basic`
- `...?view=day5-predictable`
- `...?view=day5-surprise`

## Validation

- Targeted tests: PASS
- Typecheck: PASS
- Lint: PASS (warnings 0)
- Full test: PASS — 81 files / 439 tests
- `build:web`: PASS
- `build:ait`: PASS
- Combined `npm run build`: PASS
- `git diff --check`: PASS

## Final

**A — 44.0 HIGH ROI 문제 해결 → 로컬 UX freeze**

단, 위 A는 코드·DOM·자동 테스트 기준이다. Responsive browser capture는 위 제한 때문에 별도 실기 확인이 남아 있다.
