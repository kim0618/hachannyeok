# 점수 및 결과 엔진 명세

## 공통 원칙

- 모든 능력 점수는 0~100 범위다.
- 실제 백분위처럼 표현하지 않는다.
- 점수는 한 번의 최고 기록만으로 결정하지 않는다.
- 정확도와 일관성을 기본 축으로 사용한다.
- 사용성 테스트 전 점수 계수는 임시값임을 코드 주석으로 표시한다.
- 원시 측정값을 별도로 보존한다.

## 공통 타입

```ts
export type AbilityScores = {
  time: number;
  center: number;
  balance: number;
  control: number;
  focus: number;
};

export type MetaTraits = {
  accuracy: number;
  consistency: number;
  speed: number;
  adaptability: number;
};
```

## 시간 감각

입력:
- 목표 시간(ms)
- 3회 실제 시간(ms)

산출:
- 각 회차 signed error
- 평균 절대 오차
- 표준편차 또는 변동성
- early / late / neutral 편향
- accuracy score
- consistency score
- total score

권장 가중치:
- 정확도 70%
- 일관성 30%

## 중심 인지

입력:
- 컨테이너 정규화 너비·높이
- 실제 중심 좌표
- 사용자 터치 좌표

산출:
- 대각선 길이 대비 거리 오차율
- x/y 편향
- 여러 회차 일관성

## 균형 분배

입력:
- 사용자가 선택한 분할 위치
- 목표 비율

산출:
- 비율 절대 오차
- 방향 편향
- 2등분과 3등분 성능 차이

## 손가락 통제

입력:
- 목표 위치
- 정지 위치
- 속도 단계

산출:
- 정규화 위치 오차
- 속도별 정확도
- early/late 경향
- 회차 일관성

## 시각 집중

입력:
- 정답 여부
- 반응 시간
- 난도

산출:
- 정확도
- 정답 시 반응시간
- 난도 상승에 따른 변화

## 종합점수

초기 권장:

```text
(time + center + balance + control + focus) / 5
```

사용성 테스트 후 조정 가능하지만 특정 능력에 과도한 가중치를 주지 않는다.

## 유형 판정

다음 조합으로 결정한다.

- 최고 능력
- 최저 능력
- 가장 강한 메타 특성
- 필요 시 편향 특성

유형 판정은 순수 함수로 작성하고 테스트한다.
