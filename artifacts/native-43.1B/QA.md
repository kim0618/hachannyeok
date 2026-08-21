# 43.1B Android Sandbox Native Matrix

## Authentication gate

- Timestamp: 2026-08-21 KST
- AVD: `DueGuard_Test`
- ADB serial: `emulator-5554`
- Device status: `device`
- Boot completed: `1`
- Android: 15 / API 35
- Resolution / density: 1080×2400 / 420 dpi
- Sandbox: `viva.republica.toss.test` 1.0.0
- Current activity: `viva.republica.toss.test.login.AppsInTossLoginActivity`
- Evidence screenshot: `artifacts/native-43.1B-auth-state.png`

## RC identity

- appName: `hachannyeok`
- deploymentId: `01a0228c-abb1-7881-a08b-8950d9d84043`
- artifact: `hachannyeok.ait`
- size: 8,332,672 bytes
- SHA-256: `b24dabda6cc20e03dcb077b4e0fe8ff3918fe6f5c3a11f05bdde99c6875b8aa2`

## Result

`AUTHENTICATION GATE FAILED — MATRIX NOT STARTED`

The prompt assumption that Sandbox login and Toss authentication had already been completed does not match the actual emulator state. Per section 1, RC launch and every Native matrix scenario were not started.

- Launch / identity: NOT VALIDATED
- HOME / INTRO: NOT VALIDATED
- DAY1: NOT VALIDATED
- Storage: NOT VALIDATED
- Background / foreground: NOT VALIDATED
- Native Share: NOT VALIDATED
- Back: NOT VALIDATED
- Safe Area / touch: NOT VALIDATED
- DAY3–7 signatures: NOT VALIDATED
- DAY6 timing: NOT VALIDATED
- Final motion/report/share card: NOT VALIDATED
- Runtime errors: NOT VALIDATED

No credentials were inspected, entered, stored, or logged. No product code, configuration, artifact, deployment, or storage was changed.

## Resume condition

Complete Console Email/Password login and Toss authentication directly in Sandbox. Confirm that the current activity is no longer `AppsInTossLoginActivity`; then resume this exact matrix without rebuilding the RC.
