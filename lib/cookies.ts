import { cookies } from "next/headers";

const PLAYER_ID_COOKIE = "playerId";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Read the playerId cookie. Returns undefined if absent.
 * Usable in Server Components, Server Actions, Route Handlers.
 */
export async function getPlayerId(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(PLAYER_ID_COOKIE)?.value;
}

/**
 * Set the playerId cookie. Only works in Server Actions / Route Handlers.
 */
export async function setPlayerId(id: string): Promise<void> {
  const store = await cookies();
  store.set(PLAYER_ID_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
  });
}

/** Clear the cookie (for future self-delete or sign-out). */
export async function clearPlayerId(): Promise<void> {
  const store = await cookies();
  store.delete(PLAYER_ID_COOKIE);
}
