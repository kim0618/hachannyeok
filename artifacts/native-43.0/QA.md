# 43.0 Native Release Candidate QA

## Environment

- Test timestamp: 2026-08-21 13:20 KST
- Device: NOT AVAILABLE
- Emulator / Physical: NOT AVAILABLE (`adb devices -l` outside the sandbox started successfully and returned an empty device list)
- Android / iOS / OS / resolution / DPR: NOT VALIDATED
- Apps in Toss Sandbox version / Toss login: NOT AVAILABLE
- appName: `hachannyeok`
- Console display name / icon: NOT VALIDATED
- SDK: `@apps-in-toss/web-framework` 3.0.2
- Final build deploymentId: `01a0228c-abb1-7881-a08b-8950d9d84043`
- Artifact: `hachannyeok.ait`
- Size: 8,332,672 bytes
- SHA-256: `b24dabda6cc20e03dcb077b4e0fe8ff3918fe6f5c3a11f05bdde99c6875b8aa2`
- Build timestamp: 2026-08-21 13:20:39 KST

## Automated evidence

- Typecheck: PASS
- Lint: PASS, warnings 0
- Tests: PASS, 81 files / 439 tests
- Web build: PASS
- AIT build: PASS
- Combined build: PASS
- `git diff --check`: PASS
- Storage adapters, mutation serialization, checkpoint/reload, DAY1/2–7 persistence, Final reload/duplicate guard: covered by automated tests
- Time/Center/Balance/Control/Focus/DAY5/DAY6/DAY7 visibility invalidation and stale callback cleanup: covered by automated tests
- Share message, adapter call, error state and rapid-tap guard: covered by automated tests

## Native-only matrix

| Area | Status | Required evidence |
| --- | --- | --- |
| Sandbox launch / Console identity | NOT VALIDATED | Host launch and screenshot |
| HOME / INTRO safe area and overlay hitbox | NOT VALIDATED | Edge taps and 360-ish screenshot |
| DAY1 touch smoke flow | NOT VALIDATED | Physical/emulator interaction |
| Native Storage force-close restore | NOT VALIDATED | Host process termination/relaunch |
| Background / foreground lifecycle | NOT VALIDATED | Host lifecycle test |
| Native Share sheet/cancel/resend | NOT VALIDATED | Native share sheet recording |
| Android/Toss back behavior | NOT VALIDATED | State-by-state host back test |
| Safe area/status/navigation bar | NOT VALIDATED | Device screenshots |
| DAY3–7 signature visuals | NOT VALIDATED | Device screenshot set |
| DAY6 1200ms/300ms visual timing | NOT VALIDATED | Device video/slow motion |
| DAY7 Time + Focus selected paths | NOT VALIDATED | Native completion records |
| Final motion/performance | NOT VALIDATED | Device observation/profile |
| Final long scroll/share-card clipping | NOT VALIDATED | Device full-scroll QA |
| Font scaling / rotation / offline | NOT VALIDATED | Device settings and network toggles |
| Console/runtime errors | NOT VALIDATED | Sandbox/console logs |

## Decision

Native approval cannot be issued without a connected Sandbox device and Console context. No product defect was reproduced and no product code was changed. Run this exact artifact in Android Sandbox first; rebuild and replace the identity above if any source changes are made.
