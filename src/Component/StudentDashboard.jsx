// src/Component/StudentDashboard.jsx
import { useEffect, useState } from "react";
import {
  getRedeemStatus,
  redeemReward,
  getRecentActivity,
  requestOpenBin,
} from "../api/smartBinApi";

const maroon = "#7b1113";

export default function StudentDashboard({ student: initialStudent, onLogout }) {
  const [student, setStudent] = useState(initialStudent);
  const [loadingBottle, setLoadingBottle] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [lockedRewards, setLockedRewards] = useState([]); // rewardKey[]
  const [redeemLoadingKey, setRedeemLoadingKey] = useState(null); // rewardKey
  const [activities, setActivities] = useState([]); // recent activity list
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    setStudent(initialStudent);
  }, [initialStudent]);

  useEffect(() => {
    const sid = initialStudent?.studentId;
    if (!sid) return;

    async function fetchLocked() {
      try {
        const keys = await getRedeemStatus(sid);
        setLockedRewards(keys);
      } catch (err) {
        console.error("Failed to load redeem status:", err);
      }
    }

    async function fetchActivity() {
      try {
        setActivityLoading(true);
        const items = await getRecentActivity(sid, 5);
        setActivities(items);
      } catch (err) {
        console.error("Failed to load activity:", err);
      } finally {
        setActivityLoading(false);
      }
    }

    fetchLocked();
    fetchActivity();
  }, [initialStudent?.studentId]);

  const refreshActivity = async () => {
    if (!student?.studentId) return;
    try {
      setActivityLoading(true);
      const items = await getRecentActivity(student.studentId, 5);
      setActivities(items);
    } catch (err) {
      console.error("Failed to refresh activity:", err);
    } finally {
      setActivityLoading(false);
    }
  };

  // NEW: ask backend to queue an "open bin" command for this student.
  // ESP32 will pick this up and actually move the servos + add points.
  const handleInsertBottle = async () => {
    setStatusMessage("");
    if (!student?.studentId) return;

    try {
      setLoadingBottle(true);

      const res = await requestOpenBin(student.studentId);

      setStatusMessage(
        res.message ||
          "Insert request sent. Please go to the Smart Bin and insert your bottle."
      );

      // We DO NOT update points here directly, because the ESP32
      // will only add points after the bottle is detected.
      // Student can refresh, or you could call refreshActivity after a delay.
      // await refreshActivity();
    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || "Failed to contact Smart Bin.");
    } finally {
      setLoadingBottle(false);
    }
  };

  const handleRedeem = async (rewardKey, cost) => {
    setStatusMessage("");
    setRedeemLoadingKey(rewardKey);
    try {
      const res = await redeemReward(student.studentId, rewardKey);
      setStudent((prev) => ({
        ...prev,
        points: res.points,
      }));
      setLockedRewards((prev) =>
        prev.includes(rewardKey) ? prev : [...prev, rewardKey]
      );
      setStatusMessage(
        res.message ||
          "Reward redeemed! Show this to the canteen to claim your item."
      );
      await refreshActivity();
    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || "Failed to redeem reward.");
    } finally {
      setRedeemLoadingKey(null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col">
      {/* Full-width header */}
      <header
        className="w-full px-4 sm:px-6 lg:px-10 py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-0 text-white sticky top-0 z-20"
        style={{ backgroundColor: maroon }}
      >
        <div className="flex flex-col">
          <p className="text-[10px] sm:text-xs uppercase tracking-wide opacity-80">
            Student Dashboard
          </p>
          <p className="text-sm sm:text-base font-semibold leading-tight">
            Eco Coins
          </p>
        </div>
        <button
          onClick={onLogout}
          className="text-xs sm:text-sm border border-white/60 rounded-full px-3 sm:px-4 py-1 hover:bg-white/10 transition-colors whitespace-nowrap"
        >
          Logout ↩
        </button>
      </header>

      {/* Full-width content */}
      <main className="flex-1 w-full px-3 sm:px-4 lg:px-10 py-4 sm:py-5 lg:py-8">
        <div className="grid gap-4 lg:gap-7 lg:grid-cols-3">
          {/* LEFT COLUMN */}
          <section className="lg:col-span-2 space-y-4">
            {/* Student card */}
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f5d7d7] flex items-center justify-center flex-shrink-0">
                <span className="text-lg text-gray-700 font-semibold">
                  {student.name?.charAt(0) || "S"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  {student.name || "Student"}
                </p>
                <p className="text-[11px] sm:text-xs text-gray-600 truncate">
                  ID: {student.studentId || "—"}
                </p>
                <p className="text-[11px] sm:text-xs text-gray-600 truncate">
                  {student.gradeLevel || "Student"}
                </p>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 sm:p-5 text-white shadow-sm">
                <p className="text-[11px] sm:text-xs uppercase tracking-wide mb-2">
                  Total Bottles Recycled
                </p>
                <p className="text-3xl sm:text-4xl font-bold leading-tight">
                  {student.totalBottles ?? 0}
                </p>
                <p className="text-xs sm:text-sm mt-2 max-w-[18rem]">
                  Great job saving the environment!
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Current Points
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
                    {student.points ?? 0} pts
                  </p>
                </div>
                <p className="mt-2 text-[11px] sm:text-xs text-gray-500">
                  Earn points from bottles and redeem them for rewards.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <section>
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Quick Actions
              </p>
              <button
                type="button"
                onClick={handleInsertBottle}
                disabled={loadingBottle}
                className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 active:scale-[0.99] transition transform disabled:opacity-70"
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: maroon + "20" }}
                >
                  <span className="text-xl" role="img" aria-label="bottle">
                    🍼
                  </span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    Insert Bottle (Smart Bin)
                  </p>
                  <p className="text-xs text-gray-600">
                    Queue a bottle for the Smart Bin
                  </p>
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  {loadingBottle ? "Sending..." : "Tap"}
                </div>
              </button>
            </section>

            {statusMessage && (
              <p className="text-xs sm:text-sm text-gray-700">
                {statusMessage}
              </p>
            )}

            {/* Rewards */}
            <section className="bg-white rounded-xl p-4 shadow-sm space-y-3">
              <p className="text-sm font-semibold text-gray-900">
                Available Rewards
              </p>

              <RewardItem
                rewardKey="school_supplies"
                name="School Supplies"
                description="Notebook, pen, and pencil set"
                cost={10}
                currentPoints={student.points ?? 0}
                locked={lockedRewards.includes("school_supplies")}
                onRedeem={handleRedeem}
                loading={redeemLoadingKey === "school_supplies"}
              />

              <RewardItem
                rewardKey="snack_voucher"
                name="Snack Voucher"
                description="Free snack from cafeteria"
                cost={20}
                currentPoints={student.points ?? 0}
                locked={lockedRewards.includes("snack_voucher")}
                onRedeem={handleRedeem}
                loading={redeemLoadingKey === "snack_voucher"}
              />
            </section>
          </section>

          {/* RIGHT COLUMN – Recent Activity */}
          <aside className="space-y-4 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <div className="bg-white rounded-xl p-4 shadow-sm h-full">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Recent Activity
              </p>

              {activityLoading ? (
                <p className="text-xs text-gray-500">Loading...</p>
              ) : activities.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No activity yet. Start recycling to earn points!
                </p>
              ) : (
                <ul className="space-y-2">
                  {activities.map((act) => (
                    <li
                      key={act.id}
                      className="flex items-start justify-between text-xs text-gray-700 rounded-lg bg-slate-50 px-3 py-2"
                    >
                      <div className="pr-2 min-w-0">
                        <p className="font-medium truncate">
                          {act.type === "bottle"
                            ? "Recycling"
                            : "Reward Redemption"}
                        </p>
                        <p className="text-[11px] text-gray-500 break-words">
                          {act.description}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(act.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div
                        className={`text-[11px] font-semibold flex-shrink-0 pl-2 ${
                          act.pointsChange > 0
                            ? "text-green-600"
                            : act.pointsChange < 0
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {act.pointsChange > 0 ? "+" : ""}
                        {act.pointsChange} pts
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function RewardItem({
  rewardKey,
  name,
  description,
  cost,
  currentPoints,
  locked,
  onRedeem,
  loading,
}) {
  const canRedeem = currentPoints >= cost && !locked;
  const statusText = locked
    ? "Pending pickup"
    : currentPoints >= cost
    ? "Can redeem"
    : "Not enough points";

  const statusColor = locked
    ? "text-amber-600"
    : currentPoints >= cost
    ? "text-green-600"
    : "text-gray-400";

  const handleClick = () => {
    if (!canRedeem || loading) return;
    onRedeem(rewardKey, cost);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!canRedeem || loading}
      className="w-full rounded-lg border border-gray-100 px-3 py-2.5 flex items-center justify-between bg-[#f7f5f5] disabled:opacity-80 text-left transition"
    >
      <div className="pr-2 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-600 break-words">{description}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-gray-700 font-medium">{cost} pts</p>
        <p className={`text-[11px] ${statusColor}`}>
          {loading ? "Processing..." : statusText}
        </p>
      </div>
    </button>
  );
}