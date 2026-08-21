# 43.1 Android Sandbox Native Execution

## Environment gate

- Timestamp: 2026-08-21 KST
- RC appName: `hachannyeok`
- RC deploymentId: `01a0228c-abb1-7881-a08b-8950d9d84043`
- RC artifact: `hachannyeok.ait`
- RC size: 8,332,672 bytes
- RC SHA-256: `b24dabda6cc20e03dcb077b4e0fe8ff3918fe6f5c3a11f05bdde99c6875b8aa2`
- WSL `adb devices -l`: daemon reachable, zero attached devices
- Windows `Get-Command adb`: no command resolved
- Windows Android-related processes: zero (`adb|emulator|qemu|studio|sandbox|toss`)
- Windows filesystem search: no `adb.exe` or `emulator.exe` found in expected user/Program Files paths

## Corrected environment result

The initial `DEVICE LIST 0` conclusion was incomplete. A later audit of the DueGuard test environment found the existing Linux SDK emulator and AVD:

- Emulator: `/home/tjd618/Android/Sdk/emulator/emulator`
- AVD: `DueGuard_Test`
- Serial after launch: `emulator-5554 device`
- Android: 15 / API 35
- Physical display: 1080×2400 @ 420 dpi
- Sandbox package: `viva.republica.toss.test`, version 1.0.0

The emulator booted and Sandbox launched successfully. The active screen is `AppsInTossLoginActivity`, requiring Console Email/Password and subsequent user authentication. Native product QA remains NOT VALIDATED until that manual authentication is completed.

No product defect was reproduced. No product code, configuration, or RC artifact was changed.

## Resume condition

1. Complete the existing Sandbox Console login and Toss authentication on `DueGuard_Test` without sharing credentials in logs/chat.
2. Launch the exact RC deployment.
3. Resume this matrix with the exact RC identity above. If source changes, rebuild and replace all identity fields before testing.
