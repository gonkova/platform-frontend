"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import ActivityTimeline from "@/components/ActivityTimeline";
import ActivityDetailsModal from "@/components/ActivityDetailsModal";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface Activity {
  id: number;
  user_id: number;
  action: string;
  model_type: string | null;
  model_id: number | null;
  description: string | null;
  properties: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface Stats {
  total_activities: number;
  today: number;
  this_week: number;
  by_action: Record<string, number>;
  by_user: Array<{ user: string; count: number }>;
}

export default function ActivitiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [error, setError] = useState("");

  // Filters
  const [filterAction, setFilterAction] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Redirect if not owner
  useEffect(() => {
    if (user && user.role.name !== "owner") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, [filterAction, filterUserId, searchQuery, currentPage]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (filterAction) params.append("action", filterAction);
      if (filterUserId) params.append("user_id", filterUserId);
      if (searchQuery) params.append("search", searchQuery);
      params.append("page", currentPage.toString());

      const response = await api.get(`/activities?${params.toString()}`);
      setActivities(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error: any) {
      console.error("Error fetching activities:", error);
      setError("Грешка при зареждане на активностите");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/activities/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleClearFilters = () => {
    setFilterAction("");
    setFilterUserId("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters = filterAction || filterUserId || searchQuery;

  const actionTypes = [
    { value: "created", label: "Създаване" },
    { value: "updated", label: "Обновяване" },
    { value: "deleted", label: "Изтриване" },
    { value: "approved", label: "Одобрение" },
    { value: "rejected", label: "Отказ" },
    { value: "login", label: "Вход" },
    { value: "logout", label: "Изход" },
    { value: "2fa_enabled", label: "2FA Активирана" },
    { value: "2fa_disabled", label: "2FA Деактивирана" },
  ];

  if (user?.role.name !== "owner") {
    return null;
  }

  return (
    <>
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-600 mt-1">
            Преглед на всички действия в платформата
          </p>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">
                Общо активности
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.total_activities}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Днес</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats.today}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">
                Тази седмица
              </h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.this_week}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Филтри</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Търсене
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Търси в описанията..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип действие
              </label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Всички действия</option>
                {actionTypes.map((action) => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={handleClearFilters}
                  className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition"
                >
                  Изчисти филтрите
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Зареждане...</p>
            </div>
          ) : (
            <>
              <ActivityTimeline
                activities={activities}
                onActivityClick={setSelectedActivity}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center border-t pt-6">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Предишна
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                      Страница {currentPage} от {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Следваща
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </>
  );
}
