const KEY = 'alumify.token';
export const tokenStore = {
  get() { try { return sessionStorage.getItem(KEY); } catch { return null; } },
  set(t) { try { sessionStorage.setItem(KEY, t); } catch { /* storage blocked */ } },
  clear() { try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } },
};

const BASE = import.meta.env.VITE_API_BASE ?? ''; // <<-- new: uses Vercel env var if set

export class ApiError extends Error { constructor(status, message) { super(message); this.status = status; } }

export async function api(path, { method = 'GET', body } = {}) {
  const token = tokenStore.get();
  const url = `${BASE}/api${path}`; // <<-- changed to use BASE

  const res = await fetch(url, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) { tokenStore.clear(); window.dispatchEvent(new Event('alumify:signout')); }
    throw new ApiError(res.status, data.error || 'Request failed');
  }
  return data;
}
