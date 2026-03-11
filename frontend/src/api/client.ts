export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    credentials: "include",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(data?.message ?? `API Error: ${res.status}`);
    throw err;
  }

  return data as T;
}