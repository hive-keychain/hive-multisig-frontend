# Windows install notes (multisig_frontend)

Date noted: 2026-01-08

## Symptom
Running `npm ci` on Windows fails during a git dependency postinstall.

Command:
- `npm ci`

Error excerpt:
- `npm error git dep preparation failed`
- `npm error > hive-qrcode@1.0.1 postinstall`
- `npm error > hive-qrcode@1.0.1 build`
- `npm error > tsc --build tsconfig.json && cp -R public/* dist/`
- `npm error 'cp' is not recognized as an internal or external command`

## Likely root cause
This repo depends on `hive-qrcode` via GitHub:
- `"hive-qrcode": "github:hive-keychain/hive-qrcode"`

That package’s `postinstall` (or `build`) uses the Unix `cp` command, which is not available in Windows `cmd.exe` by default.

## Options to fix
1) Remove `hive-qrcode` dependency if unused (preferred if the app already uses `qrcode` package directly).
2) Replace `hive-qrcode` with a published npm package version that has a cross-platform build step.
3) Patch/fork `hive-qrcode` to use a cross-platform copy (Node `fs`, `cpx`, `cpy-cli`, or a small JS script) instead of `cp`.
4) Workaround: install using a shell that provides `cp` (Git Bash/WSL), but this is not ideal for contributors.

## Notes
- This failure happened before we could run `npm run build`, so build sanity check is still pending.
