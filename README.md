# 22G Systems

Kofy back-of-house (BOH) native app — a **thin Capacitor shell** that loads the
team tools from the live site (`kofy.io/hub`, `(internal)` zone of kofy-website).

**No tool code lives here.** Orders, Piso, Inventario, Comms, the Hub — all of it
is kofy-website. This repo is only: app identity, icon/splash, native plugins,
and the offline fallback screen. That's deliberate — one source of truth,
zero duplicated tools.

## How it stays team-only

- The internal zone is **server-gated** (middleware + signed `kofy_team` cookie).
  Without a team login the app only ever shows the `/equipo` password screen.
- Distributed by **sideload only** (no Play Store listing) — invisible unless
  you were handed the APK.
- The name says nothing about what it is. 🕶️

## Build (Codemagic)

1. Connect this repo at https://codemagic.io (same account as the customer app).
2. It auto-detects `codemagic.yaml` → run the **android-debug** workflow.
3. Download the APK artifact → send to team phones → install.

Tool updates need **no rebuild** (they ship with kofy-website pushes). Rebuild
only for icon/splash/plugin/appId changes.

## Local dev

```
npm install
npx cap add android   # first time only — generates android/
npx cap sync android
```

## Relationship to the customer app

| | Customer app | 22G Systems (this) |
|---|---|---|
| appId | `io.kofy.app` | `io.kofy.g22` |
| Loads | `kofy.io` | `kofy.io/hub` |
| Audience | Public / Play Store | Team / sideload only |
| Repo | kofy-website (`android/`) | this repo |
