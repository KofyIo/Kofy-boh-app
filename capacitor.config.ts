import type { CapacitorConfig } from '@capacitor/cli'

/**
 * 22G Systems — Kofy back-of-house (BOH) native shell.
 *
 * SEPARATE app from the customer Kofy app (io.kofy.app). The shell boots the
 * bundled native-shell/index.html (branded loading/offline screen), which
 * immediately redirects the webview to https://kofy.io/hub. allowNavigation
 * keeps kofy.io INSIDE the app webview instead of bouncing to Chrome.
 *
 * v0.5: server.url is BACK, origin-only.
 *
 * v0.3 removed it because a PATHED server.url (/hub) was the suspect in the
 * early launch crashes. That reasoning still holds for a path — but dropping
 * it entirely broke something invisible: reaching kofy.io via allowNavigation
 * loads it as an ordinary REMOTE page, so Capacitor never injects its JS
 * runtime there. window.Capacitor is absent while window.androidBridge exists,
 * so @capacitor/core resolves the platform as 'android' and then throws
 * '"PushNotifications" plugin is not implemented on android'. NO plugin could
 * ever be reached, and no rebuild could fix it — the plugin was installed
 * correctly and simply unreachable. It also silently disabled the BOH tab bar,
 * which renders only when useAppMode() sees window.Capacitor.
 *
 * Origin-only server.url is exactly what the customer app uses, so it is the
 * proven-safe half of the pattern. To still open at the hub we tag the user
 * agent below and let kofy.io's middleware redirect '/' -> '/hub'.
 *
 * The (internal) zone is server-gated (signed kofy_team cookie) — without a
 * team login the app only ever shows the /equipo password screen.
 *
 * Tool updates ship via kofy-website pushes (no rebuild here). Rebuild only
 * for icon/splash/plugin/appId changes.
 */
const config: CapacitorConfig = {
  appId: 'io.kofy.g22',        // '22g' can't start a package segment — g22 is the permanent id
  appName: '22G Systems',
  webDir: 'native-shell',
  backgroundColor: '#0a0610',  // internal-zone dark, not the customer cream
  server: {
    url: 'https://kofy.io',        // ORIGIN ONLY — never a path (see note above)
    allowNavigation: ['kofy.io', '*.kofy.io'],
    cleartext: false,
  },
  // Lets kofy.io recognise this app: middleware.ts redirects '/' -> '/hub' when
  // it sees this token, which replaces the old local-shell redirect. No browser
  // ever sends it.
  appendUserAgent: 'KofyBOH/22G',
}

export default config
