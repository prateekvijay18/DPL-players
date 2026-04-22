import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PLAYER_ID_COOKIE = "playerId";

export function proxy(request: NextRequest) {
  const hasCookie = request.cookies.has(PLAYER_ID_COOKIE);
  const { pathname } = request.nextUrl;

  // Root → route by cookie presence. /register page will re-route to /leaderboard
  // itself if the cookie turns out to resolve to a real row.
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(hasCookie ? "/leaderboard" : "/register", request.url),
    );
  }

  // Leaderboard (and edit) requires a cookie to have been set.
  if (pathname.startsWith("/leaderboard") && !hasCookie) {
    return NextResponse.redirect(new URL("/register", request.url));
  }

  // NOTE: We do NOT bounce /register → /leaderboard on cookie presence. A cookie
  // can be stale (e.g. DB reset, row deleted). The /register page re-validates
  // the cookie against the DB and redirects only when it resolves to a real row.
  // Without this restraint, a stale cookie caused a redirect loop between
  // /leaderboard (page says "go to /register") and /register (proxy said "go to
  // /leaderboard") — see git history around April 2026.

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/register", "/leaderboard/:path*"],
};
