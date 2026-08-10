# 진행 상태

## 현재 단계

- 단계 번호: 2.5
- 단계 이름: 7일 누적 분석 제품 재설계
- 상태: done — 제품·화면·저장·점수·카피·디자인 문서를 7개 분석일 구조로 확정. 기능 코드는 수정하지 않음

## 완료

- **1단계**: Apps in Toss SDK 3.x 채택 및 `@apps-in-toss/web-framework@3.0.2` 고정
- **2단계**: React 18.3.1 최소 기반, ESLint/Vitest, Vite/devtools unplugin, typecheck/lint/test/build 파이프라인 구성
- **2단계 Codex 최종 검수**: Critical 0건, Major 0건, Minor 문서 불일치 3건 정리 완료
- **2.5단계 제품 재설계**: 기존 1회성 검사 구조를 DAY 1 종합검사 → DAY 2~6 추가 분석 → DAY 7 최종 분석 구조로 문서에 반영
- `docs/PRODUCT_SPEC.md`: 제품 정의, 7일 의미, 각 분석일 결과, 상태 머신, 재방문·공유·제외 범위 확정
- `docs/SCREEN_SPEC.md`: STATE A~F 홈 CTA, DAY 1 기본 결과, 추가 분석, 최종 사용설명서, 오류·빈 상태 확정
- `docs/STORAGE_SPEC.md`: `schemaVersion`, 사용자 상태, baseline/current 데이터, daily 기록, 날짜·중복·중단·실패·손상·마이그레이션 계약 확정
- `docs/SCORING_SPEC.md`: DAY 1 baseline 보존, 관련 능력만 증분 업데이트, 유형 안정성, DAY 7 최종 분석 원칙 확정
- `docs/COPY_GUIDE.md`: 자기 발견 중심 재방문 카피와 출석·손실 압박 금지 확정
- `docs/DESIGN_SYSTEM.md`: 누적 분석에 필요한 문서상 컴포넌트 개념 추가

## 확정된 제품 방향

- Apps in Toss용 비게임 행동 기반 검사 앱
- 서버, DB, 로그인, 랭킹, 친구 전적 없음
- DAY 1은 약 90초의 종합검사이며 그 자체로 완결된 기본 분석 제공
- DAY 2~6은 서로 다른 로컬 날짜에 하루 하나의 10~20초 추가 분석 제공
- DAY 7은 최종 분석과 최종 하찮력 사용설명서 제공
- DAY는 연속 달력 출석이 아니라 완료한 분석일 순서이며 놓친 날의 손실 없음
- 재방문 보상은 포인트가 아니라 새롭게 확인되는 자기 정보
- 포인트, 코인, 캐릭터 성장, 연속 출석 보상, 승패, 랜덤 결과 금지

## 현재 소스 상태

- `src`에는 React 최소 기반만 존재
- `App.tsx`는 placeholder
- 홈 UI, 검사, 점수 엔진, Storage, 공유, 7일 누적 분석 기능은 아직 미구현
- 2.5단계에서는 소스·패키지·빌드 설정을 수정하지 않음

## 현재 문제와 제약

- TDS 미설치 — 실제 UI 착수 시 실사용 컴포넌트 기준으로 최소 도입
- 브랜드 색상은 `apps-in-toss.config.ts`의 `#3182F6`과 문서의 `#5B8DEF`가 아직 불일치
- `typescript-eslint@8.66.0`은 TypeScript `<6.1.0` peer 범위이므로 TypeScript 업그레이드 시 재확인 필요
- `@vitejs/plugin-react@6.0.5` 설치에 `--legacy-peer-deps`를 1회 사용했으며 지속 설정과 `.npmrc`는 없음
- `hachannyeok.ait`는 `ait build`가 생성하는 Apps in Toss 배포용 번들이며 `*.ait`는 `.gitignore`로 제외
- `ait build`가 출력하는 `deploymentId`의 정확한 네트워크 의미는 공식 근거 미확인
- 서버가 없으므로 기기 변경·앱 데이터 삭제 후 기록 복구나 동기화를 제공할 수 없음

## 다음 작업

### 3단계 — 공통 측정·저장·세션 계약 구현

코드로 먼저 고정할 계약:

1. `AbilityScores`, `MetaTraits`, raw trial, invalid trial 타입
2. DAY 1 baseline과 DAY 2~6 증분 측정 레코드
3. `UserState` STATE A~F 파생 함수와 화면 전환 상태
4. 로컬 날짜 키, 하루 중복 방지, 분석일 순서 결정 함수
5. Apps in Toss Storage 비동기 어댑터와 `schemaVersion` 마이그레이션 골격
6. 저장 실패 시 메모리 유지, 중단·재개, idempotent 완료 저장 계약
7. 좌표 정규화, 시간 측정, 백그라운드 무효화 계약

3단계에서는 UI나 개별 검사 완성을 앞당기지 않고 공통 계약과 단위 테스트를 우선한다.

## 마지막 검증

- 2단계 코드 검증: typecheck/lint/test/build:web/build:ait/build 모두 통과
- 2.5단계: 문서 전용 변경
- `git diff --check`: 통과

## 마지막 커밋

- hash:
- message:
