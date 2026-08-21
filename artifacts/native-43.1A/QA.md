# 43.1A Android Native QA Environment Bring-up

## Correction

The reusable test program from the DueGuard work was found and used. This task does not test the DueGuard product.

## Android environment

- SDK: `/home/tjd618/Android/Sdk`
- Emulator binary: `/home/tjd618/Android/Sdk/emulator/emulator`
- ADB: `/home/tjd618/Android/Sdk/platform-tools/adb`
- Existing AVD: `DueGuard_Test`
- Launch mode: headless, `-no-window -no-audio -gpu swiftshader_indirect -no-snapshot-save`
- ADB serial: `emulator-5554`
- Status: `device`
- Model: `sdk_gphone64_x86_64`
- Android: 15 / API 35
- Resolution: 1080×2400
- Density: 420 dpi
- Font scale: 1.0

## Sandbox

- Package: `viva.republica.toss.test`
- Version: 1.0.0 (`versionCode=100000`)
- Installed: PASS
- Launched: PASS
- Current activity: `viva.republica.toss.test.login.AppsInTossLoginActivity`
- Screenshot: `artifacts/native-43.1/sandbox-current.png`
- Logged in: BLOCKED — manual Console Email/Password and Toss authentication required

## RC identity

- appName: `hachannyeok`
- deploymentId: `01a0228c-abb1-7881-a08b-8950d9d84043`
- artifact: `hachannyeok.ait`
- size: 8,332,672 bytes
- SHA-256: `b24dabda6cc20e03dcb077b4e0fe8ff3918fe6f5c3a11f05bdde99c6875b8aa2`
- Artifact changed: no

## GUI note

The established DueGuard workflow used the emulator headlessly. A WSLg window launch was attempted only to enable manual login, but the host lacks GUI runtime libraries (`libpulse`, then `libnss3`). A user-local temporary `libpulse0` extraction was tried under `/tmp` without changing system packages; no product files were affected. The emulator was restored to the known-good headless launch mode.

## Final

`C — Sandbox authentication blocked`

The Android SDK/AVD/Sandbox environment is available and running. The only remaining bring-up gate is user-owned authentication. After login, launch the current deployment and resume 43.1 Native Matrix immediately.
