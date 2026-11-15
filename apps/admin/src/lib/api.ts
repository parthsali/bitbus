const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export function getToken(): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)bitbus_token=([^;]+)/);
  return m?.[1] ?? "";
}

export function decodeJwt<T = Record<string, unknown>>(
  token: string,
): T | null {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload)) as T;
  } catch {
    return null;
  }
}

export async function apiFetch(path: string, opts?: RequestInit) {
  return fetch(`${API}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      ...opts?.headers,
    },
  });
}

export function getApiUrl() {
  return API;
}
