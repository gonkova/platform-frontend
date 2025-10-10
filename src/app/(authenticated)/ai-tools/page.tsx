"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Link from "next/link";

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

interface PaginatedResponse {
  data: AiTool[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function AiToolsPage() {
  const { user } = useAuth();
  const [tools, setTools] = useState<AiTool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
  });

  // Зарежда categories само веднъж
  useEffect(() => {
    fetchCategories();
  }, []);

  // Зарежда tools при промяна на филтрите
  useEffect(() => {
    fetchTools();
  }, [selectedCategory, selectedDifficulty, selectedStatus, searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      setError("Грешка при зареждане на категориите");
    }
  };

  const fetchTools = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = "/ai-tools?";
      if (selectedCategory) url += `category=${selectedCategory}&`;
      if (selectedDifficulty) url += `difficulty=${selectedDifficulty}&`;
      if (selectedStatus) url += `status=${selectedStatus}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const response = await api.get(url);

      // Обработва paginated response
      if (response.data.data) {
        setTools(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        });
      } else {
        // Fallback за non-paginated response
        setTools(response.data);
      }
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

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedDifficulty("");
    setSelectedStatus("");
    setSearchTerm("");
  };

  const hasActiveFilters =
    selectedCategory || selectedDifficulty || selectedStatus || searchTerm;

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
                  Показани {tools.length} от {pagination.total} инструмента
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

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Филтри</h3>

          {/* Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Търсене
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Търси по име или описание..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория
              </label>
              <select
                value={selectedCategory || ""}
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Всички категории</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ниво на трудност
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Всички нива</option>
                <option value="beginner">Начинаещ</option>
                <option value="intermediate">Среден</option>
                <option value="advanced">Напреднал</option>
              </select>
            </div>

            {/* Status Filter (само за owner) */}
            {user?.role.name === "owner" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Всички статуси</option>
                  <option value="approved">Одобрен</option>
                  <option value="pending">Чака одобрение</option>
                  <option value="rejected">Отказан</option>
                </select>
              </div>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition"
                >
                  Изчисти филтрите
                </button>
              </div>
            )}
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
            <p className="text-gray-500 text-lg">Няма намерени инструменти</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-600 hover:text-blue-800 underline"
              >
                Изчисти филтрите
              </button>
            )}
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
                      {/* Status badge (само за owner) */}
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
                      {tool.approved_by && tool.approver && (
                        <span> | Одобрен от: {tool.approver.name}</span>
                      )}
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
                    disabled={pagination.current_page === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Предишна
                  </button>

                  <span className="px-4 py-2 text-sm text-gray-700">
                    Страница {pagination.current_page} от {pagination.last_page}
                  </span>

                  <button
                    disabled={pagination.current_page === pagination.last_page}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Следваща
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
