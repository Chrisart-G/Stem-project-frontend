// src/Component/AdminDashboard.jsx
import { useEffect, useState } from "react";
import {
  fetchPendingRedemptions,
  markRedemptionClaimed,
  fetchRedemptionHistory,
  fetchAdminStats,
} from "../api/smartBinApi";

const MAROON = "#7b1113";

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function AdminDashboard({ admin, onLogout }) {
  const [items, setItems] = useState([]); // pending
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [claimLoadingId, setClaimLoadingId] = useState(null);

  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [rangeType, setRangeType] = useState("7d"); // '1d'|'7d'|'30d'|'custom'
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  /* ---------- helpers for date ranges ---------- */

  const getRangeDates = () => {
    const now = new Date();
    let start, end;

    if (rangeType === "1d") {
      end = new Date(now);
      start = new Date(now);
      start.setDate(start.getDate() - 1);
    } else if (rangeType === "7d") {
      end = new Date(now);
      start = new Date(now);
      start.setDate(start.getDate() - 6);
    } else if (rangeType === "30d") {
      end = new Date(now);
      start = new Date(now);
      start.setDate(start.getDate() - 29);
    } else {
      // custom
      if (customStart && customEnd) {
        start = new Date(customStart + "T00:00:00");
        end = new Date(customEnd + "T23:59:59");
      } else {
        end = new Date(now);
        start = new Date(now);
        start.setDate(start.getDate() - 6);
      }
    }

    // ensure end covers the whole day
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  /* ---------- existing pending redemptions ---------- */

  const loadPending = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await fetchPendingRedemptions();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkClaimed = async (redemptionId) => {
    setError("");
    setClaimLoadingId(redemptionId);
    try {
      await markRedemptionClaimed(redemptionId);
      await loadPending();
      await loadHistory(); // update history as well
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update redemption.");
    } finally {
      setClaimLoadingId(null);
    }
  };

  /* ---------- new: redemption history ---------- */

  const loadHistory = async () => {
    try {
      setHistoryError("");
      setHistoryLoading(true);
      const data = await fetchRedemptionHistory({
        status: historyStatusFilter,
        limit: 100,
      });
      setHistoryItems(data);
    } catch (err) {
      console.error(err);
      setHistoryError(err.message || "Failed to load redemption history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  /* ---------- new: stats ---------- */

  const loadStats = async () => {
    try {
      setStatsError("");
      setStatsLoading(true);
      const { start, end } = getRangeDates();
      const statsData = await fetchAdminStats(
        start.toISOString(),
        end.toISOString()
      );
      setStats(statsData);
    } catch (err) {
      console.error(err);
      setStatsError(err.message || "Failed to load stats.");
    } finally {
      setStatsLoading(false);
    }
  };

  /* ---------- initial load ---------- */

  useEffect(() => {
    loadPending();
    loadHistory();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload history when filter changes
  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyStatusFilter]);

  // reload stats when range or custom dates change
  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeType, customStart, customEnd]);

  /* ---------- filtering ---------- */

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const visibleItems = normalizedSearch
    ? items.filter((item) => {
        const name = (item.studentName || "").toLowerCase();
        const sid = (item.studentId || "").toLowerCase();
        return (
          name.includes(normalizedSearch) || sid.includes(normalizedSearch)
        );
      })
    : items;

  const visibleHistoryItems = normalizedSearch
    ? historyItems.filter((item) => {
        const name = (item.studentName || "").toLowerCase();
        const sid = (item.studentId || "").toLowerCase();
        const reward = (item.rewardName || "").toLowerCase();
        return (
          name.includes(normalizedSearch) ||
          sid.includes(normalizedSearch) ||
          reward.includes(normalizedSearch)
        );
      })
    : historyItems;

  /* ---------- render ---------- */

  return (
    <div className="w-full min-h-screen bg-[#f3f3f3] flex flex-col">
      {/* Full-width maroon header */}
      <header
        className="w-full text-white"
        style={{ backgroundColor: MAROON }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide opacity-80">
              ADMIN DASHBOARD
            </p>
            <p className="text-sm font-semibold">Eco Coins</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden sm:block text-xs">
              {admin?.fullName || admin?.username}
            </p>
            <button
              onClick={onLogout}
              className="text-xs border border-white/60 rounded-full px-3 py-1 hover:bg-white/10"
            >
              Logout ↩
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-10 pt-4 pb-8 space-y-4">
          {/* Header + search */}
          <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Pending Redemptions
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Students who redeemed rewards and are waiting to claim them.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or ID..."
                className="w-full sm:w-56 px-3 py-1.5 rounded-full border border-gray-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring-color,#7b1113)]"
              />
              <button
                type="button"
                onClick={() => {
                  loadPending();
                  loadHistory();
                  loadStats();
                }}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>
          </header>

          {/* ---------- Pending redemptions (top section) ---------- */}
          {loading ? (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-700">
                No pending redemptions right now.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-2">Student</th>
                      <th className="py-2 pr-2">Reward</th>
                      <th className="py-2 pr-2 text-right">Cost</th>
                      <th className="py-2 pr-2 text-right">Student Points</th>
                      <th className="py-2 pr-2">Requested At</th>
                      <th className="py-2 pr-2 text-center">Status</th>
                      <th className="py-2 pr-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleItems.map((item) => (
                      <tr
                        key={item.redemptionId}
                        className="border-b last:border-0"
                      >
                        <td className="py-2 pr-2 align-top">
                          <p className="font-semibold text-gray-900">
                            {item.studentName}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            ID: {item.studentId}
                            {item.gradeLevel ? ` • ${item.gradeLevel}` : ""}
                          </p>
                        </td>
                        <td className="py-2 pr-2 align-top">
                          <p className="font-medium text-gray-900">
                            {item.rewardName}
                          </p>
                        </td>
                        <td className="py-2 pr-2 align-top text-right">
                          <p className="text-gray-800">{item.costPoints} pts</p>
                        </td>
                        <td className="py-2 pr-2 align-top text-right">
                          <p className="text-gray-800">
                            {item.studentPoints} pts
                          </p>
                        </td>
                        <td className="py-2 pr-2 align-top">
                          <p className="text-[11px] text-gray-500">
                            {formatDateTime(item.createdAt)}
                          </p>
                        </td>
                        <td className="py-2 pr-2 align-top text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700">
                            Pending
                          </span>
                        </td>
                        <td className="py-2 pr-2 align-top text-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkClaimed(item.redemptionId)
                            }
                            disabled={claimLoadingId === item.redemptionId}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                          >
                            {claimLoadingId === item.redemptionId
                              ? "Updating..."
                              : "Mark as claimed"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {visibleItems.map((item) => (
                  <div
                    key={item.redemptionId}
                    className="rounded-lg border border-gray-100 p-3 bg-[#f9f7f7]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.studentName}
                        </p>
                        <p className="text-[11px] text-gray-500 mb-1">
                          ID: {item.studentId}
                          {item.gradeLevel ? ` • ${item.gradeLevel}` : ""}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700">
                        Pending
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 mt-1">
                      Reward:{" "}
                      <span className="font-medium">{item.rewardName}</span>{" "}
                      ({item.costPoints} pts)
                    </p>

                    <p className="text-xs text-gray-700">
                      Student points:{" "}
                      <span className="font-medium">
                        {item.studentPoints} pts
                      </span>
                    </p>

                    <p className="text-[11px] text-gray-500 mt-1">
                      Requested: {formatDateTime(item.createdAt)}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleMarkClaimed(item.redemptionId)}
                      disabled={claimLoadingId === item.redemptionId}
                      className="mt-2 w-full text-xs font-semibold px-3 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                    >
                      {claimLoadingId === item.redemptionId
                        ? "Updating..."
                        : "Mark as claimed"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------- Redemption history (middle section) ---------- */}
          <section className="bg-white rounded-xl p-3 sm:p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                  Redemption History
                </h2>
                <p className="text-xs text-gray-500">
                  All rewards redeemed by students (pending and claimed).
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-600">Status:</span>
                <select
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-full px-3 py-1 bg-white"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="claimed">Claimed</option>
                </select>
              </div>
            </div>

            {historyLoading ? (
              <p className="text-xs text-gray-500">Loading history...</p>
            ) : historyError ? (
              <p className="text-xs text-red-600">{historyError}</p>
            ) : visibleHistoryItems.length === 0 ? (
              <p className="text-xs text-gray-500">
                No redemption history for this filter.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-2">Student</th>
                      <th className="py-2 pr-2">Reward</th>
                      <th className="py-2 pr-2 text-right">Cost</th>
                      <th className="py-2 pr-2">Requested</th>
                      <th className="py-2 pr-2">Claimed</th>
                      <th className="py-2 pr-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleHistoryItems.map((item) => (
                      <tr
                        key={item.redemptionId}
                        className="border-b last:border-0"
                      >
                        <td className="py-2 pr-2 align-top">
                          <p className="font-semibold text-gray-900">
                            {item.studentName}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            ID: {item.studentId}
                            {item.gradeLevel ? ` • ${item.gradeLevel}` : ""}
                          </p>
                        </td>
                        <td className="py-2 pr-2 align-top">
                          <p className="font-medium text-gray-900">
                            {item.rewardName}
                          </p>
                        </td>
                        <td className="py-2 pr-2 align-top text-right">
                          {item.costPoints} pts
                        </td>
                        <td className="py-2 pr-2 align-top">
                          <p className="text-[11px] text-gray-500">
                            {formatDateTime(item.createdAt)}
                          </p>
                        </td>
                        <td className="py-2 pr-2 align-top">
                          <p className="text-[11px] text-gray-500">
                            {item.claimedAt
                              ? formatDateTime(item.claimedAt)
                              : "-"}
                          </p>
                        </td>
                        <td className="py-2 pr-2 align-top text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              item.status === "claimed"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {item.status === "claimed"
                              ? "Claimed"
                              : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ---------- Analytics (bottom section) ---------- */}
          <section className="bg-white rounded-xl p-3 sm:p-4 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                  Analytics
                </h2>
                <p className="text-xs text-gray-500">
                  Bottles collected & points earned in the selected period.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="inline-flex rounded-full border border-gray-200 overflow-hidden">
                  {[
                    { id: "1d", label: "Today" },
                    { id: "7d", label: "Last 7 days" },
                    { id: "30d", label: "Last 30 days" },
                    { id: "custom", label: "Custom" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRangeType(opt.id)}
                      className={`px-3 py-1 ${
                        rangeType === opt.id
                          ? "bg-[var(--ring-color,#7b1113)] text-white"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {rangeType === "custom" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-1">
                      <span>From:</span>
                      <input
                        type="date"
                        className="border border-gray-300 rounded-full px-2 py-1"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                      />
                    </label>
                    <label className="flex items-center gap-1">
                      <span>To:</span>
                      <input
                        type="date"
                        className="border border-gray-300 rounded-full px-2 py-1"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {statsLoading ? (
              <p className="text-xs text-gray-500">Loading stats...</p>
            ) : statsError ? (
              <p className="text-xs text-red-600">{statsError}</p>
            ) : !stats ? (
              <p className="text-xs text-gray-500">No stats available.</p>
            ) : (
              <>
                {/* summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard
                    label="Bottles collected"
                    value={stats.totalBottles}
                  />
                  <StatCard
                    label="Points earned"
                    value={stats.totalPointsEarned}
                  />
                  <StatCard
                    label="Rewards redeemed"
                    value={stats.totalRedemptions}
                  />
                  <StatCard
                    label="Points spent"
                    value={stats.totalPointsRedeemed}
                  />
                </div>

                {/* by-day mini table */}
                {stats.byDay && stats.byDay.length > 0 && (
                  <div className="mt-2 overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="text-left text-gray-500 border-b">
                          <th className="py-1 pr-2">Date</th>
                          <th className="py-1 pr-2 text-right">Bottles</th>
                          <th className="py-1 pr-2 text-right">Points +</th>
                          <th className="py-1 pr-2 text-right">Redemptions</th>
                          <th className="py-1 pr-2 text-right">Points -</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.byDay.map((d) => (
                          <tr key={d.date} className="border-b last:border-0">
                            <td className="py-1 pr-2">
                              {formatDate(d.date)}
                            </td>
                            <td className="py-1 pr-2 text-right">
                              {d.bottles}
                            </td>
                            <td className="py-1 pr-2 text-right">
                              {d.pointsEarned}
                            </td>
                            <td className="py-1 pr-2 text-right">
                              {d.redemptions}
                            </td>
                            <td className="py-1 pr-2 text-right">
                              {d.pointsRedeemed}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

/* ---------- small stat card component ---------- */

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-[#faf7f7] px-3 py-3">
      <p className="text-[11px] text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value ?? 0}</p>
    </div>
  );
}