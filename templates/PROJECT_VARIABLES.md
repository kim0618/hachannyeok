# 프로젝트 변수 — 작업 전 수정

- APP_NAME: hachannyeok
- DISPLAY_NAME: 쓸능검
- PRIMARY_COLOR: #5B8DEF
- PACKAGE_MANAGER: npm
- APP_TYPE: Apps in Toss WebView non-game
- TARGET_PLATFORM: Android Toss app
- MIN_VIEWPORT: 360x800
- STORAGE_KEY: hachannyeok.profile.v1
- CURRENT_STORAGE_VERSION: 1

`STORAGE_KEY`의 `.v1`은 제품 namespace 초기 버전이며 payload migration 기준이 아니다. 실제 migration은 payload 내부 `schemaVersion`(`CURRENT_STORAGE_VERSION`)을 기준으로 한다. 일반 schema 변경마다 Storage key를 바꾸지 않으며, 완전히 별도 저장공간으로 이전할 명확한 사유가 있을 때만 key를 변경한다.

## 실제 프로젝트 생성 후 기록

- Node version:
- npm version:
- create-ait-app version:
- Apps in Toss SDK version: 3.0.2 (@apps-in-toss/web-framework, config 파일: apps-in-toss.config.ts / SDK 3.x 스키마)
- TDS version:
- Dev command: npm run dev
- Typecheck command: npm run typecheck
- Lint command: npm run lint
- Test command: npm run test
- Build Web command: npm run build:web
- Build AIT command: npm run build:ait
- Build All command: npm run build
- Preview command: npm run preview
- Deploy command: npm run deploy
