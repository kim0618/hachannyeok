# 디자인 시스템

## 브랜드 성격

- 정밀함
- 쓸데없음
- 건조한 유머
- 깨끗한 실험실/보고서 감성
- 토스 앱 안에서 튀지 않는 모바일 UI

## 기본 컬러

- Primary Navy: `#141E30`
- Background: `#F5F7FA`
- Surface: `#FFFFFF`
- Accent Blue: `#5B8DEF`
- Positive Green: `#6FB870`
- Accent Orange: `#FFB74D`
- Error Red: `#E05C5C`
- Main Text: `#222222`
- Secondary Text: `#5C626E`
- Border: `#E1E5EC`

실제 구현에서는 가능하면 TDS 토큰을 우선하고, 위 색상은 브랜드 표현이 필요한 부분에 제한적으로 사용한다.

## 타이포

- 화면 제목: 24~28px
- 카드 제목: 18~20px
- 본문: 15~16px
- 보조: 12~14px
- 측정 핵심 수치: 28~36px

## 레이아웃

- 모바일 세로 우선
- 좌우 기본 여백 20px
- 카드 간 간격 12~16px
- 섹션 간 간격 24~32px
- 주요 CTA 높이 최소 52px
- 터치 영역 최소 44×44px

## 컴포넌트

- PrimaryButton
- SecondaryButton
- ProgressHeader
- TestInstruction
- MeasurementStage
- TrialIndicator
- MidResultCard
- ScoreBar
- CertificationCard
- ShareResultCard
- AnalysisProgressCard
- TodayAssessmentCard
- NewInsightCard
- AbilityChangeRow
- FinalReportHero
- EmptyState
- ErrorState

## 모션

- 화면 전환 150~250ms
- 결과 수치 카운트업 300~600ms
- 검사 완료 카드 페이드·슬라이드
- 과도한 탄성 애니메이션 금지
