// src/Component/AdminDashboard.jsx
import { useEffect, useState } from "react";
import {
  fetchPendingRedemptions,
  markRedemptionClaimed,
} from "../api/smartBinApi";

const MAROON = "#7b1113";

export default function AdminDashboard({ admin, onLogout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [claimLoadingId, setClaimLoadingId] = useState(null);

  const loadData = async () => {
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

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkClaimed = async (redemptionId) => {
    setError("");
    setClaimLoadingId(redemptionId);
    try {
      await markRedemptionClaimed(redemptionId);
      // After marking claimed, reload list (pending only, so it disappears)
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update redemption.");
    } finally {
      setClaimLoadingId(null);
    }
  };

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
                onClick={loadData}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>
          </header>

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
                            {new Date(item.createdAt).toLocaleString()}
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
                      Requested: {new Date(item.createdAt).toLocaleString()}
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
        </div>
      </main>
    </div>
  );
}