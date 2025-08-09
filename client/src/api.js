// client/src/api.js

// If you set VITE_API_URL=http://localhost:5001 it will use that.
// Otherwise, with Vite proxy configured, "" is fine (it will hit /api on 5173 and proxy to 5001).
const BASE = import.meta.env.VITE_API_URL || "";

// ---- Auth ----
export async function register(email, password) {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// ---- Helper for authenticated requests ----
function authFetch(path, token, opts = {}) {
  return fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
}

// ---- Notes ----
export async function listNotes(token) {
  const res = await authFetch(`/api/notes`, token);
  if (!res.ok) {
    throw new Error(`Failed to fetch notes: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createNote(token, note) {
  const res = await authFetch(`/api/notes`, token, {
    method: "POST",
    body: JSON.stringify(note),
  });
  if (!res.ok) {
    throw new Error(`Failed to create note: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function updateNote(token, id, note) {
  const res = await authFetch(`/api/notes/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(note),
  });
  return res.json();
}

export async function deleteNote(token, id) {
  const res = await authFetch(`/api/notes/${id}`, token, {
    method: "DELETE",
  });
  return res.json();
}
