"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface Role {
  id: number;
  name: string;
  display_name: string;
}

export default function CreateAiToolPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
    documentation_url: "",
    video_url: "",
    difficulty_level: "beginner",
    is_free: true,
    price: "",
    category_ids: [] as number[],
    role_ids: [] as number[],
  });

  useEffect(() => {
    fetchCategories();
    fetchRoles();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get("/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/ai-tools", {
        name: formData.name,
        description: formData.description,
        url: formData.url,
        documentation_url: formData.documentation_url,
        video_url: formData.video_url,
        difficulty_level: formData.difficulty_level,
        categories: formData.category_ids,  // изпраща се като 'categories'
        roles: formData.role_ids,            // изпраща се като 'roles'
        price: formData.is_free ? null : parseFloat(formData.price) || null,
      });

      router.push("/ai-tools");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Грешка при създаване на инструмента"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter((cId) => cId !== id)
        : [...prev.category_ids, id],
    }));
  };

  const toggleRole = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      role_ids: prev.role_ids.includes(id)
        ? prev.role_ids.filter((rId) => rId !== id)
        : [...prev.role_ids, id],
    }));
  };

  return (
    <>
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Добави AI Инструмент
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-8"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Име на инструмента *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ChatGPT, GitHub Copilot..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Опиши какво прави инструмента..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL адрес *
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Документация (URL)
                </label>
                <input
                  type="url"
                  value={formData.documentation_url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      documentation_url: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Видео ресурс (URL)
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) =>
                    setFormData({ ...formData, video_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ниво на трудност *
              </label>
              <select
                required
                value={formData.difficulty_level}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty_level: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Начинаещ</option>
                <option value="intermediate">Среден</option>
                <option value="advanced">Напреднал</option>
              </select>
            </div>

            {/* Pricing */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Ценообразуване
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_free"
                    checked={formData.is_free}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_free: e.target.checked,
                        price: "",
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_free"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Безплатен инструмент
                  </label>
                </div>

                {!formData.is_free && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Цена ($/месец)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="10.00"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Категории *</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-3 rounded-lg border-2 transition ${
                      formData.category_ids.includes(cat.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <p className="text-sm font-medium mt-1">{cat.name}</p>
                  </button>
                ))}
              </div>
              {formData.category_ids.length === 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Избери поне една категория
                </p>
              )}
            </div>

            {/* Roles */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Роли *</h3>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`role-${role.id}`}
                      checked={formData.role_ids.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`role-${role.id}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {role.display_name}
                    </label>
                  </div>
                ))}
              </div>
              {formData.role_ids.length === 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Избери поне една роля
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8 pt-6 border-t">
            <Link
              href="/ai-tools"
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-center"
            >
              Отказ
            </Link>
            <button
              type="submit"
              disabled={
                loading ||
                formData.category_ids.length === 0 ||
                formData.role_ids.length === 0
              }
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Създаване..." : "Създай инструмент"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
