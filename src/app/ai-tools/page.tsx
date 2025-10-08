"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
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

interface AiTool {
  id: number;
  name: string;
  slug: string;
  description: string;
  url: string;
  difficulty_level: string;
  is_free: boolean;
  price: number | null;
  categories: Category[];
  roles: Role[];
}

export default function AiToolsPage() {
  const { user } = useAuth();
  const [tools, setTools] = useState<AiTool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");

  useEffect(() => {
    fetchCategories();
    fetchTools();
  }, [selectedCategory, selectedDifficulty]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTools = async () => {
    try {
      setLoading(true);
      let url = "/ai-tools?";
      if (selectedCategory) url += `category_id=${selectedCategory}&`;
      if (selectedDifficulty) url += `difficulty=${selectedDifficulty}&`;

      const response = await api.get(url);
      setTools(response.data);
    } catch (error) {
      console.error("Error fetching tools:", error);
    } finally {
      setLoading(false);
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  AI Инструменти
                </h1>
                <p className="text-gray-600 mt-1">
                  Управление и преглед на AI инструменти
                </p>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  ← Dashboard
                </Link>
                <Link
                  href="/ai-tools/create"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  + Добави инструмент
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Филтри</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {(selectedCategory || selectedDifficulty) && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedDifficulty("");
                }}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                Изчисти филтрите
              </button>
            )}
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
            </div>
          ) : (
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
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                        tool.difficulty_level
                      )}`}
                    >
                      {getDifficultyLabel(tool.difficulty_level)}
                    </span>
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

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Отвори
                    </a>
                    <Link
                      href={`/ai-tools/${tool.id}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      Детайли
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
