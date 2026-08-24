# 44.0 Issue Matrix

## 분류 원칙

- 실제 사용자 count 대신 `affected simulated personas / 5`를 쓴다.
- severity는 진행 불가, 핵심 제품 이해, 측정 행동 오염, 표현 마찰 순으로 판단했다.
- 사용자 인용문은 없다. Evidence 열은 실제 화면/코드 근거다.

| Priority | Screen | Affected personas | Evidence | User impact | Recommended scope |
|---|---|---:|---|---|---|
| P1 | HOME → INTRO | 5/5 | visible raster는 `약 90초`, `총 5개 검사`만 표시. 7일 설명은 `.sr-only` 요약에만 존재 | 7일 제품을 1회성 90초 검사로 오해, DAY2 재방문 기대 형성 실패 | INTRO 시작 버튼 위에 visible 3-stage 7-day strip 1개 추가 |
| P1 | DAY1 Basic | 4/5 | hero가 큰 overall score, profile, 대표 자격부터 보여주고 `DAY 1 / 7`은 여러 report section 뒤 stage card에 위치 | 첫날 결과를 Final로 받아들여 제품이 끝났다고 느낌 | hero에 `DAY 1 / 7 · 첫날 기준점` chip/bridge 추가 |
| P1 | DAY5 running | 3/5 | 측정 중 `SURPRISE · VARIABLE MOTION`, `PREDICTABLE · STEADY MOTION`, `변속 조건/예측 조건` 노출 | 조건을 예상해 멈춤 전략을 바꾸며 surprise 측정 의도에 영향을 줄 수 있음 | running label은 중립화, condition 이름은 result에서 공개 |
| P2 | DAY7 Returning HOME | 2/5 | 한국어 본문 안에 `DAY 1~6 누적 evidence` 혼용 | 비기술 사용자에게 의미 파악 지연, 완성도 저하 | `누적 측정 근거`로 교체 |

## P0 확인

- 시작 CTA 미발견: 없음
- DAY1/일일 검사 진행 불가: 코드/테스트 기준 없음
- Returning HOME에서 다음 행동 미발견: 없음
- DAY7 선택 목적 반대 이해: 없음
- Final/Share CTA 부재: 없음

## 강점 매트릭스

| Area | Personas | Why it works |
|---|---:|---|
| HOME 브랜드/CTA | 5/5 | 정밀 계측기 metaphor와 단일 primary CTA가 즉시 보임 |
| DAY3 signature | 5/5 | plain/decorated 시각 유도와 중심 비교 diagram이 고유함 |
| DAY6 memory | 5/5 | observe→clear→recall 과정과 reconstruction 결과가 자명함 |
| DAY7 calibration | 5/5 | DAY1–6, selected ability, Final의 인과가 한 화면에 있음 |
| Final Change Map | 5/5 | DAY1→FINAL과 signed delta가 7일 변화를 5초 내 설명 |
| Final premium hierarchy | 5/5 | 완주→보정→변화→패턴→근거→설명서→공유 순서가 보고서답게 작동 |

## 결론

가장 높은 ROI는 새 기능이 아니라 이미 접근성 요약에 존재하는 7일 설명을 실제 시각 UI로 올리는 것이다. 그다음은 Basic의 위계를 `첫날 기준점`으로 앞당기고 DAY5 condition priming을 제거하는 작은 presentation/copy polish다. scoring, storage, schema, unlock, share 또는 navigation 변경은 필요하지 않다.

