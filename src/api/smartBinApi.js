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

/**
 * Student login
 */
export async function loginStudent({ studentId, password }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schoolId: studentId, password }),
  });

  const data = await handleJsonResponse(res);
  return data.student;
}

/**
 * Student signup
 */
export async function signupStudent(payload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await handleJsonResponse(res);
  return data.student;
}

/**
 * Record bottles from ESP32 / quick action
 */
export async function recordBottleEvent(studentId, bottles = 1) {
  const res = await fetch(`${API_BASE_URL}/api/iot/bottle-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, bottles }),
  });

  const data = await handleJsonResponse(res);
  return data; // { message, points, totalBottles, addedPoints }
}

/**
 * Get which rewards are currently pending (locked) for this student
 */
export async function getRedeemStatus(studentId) {
  const res = await fetch(
    `${API_BASE_URL}/api/iot/redeem-status/${encodeURIComponent(studentId)}`
  );

  const data = await handleJsonResponse(res);
  return data.lockedRewardKeys || [];
}

/**
 * Redeem a reward
 */
export async function redeemReward(studentId, rewardKey) {
  const res = await fetch(`${API_BASE_URL}/api/iot/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, rewardKey }),
  });

  const data = await handleJsonResponse(res);
  // { message, points, lockedRewardKey }
  return data;
}

// Get last N recent activity entries for a student
export async function getRecentActivity(studentId, limit = 5) {
  const res = await fetch(
    `${API_BASE_URL}/api/iot/activity/${encodeURIComponent(
      studentId
    )}?limit=${limit}`
  );

  const data = await handleJsonResponse(res);
  return data.activities || [];
}

// Admin login
export async function loginAdmin({ username, password }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await handleJsonResponse(res);
  return data.admin; // { id, username, fullName }
}

// Fetch pending redemptions for admin dashboard
export async function fetchPendingRedemptions() {
  const res = await fetch(`${API_BASE_URL}/api/admin/pending-redemptions`);
  const data = await handleJsonResponse(res);
  return data.items || [];
}

// Mark a redemption as claimed
export async function markRedemptionClaimed(redemptionId) {
  const res = await fetch(`${API_BASE_URL}/api/admin/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ redemptionId }),
  });

  const data = await handleJsonResponse(res);
  return data.redemption;
}