// Access token lives in memory only (never localStorage) so it can't be
// read by injected scripts; the refresh token is an httpOnly cookie the
// browser manages automatically. apiClient's interceptor reads/writes
// this outside of React so it stays in sync across concurrent requests.

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
