# 44.0 Simulated First-User Audit

## 판정

**B — 매우 강하지만 3개의 targeted polish point가 남아 있음**

- Simulated personas: **5**
- Human participants: **0**
- Validation status: **NOT HUMAN-VALIDATED**
- Product source changes: **0**

이 문서는 실제 사용자 인터뷰 결과가 아니다. 현재 앱의 실제 렌더링, 상태 fixture, 화면 문구, CTA 분기와 테스트를 근거로 서로 다른 첫 사용자 행동을 시뮬레이션한 사전 감사다. 인용문과 사용자 발화 수치는 만들지 않았다.

## 실행 범위와 근거

- 기존 `artifacts/first-user-33.0/qa.html` 및 `qa-entry.tsx`를 그대로 재사용했다.
- 실제 `App`, `MemoryStorageAdapter`, DAY1~6 fixture를 연결한 `fresh/basic/day2/day3/day4/day5/day6/day7` 8개 상태를 Vite에서 실행했다.
- Windows Chrome headless, 390×844 viewport로 각 HOME 상태를 캡처했다. 캡처는 `screenshots/`에 있다.
- HOME/INTRO의 실제 raster source, DAY1 Basic, DAY2~6 ready/running/result, DAY7 calibration, Final report의 렌더 코드와 테스트를 교차 확인했다.
- 브라우저 캡처는 상태별 HOME의 실제 layout/CTA 확인에 사용했다. 이후 검사 전 과정을 실제 시간으로 자동 플레이한 것이 아니므로 motion timing과 실제 피로도는 human validation 대상으로 남긴다.

## 합성 결과

| 항목 | Simulated result | 해석 |
|---|---:|---|
| HOME 이해 | 4.2 / 5 | “쓸데없는 능력을 정밀 측정하는 재미형 검사”와 시작 CTA는 즉시 읽힘 |
| 7일 구조 이해 | 1.8 / 5 | 보이는 HOME/INTRO에는 90초·5개 검사만 있고 7일 설명은 숨김 접근성 요약에만 존재 |
| DAY1 재미 | 4.0 / 5 | 짧고 조작이 바뀌는 5개 검사라 리듬이 좋음 |
| DAY1 피로 | 1.8 / 5 | 짧지만 결과 피드백을 꼼꼼히 읽는 사용자는 체감 시간이 늘 수 있음 |
| Basic이 Final처럼 느껴짐 | 4 / 5 personas | 상단의 큰 점수·프로필·자격 인증이 완결감을 먼저 만들고 `DAY 1 / 7`은 하단에 있음 |
| DAY2~6 반복감 | 2.3 / 5 | DAY3/5/6 signature가 강하고 결과 비교가 달라 전체 반복감은 낮음 |
| DAY7 목적 이해 | 4.6 / 5 | DAY 1–6 누적, 선택 능력 1개, 다음 단계 Final이 한 화면에서 명확함 |
| Final 보상감 | 4.7 / 5 | 완주 선언, 보정 요약, Change Map, 장별 구조와 공유 카드가 충분히 최종답게 읽힘 |
| Change Map 이해 | 5 / 5 personas (simulated) | DAY 1→FINAL, signed delta, DAY7 badge의 의미가 빠르게 해석됨 |
| Share 의향 | 3.7 / 5 | 결과 카드 품질은 높으나 저관심 사용자는 긴 보고서 끝까지 내려갈 가능성이 낮음 |
| Icon 제품 적합성 | 4.4 / 5 | 정밀 계측기/인증서 톤과 일치. 작은 크기 세부는 이전 32.1 QA 범위 |

점수는 관찰값이 아니라 persona별 예상 반응을 일관된 척도로 합성한 값이다.

## 핵심 판단

첫 화면의 재미·브랜드·CTA는 강하다. 문제는 제품이 무엇인지보다 **얼마 동안 이어지는 제품인지**다. 실제 보이는 HOME과 INTRO raster에는 `약 90초`, `총 5개 검사`만 강조되어 있어 sighted first user는 DAY1을 전체 제품으로 이해하기 쉽다. DOM의 `.sr-only` 요약에는 7일 설명이 있으나 시각 사용자에게는 보이지 않는다.

DAY2 이후에는 HOME progress card와 날짜별 discovery가 구조를 잘 복구한다. DAY3의 시각 유도, DAY5의 variable motion, DAY6의 observe→clear→recall, DAY7 seal/calibration은 날짜별 얼굴을 만든다. Final은 7일 검증 결과라는 설명력이 충분하며 Change Map이 특히 빠르게 작동한다.

## 우선 개선안 (최대 5개)

1. **P1 · INTRO에 7일 구조를 눈에 보이게 추가**  
   `DAY 1 기본 분석 → DAY 2–6 하루 한 조건 → DAY 7 최종 보정`을 시작 버튼 위의 한 줄/3단계 strip으로 노출한다. 숨김 요약의 문구를 시각 presentation에도 반영하는 작은 변경이다.
2. **P1 · Basic hero에서 1차 결과임을 즉시 고정**  
   큰 종합 점수 위나 바로 아래에 `DAY 1 / 7 · 첫날 기준점`을 배치한다. 현재 하단 discovery card까지 내려가야 1/7을 알 수 있어 skimmer에게 늦다.
3. **P1 · DAY5 조건명을 측정 중에는 중립화**  
   running 화면의 `SURPRISE`, `PREDICTABLE`, `변속 조건`, `예측 조건`을 `측정 1/4` 같은 중립 표기로 바꾸고, 조건명은 result에서 공개한다. 현재 문구는 사용자의 예상과 멈춤 전략을 바꿀 수 있다.
4. **P2 · Returning HOME의 `evidence`를 한국어로 통일**  
   `DAY 1~6 누적 측정 근거`가 비기술 사용자에게 더 즉시 읽힌다.

## Human validation handoff

실제 사용자 3~5명에게는 기존 33.0 moderator를 그대로 사용하되 아래를 우선 확인한다.

1. INTRO 직후 “오늘 끝나는 검사인가, 7일 이어지는 검사인가?”를 설명 없이 묻는다.
2. Basic hero 10초 관찰 후 “최종 결과인가, 첫날 결과인가?”를 묻고 `DAY 1 / 7`까지 자발적으로 스크롤했는지 기록한다.
3. DAY5 running에서 조건 label을 읽은 뒤 멈춤 전략이 달라졌는지 묻는다.
4. Final 첫 30초 동안 Change Map과 share 도달 순서를 기록한다.

목표 기준은 HOME/7일 이해 ≥4.0, Basic Final 오인 ≤20%, DAY2~6 반복감 ≤2.5, Final 보상감 ≥4.3, Change Map 이해 ≥80%다.

## Verification

최종 명령 결과는 문서 작성 후 갱신했다.

- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm test`: PASS
- `git diff --check`: PASS
- Before/after product diff: IDENTICAL (44.0은 이 디렉터리의 감사 산출물만 추가)

