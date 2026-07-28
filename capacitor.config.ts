import type { CapacitorConfig } from '@capacitor/cli'

/**
 * 22G Systems — Kofy back-of-house (BOH) native shell.
 *
 * SEPARATE app from the customer Kofy app (io.kofy.app). The shell boots the
 * bundled native-shell/index.html (branded loading/offline screen), which
 * immediately redirects the webview to https://kofy.io/hub. allowNavigation
 * keeps kofy.io INSIDE the app webview instead of bouncing to Chrome.
 *
 * v0.3 note: we deliberately do NOT use server.url here. The customer app
 * uses an origin-only server.url; ours needed a path (/hub), and a pathed
 * server.url was the prime suspect in the v0.1/v0.2 launch crashes. The
 * local-redirect pattern achieves the same "opens at the hub" result.
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
    allowNavigation: ['kofy.io', '*.kofy.io'],
    cleartext: false,
  },
}

export default config
