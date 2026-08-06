# 로컬 저장 명세

## 원칙

- 데이터는 현재 기기에만 저장한다.
- 저장 실패 시 앱의 핵심 검사는 계속 가능해야 한다.
- 저장 데이터에는 `version`을 포함한다.
- 민감정보나 불필요한 개인정보를 저장하지 않는다.

## 제안 타입

```ts
export type LocalProfile = {
  version: number;
  createdAt: string;
  updatedAt: string;
  latestAssessment?: AssessmentSummary;
  assessmentHistory: AssessmentSummary[];
  dailyResults: Record<string, DailyResult>;
  settings: {
    hapticsEnabled: boolean;
    soundEnabled: boolean;
  };
};
```

## 요구사항

- 안전한 JSON parse
- 잘못된 데이터 감지 시 기본값 복원
- 버전 마이그레이션 함수
- 기록 개수 제한
- 초기화 전 확인 모달
- 앱 삭제 또는 데이터 삭제 시 복구 불가 안내
