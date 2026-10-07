/**
 * Spotify Authorization Code flow with PKCE. Runs entirely in the browser so the
 * app can stay a static GitHub Pages export with no client secret.
 * https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 */

export const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ?? "";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const SCOPES = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
  "user-read-recently-played",
  "playlist-read-private",
];

const VERIFIER_KEY = "reverb.pkce.verifier";
const STATE_KEY = "reverb.pkce.state";

export type SpotifyToken = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

export const isSpotifyConfigured = () => SPOTIFY_CLIENT_ID.length > 0;

export function redirectUri(origin = window.location.origin) {
  return `${origin}${BASE_PATH}/callback/`;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function randomString(
  length: number,
  random: (bytes: Uint8Array<ArrayBuffer>) => Uint8Array = (bytes) => crypto.getRandomValues(bytes),
) {
  const bytes = random(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function base64UrlEncode(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  arr.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function codeChallenge(verifier: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64UrlEncode(digest);
}

export async function beginLogin() {
  const verifier = randomString(64);
  const state = randomString(16);
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri(),
    code_challenge_method: "S256",
    code_challenge: await codeChallenge(verifier),
    scope: SCOPES.join(" "),
    state,
  });
  window.location.assign(`https://accounts.spotify.com/authorize?${params}`);
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

function toToken(json: TokenResponse, previousRefresh?: string): SpotifyToken {
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? previousRefresh,
    // Refresh a minute early to avoid racing the expiry.
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
  };
}

async function postToken(body: URLSearchParams): Promise<TokenResponse> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Spotify token request failed (${res.status})`);
  return res.json();
}

export async function completeLogin(search: URLSearchParams): Promise<SpotifyToken> {
  const error = search.get("error");
  if (error) throw new Error(error === "access_denied" ? "Spotify access was denied." : error);

  const code = search.get("code");
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  if (!code || !verifier) throw new Error("Missing authorisation code. Try connecting again.");
  if (search.get("state") !== sessionStorage.getItem(STATE_KEY)) {
    throw new Error("State mismatch. Try connecting again.");
  }
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);

  const json = await postToken(
    new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
      code_verifier: verifier,
    }),
  );
  return toToken(json);
}

export async function refreshToken(token: SpotifyToken): Promise<SpotifyToken> {
  if (!token.refreshToken) throw new Error("No refresh token");
  const json = await postToken(
    new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    }),
  );
  return toToken(json, token.refreshToken);
}
