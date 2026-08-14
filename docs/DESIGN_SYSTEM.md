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

### Final Visual System 토큰

19단계부터 전 화면은 `src/styles.css`의 CSS variables를 단일 source of truth로 사용한다.

- 배경/종이: `--bg-ivory`, `--surface-paper`, `--surface-warm`
- 본문: `--ink-navy`, `--ink-body`, `--ink-muted`
- 계측기: `--emerald-900`, `--emerald-700`, `--emerald-500`, `--mint-200`
- 강조/경계: `--gold-muted`, `--line-soft`, `--grid-soft`, `--danger-muted`
- 형태: `--shadow-soft`, `--shadow-panel`, `--radius-card`, `--radius-panel`, `--radius-cta`

표현 언어는 warm ivory paper 위의 deep navy 계측 결과, emerald instrument panel, 매우 제한적인 gold calibration accent다. 공식 기관 마크를 모사하지 않으며 자격 seal은 `쓸능검` 전용 허구 표식만 사용한다. RUNNING 화면에는 정답을 암시하는 crosshair, midpoint/third guide, proximity cue, target 강조를 추가하지 않는다.

사용자 노출 Brand는 `쓸능검`, Descriptor는 `쓸데없는 능력 정밀검사`이다. `hachannyeok`은 내부 project codename/path로만 유지한다.

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
- AnalysisStageCard
- TodayAssessmentCard
- NewInsightCard
- AbilityChangeRow
- FinalReportHero
- EmptyState
- ErrorState

`AnalysisStageCard`는 `기본 분석 완료`, `심화 분석 n/5`, `최종 분석 준비 완료`, `최종 분석 완료`만 표현한다. 원형 퍼센트, 정확도 게이지, `%` 수치로 과학적 신뢰도를 암시하지 않는다.

한 화면의 visually dominant CTA는 하나만 둔다. Secondary와 Tertiary는 색·면적·위치 위계를 낮추며 Primary와 경쟁하는 filled 스타일을 사용하지 않는다.

## 모션

- 화면 전환 150~250ms
- 결과 수치 카운트업 300~600ms
- 검사 완료 카드 페이드·슬라이드
- 과도한 탄성 애니메이션 금지
