import type { CapacitorConfig } from '@capacitor/cli'

/**
 * 22G Systems — Kofy back-of-house (BOH) native shell.
 *
 * SEPARATE app from the customer Kofy app (io.kofy.app), same proven strategy:
 * a thin Capacitor shell that loads the LIVE site rather than bundling code.
 * This one opens straight into the team hub. The (internal) zone is server-
 * gated by middleware (signed kofy_team cookie) — without a team login the
 * app only ever shows the /equipo password screen, so the tools stay
 * invisible to anyone who shouldn't know they exist.
 *
 * Tool updates ship via git push to kofy-website (no app rebuild). Only
 * native changes (icon/splash/plugins) require a Codemagic rebuild here.
 *
 * `native-shell/` is the bundled fallback (branded loading / offline screen).
 */
const config: CapacitorConfig = {
  appId: 'io.kofy.g22',        // '22g' can't start a package segment — g22 is the permanent id
  appName: '22G Systems',
  webDir: 'native-shell',
  backgroundColor: '#0a0610',  // internal-zone dark, not the customer cream
  server: {
    url: 'https://kofy.io/hub', // middleware bounces to /equipo login when logged out
    cleartext: false,
  },
}

export default config
