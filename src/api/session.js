import { API_URL } from "./index";

export async function startSession(payload) {
  const res = await fetch(`${API_URL()}/sessions/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok || (res.status !== 200 && res.status !== 409))
    throw new Error("startSession failed");
  return res.json(); // { sessionId }
}
export async function getActiveSession(params) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL()}/sessions/active?${qs}`);
  if (!res.ok) throw new Error("getActiveSession failed");
  return res.json(); // { active, session? }
}
export async function postAttempt(payload) {
  const res = await fetch(`${API_URL()}/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("postAttempt failed");
  return res.json(); // { attemptId, session }
}
export async function patchProgress({ sessionId, ...payload }) {
  console.log("patchProgress", sessionId, payload);
  const res = await fetch(`${API_URL()}/sessions/${sessionId}/progress`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("patchProgress failed");
  return res.json(); // { session }
}
