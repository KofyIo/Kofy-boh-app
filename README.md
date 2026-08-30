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

## Push notifications — the bridge trap (read before touching server config)

**v0.4 added the plugin. v0.5 made it reachable.** Those are two different bugs
and the second one is invisible.

Reaching `kofy.io` through `server.allowNavigation` loads it as an ordinary
**remote page**, and Capacitor does not inject its JS runtime into remote pages.
The symptom is deeply misleading: `window.Capacitor` is undefined, but
`window.androidBridge` still exists, so `@capacitor/core` decides the platform
is `android` and throws

```
"PushNotifications" plugin is not implemented on android
```

…which reads like a missing plugin. It isn't. The plugin is installed and
correct — nothing on that page can reach ANY native code, and **no rebuild can
fix it.** It also silently disabled the BOH tab bar, which only renders when
`useAppMode()` sees `window.Capacitor`.

Fix: **origin-only `server.url`** (`https://kofy.io`, never a path — a pathed
one was the v0.1/v0.2 crash suspect). The app then opens at the site root, so
it tags its user agent (`appendUserAgent: 'KofyBOH/22G'`) and kofy-website's
`middleware.ts` redirects `/` → `/hub`.

If push ever goes quiet again, check `puente:` on **kofy.io/hub/notificaciones**
first — `puente: no` means this bridge problem, not a plugin or Firebase one.

## History — how push was originally lost

**Resolved in v0.4–v0.5 — kept because the failure mode is worth recognising.**

The plugin was removed in v0.2 (`30bcca9`) because it shipped without a
`google-services.json` for `io.kofy.g22`, so Firebase initialisation crashed the
shell natively as soon as the site's `PushInit` ran after team login.

It was easy to misdiagnose: with no `POST_NOTIFICATIONS` in the manifest, Android
shows **no notification toggle at all**. Push wasn't "off", it was absent — and
no amount of kofy-website pushing could change that, because native permissions
only ship inside an APK.

### The order that mattered (and still does, if it is ever redone)

1. **Firebase console first** (only Kafay can): in the SAME Firebase project as
   the customer app, add an Android app with package `io.kofy.g22`, download its
   `google-services.json`, and drop it at `android/app/google-services.json`.
   The gradle wiring is already conditional — `android/app/build.gradle` applies
   the google-services plugin only when that file exists, and otherwise logs
   "Push Notifications won't work". Same project = the push worker's existing
   FCM service account keeps working, no new server key.
2. `npm i @capacitor/push-notifications@^6` — **version 6**, to match this
   shell's Capacitor 6 (kofy-website is on Capacitor 8; do not copy its
   version).
3. Add `<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />`
   to `android/app/src/main/AndroidManifest.xml` (Android 13+ shows no toggle
   without it).
4. `npx cap sync android`, rebuild on Codemagic, sideload, then in the app:
   Hub → **Notificaciones → Activar**. That control (`PushToggle` in
   kofy-website) reports whether the device token actually reached the worker.

Step 1 is a hard prerequisite. Doing 2–3 without it reintroduces the exact
launch crash v0.2 fixed.

Note that step 1 alone was still not enough — the plugin was installed correctly
in v0.4 and remained unreachable until v0.5 fixed the bridge. See the section
above.

## Relationship to the customer app

| | Customer app | 22G Systems (this) |
|---|---|---|
| appId | `io.kofy.app` | `io.kofy.g22` |
| Loads | `kofy.io` (server.url) | `kofy.io` → redirected to `/hub` by user agent |
| Audience | Public / Play Store | Team / sideload only |
| Repo | kofy-website (`android/`) | this repo |
| Capacitor | 8.x | 6.x |
| Push | plugin present | working since v0.5 |
| Gets | order-stage pushes (customers) | new-order alerts |

## Back gesture — do NOT set `enableOnBackInvokedCallback`

Verified 2026-08-30 by reading the installed sources.

`@capacitor/app@6` registers back handling through the **legacy**
`OnBackPressedDispatcher` (`AppPlugin.java` → `getOnBackPressedDispatcher()
.addCallback(...)`), and `OnBackInvokedCallback` appears **nowhere** in
Capacitor 6. Android 13+ only routes back to the new API when the manifest opts
in with `android:enableOnBackInvokedCallback="true"` — and on that path the
legacy dispatcher is bypassed.

So setting that flag here would **silently break back navigation again**: the
app would go straight back to quitting on a back gesture, which is exactly the
bug v0.6 fixed. It looks like a modernisation and is a regression.

### And why Instagram-style edge-back isn't the target

Android's system gesture owns the screen edges. A custom "drag from the edge and
the page peels" gesture fights it, and reclaiming the edge needs native
`setSystemGestureExclusionRects` (capped at 200dp, per-view, fiddly).

The platform-correct version of that feel is Android's **predictive back**, which
needs Capacitor 8 or hand-written native code. 22G is on Capacitor 6 — so that's
a version upgrade project, not an afternoon's gesture work. Worth doing
deliberately, not by flipping a manifest flag.
