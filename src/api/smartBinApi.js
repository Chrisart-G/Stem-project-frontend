// src/api/smartBinApi.js

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function handleJsonResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error || data.message || "Request failed";
    throw new Error(msg);
  }
  return data;
}

/* ---------- STUDENT AUTH / PROFILE ---------- */

export async function loginStudent({ studentId, password }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schoolId: studentId, password }),
  });

  const data = await handleJsonResponse(res);
  return data.student;
}

export async function signupStudent(payload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await handleJsonResponse(res);
  return data.student;
}

/** Get latest student info (for dashboard refresh) */
export async function getStudentById(studentId) {
  const res = await fetch(
    `${API_BASE_URL}/api/student/${encodeURIComponent(studentId)}`
  );
  return handleJsonResponse(res);
}

/* ---------- IOT / STUDENT POINTS ---------- */

export async function recordBottleEvent(studentId, bottles = 1) {
  const res = await fetch(`${API_BASE_URL}/api/iot/bottle-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, bottles }),
  });

  const data = await handleJsonResponse(res);
  return data;
}

export async function getRedeemStatus(studentId) {
  const res = await fetch(
    `${API_BASE_URL}/api/iot/redeem-status/${encodeURIComponent(studentId)}`
  );

  const data = await handleJsonResponse(res);
  return data.lockedRewardKeys || [];
}

export async function redeemReward(studentId, rewardKey) {
  const res = await fetch(`${API_BASE_URL}/api/iot/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, rewardKey }),
  });

  const data = await handleJsonResponse(res);
  return data;
}

export async function getRecentActivity(studentId, limit = 5) {
  const res = await fetch(
    `${API_BASE_URL}/api/iot/activity/${encodeURIComponent(
      studentId
    )}?limit=${limit}`
  );

  const data = await handleJsonResponse(res);
  return data.activities || [];
}

/** Ask backend to queue an "open bin" request for this student */
export async function requestOpenBin(studentId) {
  const res = await fetch(`${API_BASE_URL}/api/iot/open-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId }),
  });

  return handleJsonResponse(res);
}

/* ---------- ADMIN AUTH ---------- */

export async function loginAdmin({ username, password }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await handleJsonResponse(res);
  return data.admin;
}

/* ---------- ADMIN DASHBOARD: PENDING REDEMPTIONS ---------- */

export async function fetchPendingRedemptions() {
  const res = await fetch(`${API_BASE_URL}/api/admin/pending-redemptions`);
  const data = await handleJsonResponse(res);
  return data.items || [];
}

export async function markRedemptionClaimed(redemptionId) {
  const res = await fetch(`${API_BASE_URL}/api/admin/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ redemptionId }),
  });

  const data = await handleJsonResponse(res);
  return data.redemption;
}

/* ---------- ADMIN DASHBOARD: NEW HISTORY & STATS ---------- */

/**
 * Get redemption history (pending + claimed)
 * options = { status: 'all'|'pending'|'claimed', limit }
 */
export async function fetchRedemptionHistory(options = {}) {
  const { status = "all", limit = 50 } = options;
  const params = new URLSearchParams();
  params.set("status", status);
  params.set("limit", String(limit));

  const res = await fetch(
    `${API_BASE_URL}/api/admin/redemption-history?${params.toString()}`
  );

  const data = await handleJsonResponse(res);
  return data.items || [];
}

/**
 * Get admin stats for given date range
 * start / end should be ISO strings
 */
export async function fetchAdminStats(startISO, endISO) {
  const params = new URLSearchParams();
  if (startISO) params.set("start", startISO);
  if (endISO) params.set("end", endISO);

  const res = await fetch(
    `${API_BASE_URL}/api/admin/stats?${params.toString()}`
  );

  return handleJsonResponse(res);
}