"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Role {
  id: number;
  name: string;
  display_name: string;
}

interface FilterSidebarProps {
  selectedCategories: number[];
  selectedRoles: number[];
  selectedDifficulties: string[];
  onCategoryChange: (categories: number[]) => void;
  onRoleChange: (roles: number[]) => void;
  onDifficultyChange: (difficulties: string[]) => void;
  onClearAll: () => void;
  stats?: any;
}

export default function FilterSidebar({
  selectedCategories,
  selectedRoles,
  selectedDifficulties,
  onCategoryChange,
  onRoleChange,
  onDifficultyChange,
  onClearAll,
  stats,
}: FilterSidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiltersData();
  }, []);

  const fetchFiltersData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, rolesRes] = await Promise.all([
        api.get("/categories"),
        api.get("/roles"),
      ]);
      setCategories(categoriesRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error("Error fetching filters:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    onCategoryChange(newCategories);
  };

  const toggleRole = (roleId: number) => {
    const newRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter((id) => id !== roleId)
      : [...selectedRoles, roleId];
    onRoleChange(newRoles);
  };

  const toggleDifficulty = (difficulty: string) => {
    const newDifficulties = selectedDifficulties.includes(difficulty)
      ? selectedDifficulties.filter((d) => d !== difficulty)
      : [...selectedDifficulties, difficulty];
    onDifficultyChange(newDifficulties);
  };

  const difficulties = [
    {
      value: "beginner",
      label: "Beginner",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "advanced", label: "Advanced", color: "bg-red-100 text-red-800" },
  ];

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedRoles.length > 0 ||
    selectedDifficulties.length > 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Филтри</h2>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Изчисти всички
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            {stats.total_tools} инструменти
          </p>
        </div>
      )}

      {/* Categories */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Категории</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Roles */}
      <div className="mb-6 border-t pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Роли</h3>
        <div className="space-y-2">
          {roles.map((role) => (
            <label
              key={role.id}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
            >
              <input
                type="checkbox"
                checked={selectedRoles.includes(role.id)}
                onChange={() => toggleRole(role.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{role.display_name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Трудност</h3>
        <div className="space-y-2">
          {difficulties.map((difficulty) => (
            <label
              key={difficulty.value}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
            >
              <input
                type="checkbox"
                checked={selectedDifficulties.includes(difficulty.value)}
                onChange={() => toggleDifficulty(difficulty.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${difficulty.color}`}
              >
                {difficulty.label}
              </span>
              {stats?.by_difficulty && (
                <span className="text-xs text-gray-500 ml-auto">
                  ({stats.by_difficulty[difficulty.value] || 0})
                </span>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
