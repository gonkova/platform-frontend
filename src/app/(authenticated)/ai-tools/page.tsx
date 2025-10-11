"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import FilterSidebar from "@/components/FilterSidebar";
import SearchBar from "@/components/SearchBar";
import ActiveFilters from "@/components/ActiveFilters";

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface Role {
  id: number;
  name: string;
  display_name: string;
}

interface Creator {
  id: number;
  name: string;
  email: string;
}

interface AiTool {
  id: number;
  name: string;
  slug: string;
  description: string;
  url: string;
  documentation_url?: string;
  video_url?: string;
  difficulty_level: string;
  logo_url?: string;
  is_free: boolean;
  price: number | null;
  is_active: boolean;
  status: string;
  rejection_reason?: string;
  created_by: number;
  approved_by?: number;
  approved_at?: string;
  categories: Category[];
  roles: Role[];
  creator: Creator;
  approver?: Creator;
}

export default function AiToolsPage() {
  const { user } = useAuth();
  const [tools, setTools] = useState<AiTool[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination & Stats
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
    from: 0,
    to: 0,
  });
  const [stats, setStats] = useState<any>(null);

  // Зарежда categories и roles при mount
  useEffect(() => {
    fetchMetadata();
  }, []);

  // Зарежда tools при промяна на филтрите
  useEffect(() => {
    fetchTools();
  }, [
    selectedCategories,
    selectedRoles,
    selectedDifficulties,
    searchQuery,
    sortBy,
    sortOrder,
    pagination.current_page,
  ]);

  const fetchMetadata = async () => {
    try {
      const [categoriesRes, rolesRes] = await Promise.all([
        api.get("/categories"),
        api.get("/roles"),
      ]);
      setAllCategories(categoriesRes.data);
      setAllRoles(rolesRes.data);
    } catch (error: any) {
      console.error("Error fetching metadata:", error);
      setError("Грешка при зареждане на категориите и ролите");
    }
  };

  const fetchTools = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      // Categories
      if (selectedCategories.length > 0) {
        params.append("categories", selectedCategories.join(","));
      }

      // Roles
      if (selectedRoles.length > 0) {
        params.append("roles", selectedRoles.join(","));
      }

      // Difficulties
      if (selectedDifficulties.length > 0) {
        params.append("difficulty", selectedDifficulties.join(","));
      }

      // Search
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      // Sorting
      params.append("sort_by", sortBy);
      params.append("sort_order", sortOrder);

      // Pagination
      params.append("page", pagination.current_page.toString());
      params.append("per_page", pagination.per_page.toString());

      const response = await api.get(`/ai-tools?${params.toString()}`);

      // New API format
      setTools(response.data.data || []);
      setPagination(response.data.pagination || pagination);
      setStats(response.data.stats || null);
    } catch (error: any) {
      console.error("Error fetching tools:", error);
      setError(
        error.response?.data?.message || "Грешка при зареждане на инструментите"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Сигурен ли си, че искаш да изтриеш "${name}"?`)) {
      return;
    }

    setDeleting(id);
    try {
      await api.delete(`/ai-tools/${id}`);
      setTools(tools.filter((tool) => tool.id !== id));
      alert("Инструментът е изтрит успешно!");
    } catch (error: any) {
      const message = error.response?.data?.message || "Грешка при изтриване";
      alert(message);
    } finally {
      setDeleting(null);
    }
  };

  const handleClearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedRoles([]);
    setSelectedDifficulties([]);
    setSearchQuery("");
  };

  const handleRemoveCategory = (categoryId: number) => {
    setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
  };

  const handleRemoveRole = (roleId: number) => {
    setSelectedRoles(selectedRoles.filter((id) => id !== roleId));
  };

  const handleRemoveDifficulty = (difficulty: string) => {
    setSelectedDifficulties(
      selectedDifficulties.filter((d) => d !== difficulty)
    );
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, current_page: page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return "Начинаещ";
      case "intermediate":
        return "Среден";
      case "advanced":
        return "Напреднал";
      default:
        return level;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Одобрен";
      case "pending":
        return "Чака одобрение";
      case "rejected":
        return "Отказан";
      default:
        return status;
    }
  };

  // Get selected categories and roles objects for ActiveFilters
  const selectedCategoriesObjects = allCategories.filter((cat) =>
    selectedCategories.includes(cat.id)
  );
  const selectedRolesObjects = allRoles.filter((role) =>
    selectedRoles.includes(role.id)
  );

  return (
    <>
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Инструменти
              </h1>
              <p className="text-gray-600 mt-1">
                Управление и преглед на AI инструменти
              </p>
              {pagination.total > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Показани {pagination.from}-{pagination.to} от{" "}
                  {pagination.total} инструмента
                </p>
              )}
            </div>
            <Link
              href="/ai-tools/create"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-medium"
            >
              + Добави инструмент
            </Link>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchTools}
              className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
            >
              Опитай отново
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <FilterSidebar
              selectedCategories={selectedCategories}
              selectedRoles={selectedRoles}
              selectedDifficulties={selectedDifficulties}
              onCategoryChange={setSelectedCategories}
              onRoleChange={setSelectedRoles}
              onDifficultyChange={setSelectedDifficulties}
              onClearAll={handleClearAllFilters}
              stats={stats}
            />
          </div>

          {/* Main Area */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <SearchBar
                onSearch={setSearchQuery}
                placeholder="Търси AI инструменти по име, описание или URL..."
                initialValue={searchQuery}
              />
            </div>

            {/* Active Filters */}
            <ActiveFilters
              categories={selectedCategoriesObjects}
              roles={selectedRolesObjects}
              difficulties={selectedDifficulties}
              searchQuery={searchQuery}
              onRemoveCategory={handleRemoveCategory}
              onRemoveRole={handleRemoveRole}
              onRemoveDifficulty={handleRemoveDifficulty}
              onClearSearch={() => setSearchQuery("")}
              onClearAll={handleClearAllFilters}
            />

            {/* Sorting */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Подреди по:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="created_at">Дата на създаване</option>
                  <option value="name">Име</option>
                  <option value="difficulty_level">Трудност</option>
                  <option value="updated_at">Последна промяна</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  title={sortOrder === "asc" ? "Възходящо" : "Низходящо"}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>

            {/* Tools Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Зареждане...</p>
              </div>
            ) : tools.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">
                  Няма намерени инструменти
                </p>
                <button
                  onClick={handleClearAllFilters}
                  className="mt-4 text-blue-600 hover:text-blue-800 underline"
                >
                  Изчисти филтрите
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tools.map((tool) => (
                    <div
                      key={tool.id}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          {tool.name}
                        </h3>
                        <div className="flex flex-col gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                              tool.difficulty_level
                            )}`}
                          >
                            {getDifficultyLabel(tool.difficulty_level)}
                          </span>
                          {user?.role.name === "owner" && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                tool.status
                              )}`}
                            >
                              {getStatusLabel(tool.status)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {tool.description}
                      </p>

                      {/* Categories */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tool.categories.map((cat) => (
                          <span
                            key={cat.id}
                            className="px-2 py-1 text-xs rounded"
                            style={{
                              backgroundColor: cat.color + "20",
                              color: cat.color,
                            }}
                          >
                            {cat.icon} {cat.name}
                          </span>
                        ))}
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        {tool.is_free ? (
                          <span className="text-green-600 font-semibold">
                            Безплатен
                          </span>
                        ) : (
                          <span className="text-gray-900 font-semibold">
                            ${tool.price}/месец
                          </span>
                        )}
                      </div>

                      {/* Creator info (само за owner) */}
                      {user?.role.name === "owner" && (
                        <div className="mb-4 text-xs text-gray-500">
                          Създаден от: {tool.creator.name}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                          Отвори
                        </a>
                        <Link
                          href={`/ai-tools/${tool.id}/edit`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                        >
                          Редактирай
                        </Link>
                        {user?.role.name === "owner" && (
                          <button
                            onClick={() => handleDelete(tool.id, tool.name)}
                            disabled={deleting === tool.id}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm disabled:opacity-50"
                          >
                            {deleting === tool.id ? "..." : "Изтрий"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handlePageChange(pagination.current_page - 1)
                        }
                        disabled={pagination.current_page === 1}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                      >
                        Предишна
                      </button>

                      {/* Page numbers */}
                      {Array.from(
                        { length: pagination.last_page },
                        (_, i) => i + 1
                      )
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === pagination.last_page ||
                            Math.abs(page - pagination.current_page) <= 1
                        )
                        .map((page, index, array) => {
                          if (index > 0 && array[index - 1] !== page - 1) {
                            return (
                              <span key={`ellipsis-${page}`} className="px-2">
                                ...
                              </span>
                            );
                          }
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-4 py-2 text-sm border rounded-lg transition ${
                                page === pagination.current_page
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}

                      <button
                        onClick={() =>
                          handlePageChange(pagination.current_page + 1)
                        }
                        disabled={
                          pagination.current_page === pagination.last_page
                        }
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
      </div>
    </>
  );
}
