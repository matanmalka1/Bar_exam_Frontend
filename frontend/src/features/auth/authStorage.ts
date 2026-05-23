const ACCESS_TOKEN_KEY = "access_token";

const readStoredAccessToken = (): string | null => {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

let accessToken: string | null = readStoredAccessToken();

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
  try {
    if (typeof localStorage === "undefined") return;
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch {
    /* Storage may be blocked in private or embedded browsing contexts. */
  }
};

export const clearAccessToken = (): void => {
  setAccessToken(null);
};
