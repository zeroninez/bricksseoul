export async function api<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
  })
  if (!res.ok) {
    let detail: any
    try {
      detail = await res.json()
    } catch {}
    throw new Error(detail?.error ?? res.statusText ?? 'Request failed')
  }
  return res.json() as Promise<T>
}
