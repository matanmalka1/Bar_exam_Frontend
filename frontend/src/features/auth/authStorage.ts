const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const readStored = (key: string): string | null => {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStored = (key: string, value: string | null): void => {
  try {
    if (typeof localStorage === "undefined") return;
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    /* Storage may be blocked in private or embedded browsing contexts. */
  }
};

let accessToken: string | null = readStored(ACCESS_TOKEN_KEY);
let refreshToken: string | null = readStored(REFRESH_TOKEN_KEY);

export const getAccessToken = (): string | null => accessToken;
export const getRefreshToken = (): string | null => refreshToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
  writeStored(ACCESS_TOKEN_KEY, token);
};

export const setRefreshToken = (token: string | null): void => {
  refreshToken = token;
  writeStored(REFRESH_TOKEN_KEY, token);
};

export const clearAccessToken = (): void => setAccessToken(null);
export const clearTokens = (): void => {
  setAccessToken(null);
  setRefreshToken(null);
};
