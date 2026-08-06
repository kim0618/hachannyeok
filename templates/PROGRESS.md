# 진행 상태

## 현재 단계

- 단계 번호: 01 (부분)
- 단계 이름: SDK 세대·config 스키마 확정 + 의존성 버전 고정
- 상태: done — 이번 범위(세대 확정·버전 고정·문서 기록)만 완료. 1단계의 나머지(React 기반, TDS 범위, typecheck/lint/test/build 파이프라인)는 미착수

## 완료

- CLAUDE.md, README.md, docs/*, templates/PROJECT_VARIABLES.md, prompts/claude/00_project_audit.md 검토
- Apps in Toss 공식 문서 및 저장소 실제 상태 분석, 최초 12단계 계획 수립
- Codex 리뷰 검토: critical 0건, major 6건 모두 실제 소스(`node_modules` 타입 정의, `CLAUDE.md`, `package.json`) 대조로 타당성 확인 후 계획에 반영. minor 항목은 이번 개정에 반영하지 않음(사용자 지시 범위 밖).
- **SDK 세대 확정**: 공식 마이그레이션 문서(`documentation/integration/sdk-3.x.md`), npm `latest` dist-tag(3.0.2), `@apps-in-toss/devtools`가 3.0.2 단일 버전만 게시된 점, 설치된 `config.d.ts`가 문서의 3.x 스키마 표와 완전히 일치하는 점을 근거로 **3.x 세대 채택**을 확정. `apps-in-toss.config.ts`는 이미 3.x 스키마를 정확히 따르고 있어 수정 없음.
- `CLAUDE.md`의 "SDK 2.x 계열" 문구를 "3.x 계열 (web-framework 3.0.2)"로 정정, `package.json`의 `"latest"`를 `"3.0.2"`로 고정, `package-lock.json` 최소 갱신(1줄), `templates/PROJECT_VARIABLES.md`에 SDK 버전·config 파일명 기록
- `npm run build`로 검증 (tsc/vite build/ait build 모두 통과)

## Codex 리뷰 반영 내역

**1단계 Codex 검수 완료**: Critical 0건, Major 0건. SDK 3.0.2 고정 상태와 `npm run build` 통과 및 AIT 번들 생성 상태를 확인했으며, 다음 단계 진행 가능.

**분류 조정**: "React 미설치"는 치명이 아니라 major로 재분류. 근거: vanilla TS도 Vite+`ait build`로 빌드 자체는 가능해 실행 조건을 막는 결함이 아니며, React는 이 프로젝트가 선택한 고정 기술 요구사항(`CLAUDE.md` 2절)일 뿐 SDK의 절대 요건은 아님. (실제 설치 SDK 3.0.2의 `apps-in-toss.config.ts` 타입에는 React 의존이 없음을 직접 확인.)

**반영한 major 6건** (모두 소스 대조로 확인됨):
1. SDK 세대/설정 스키마 미확정 — `CLAUDE.md`는 "WebView SDK 2.x 계열" 고정(17행)인데 설치본은 3.0.2, `package.json`은 `"latest"`로 미고정. 게다가 `devtools`의 mock/unplugin 타입(`webViewProps.type: 'partner' | 'game'`, `granite.config.ts` 기준)과 실제 3.0.2 `apps-in-toss.config.ts` 타입(`navigationBar`/`webView`/`webBundleDir`, `webViewProps` 없음) 사이에 스키마 세대 차이가 실재함을 직접 확인. → 1단계로 승격.
2. 결과 엔진(공통 측정 계약)을 검사 UI보다 나중에 두면 재작업 위험 — 정규화 좌표 규칙(`SCORING_SPEC.md` 50행, `CLAUDE.md` 53행)이 각 검사 앞에 고정되어야 함. → 공통 계약을 검사 구현보다 앞으로 이동.
3. 저장을 10단계까지 미루면 세션 상태·복구 흐름 누락 — `Storage.getItem`/`setItem`이 `Promise` 기반임을 타입 정의로 직접 확인, 동기 처리 가정 시 초기 렌더링 경쟁 위험 실재. → 저장 "인터페이스"만 기반 단계로 승격, 구현은 후반 유지.
4. 모바일 WebView 측정 위험(safe area, 좌표 변환, pointer/touch 이벤트 기준, 백그라운드 무효화)이 계획에 명시되지 않음 — 이 앱의 핵심 검사 3종(중심/균형/통제)이 터치 좌표 정확도에 직접 의존하므로 타당. → 기반 단계 계약에 포함, 각 검사 단계에서 테스트.
5. 빌드/테스트 절차가 명령 이름뿐 — 실제로 `test`/`lint` 스크립트가 없고 `build`가 `tsc && vite build && ait build` 한 덩어리라 실패 지점 구분 불가함을 확인. → 전용 단계로 승격, 3단계 분리 검증 명시.
6. "사용자 식별키" 항목을 제품 구현 과제처럼 방치하면 범위 확대 위험 — `PRODUCT_SPEC.md`(55행)의 서버·로그인·외부 DB 제외 원칙과 충돌 가능. → 콘솔/운영 항목인지 런타임 SDK 호출인지 먼저 구분하는 가드레일을 최종 통합 단계에 명시.

**반영하지 않음(minor, 사용자 지시 범위 밖)**: TDS 최소 설치 범위, 라우터 대신 discriminated union, 에러 바운더리 세분화, devtools 유지보수 종료(README에서 "더 이상 유지보수되지 않습니다" 직접 확인됨 — 사실이지만 minor 항목이라 계획 구조는 바꾸지 않음), 오늘의 검사 MVP 분리(단, 이는 `PRODUCT_SPEC.md` 49행 자체가 이미 선택 기능으로 명시하고 있어 계획에는 반영해 후순위로 분리).

## 현재 문제

- ~~[major] SDK 세대·config 스키마 미확정~~ → **해결됨** (3.x 세대 확정, 근거는 위 "완료" 참고)
- **[major] React 미설치** (분류: 치명→major) — `src/`가 vite vanilla-ts 기본 템플릿 상태. 이번 단계 범위 밖, 1단계 잔여 작업으로 이월
- TDS 미설치, 테스트/린트 도구 없음, 브랜드 색상 불일치(`#3182F6` vs `#5B8DEF`), devtools unplugin 미연동 — 1단계 잔여 작업으로 이월
- `templates/PROJECT_VARIABLES.md`의 Node/npm/TDS 버전, 각 명령어 항목은 여전히 공란(이번 승인 범위는 SDK 버전·config 파일명만)
- `hachannyeok.ait` 용도 미확인(추측하지 않음), "사용자 식별키" 범위는 12단계에서 가드레일과 함께 재확인
- `ait build` 실행 시 로컬 산출물과 함께 `deploymentId`가 출력됨(예: `019fd638-...`) — 네트워크 부작용 여부는 공식 문서로 확인되지 않아 단정하지 않음, 다음 단계에서 필요 시 재확인

## 다음 작업 (개정된 12단계 계획)

1. **SDK 세대·config 스키마 확정 + 의존성 버전 고정** — ✅완료(3.x 확정, 버전 고정, 문서 기록). **잔여**: React 최소 기반 전환, TDS 사용 범위 확정, typecheck/lint/test/build 파이프라인 구성
2. **React 최소 기반 + TDS 사용 범위 + typecheck/lint/test/build 파이프라인 구성** — vanilla → React 전환, TDS는 실사용 컴포넌트만 최소 도입, `tsc`/`vite build`/`ait build`를 분리 검증 가능한 스크립트로 정리, vitest+린터 신설
3. **공통 측정 계약 확정** — `AbilityScores`/`MetaTraits` 등 공통 타입, 정규화 좌표 규칙, 회차·무효 시도 표현, 시간측정·백그라운드 무효화 규칙, 점수 함수 입력 경계, 저장 인터페이스(비동기 Storage 어댑터, 실패 시 메모리 유지 정책), 모바일 좌표 변환 계약(safe area, `getBoundingClientRect`, pointerdown 기준) 정의. 화면 전환 구조와 세션 상태 포함
4. **점수 엔진 골격 + 경계값 단위 테스트** — 순수 함수로 작성, 빈 입력/NaN/무효 시도 테스트
5. **홈 · 검사 안내 · 빈 흐름** UI
6. **시간 감각 검사** — fake timer, 백그라운드 전환 무효화 테스트
7. **공간 검사(중심 인지 · 균형 분배)** — 좌표 정규화 테스트
8. **통제·집중 검사(손가락 통제 · 시각 집중)** — 연속 입력, 난이도/반응시간 결정성 테스트
9. **결과 엔진 완성 + 종합 결과 · 상세 분석 UI**
10. **Apps in Toss Storage 구현** — 마이그레이션·저장 실패·초기화 테스트
11. **공식 공유(Share) API 구현** — 취소·미지원 환경 처리 (오늘의 검사 등 선택 기능은 MVP 이후 별도 검토, `PRODUCT_SPEC.md` 49행)
12. **앱인토스 통합 점검 + 최종 QA·릴리즈 준비** — navigationBar/권한/사용자 식별 가드레일(런타임 식별자 저장·전송이 필요하면 서버 없음 원칙과 충돌하므로 범위 확정 전 사용자 확인) 확인, Sandbox 실기기 QA, `.ait` 빌드 산출물 검사

각 단계 종료 시 해당 단계에서 실제로 존재하는 typecheck/lint/test/build 명령을 실행하고 결과를 정확히 보고, 통과 후에만 다음 단계로 진행. 오늘의 검사·이전 결과 대비 변화·주간 요약은 12단계까지의 MVP 완료 후 별도 검토.

## 마지막 검증

- typecheck: `npm run build`에 포함된 `tsc` 통과 (별도 typecheck 스크립트 없음)
- lint: 미실행 (lint 스크립트 자체가 아직 없음)
- test: 미실행 (test 스크립트 자체가 아직 없음)
- build: `npm run build` 통과 (`tsc && vite build && ait build`, `dist/` 산출물 및 `hachannyeok.ait` 정상 생성)

## 마지막 커밋

- hash:
- message:
