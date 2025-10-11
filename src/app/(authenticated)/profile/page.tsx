"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  return (
    <>
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Профил</h1>
          <p className="text-gray-600 mt-1">Преглед и редактиране на профила</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header with Avatar */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-blue-600">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-white">
                <h2 className="text-3xl font-bold">{user.name}</h2>
                <p className="text-blue-100 text-lg mt-1">
                  {user.role.display_name}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Basic Info Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Основна информация
                  </h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    {isEditing ? "Отказ" : "Редактирай"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Име
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        defaultValue={user.name}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{user.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имейл
                    </label>
                    <p className="text-gray-900 font-medium">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Имейлът не може да се променя
                    </p>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Роля
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {user.role.display_name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {user.role.description}
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Отказ
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implement save functionality
                        setIsEditing(false);
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Запази промените
                    </button>
                  </div>
                )}
              </div>

              {/* Account Stats */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Статистика
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">
                      Създадени инструменти
                    </p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">0</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium">
                      Активни проекти
                    </p>
                    <p className="text-3xl font-bold text-green-900 mt-2">0</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 font-medium">
                      Дни активност
                    </p>
                    <p className="text-3xl font-bold text-purple-900 mt-2">1</p>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Сигурност
                </h3>
                <div className="space-y-4">
                  {/* 2FA Security */}
                  <Link href="/profile/security">
                    <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xl">🔐</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Двуфакторно удостоверяване (2FA)
                          </p>
                          <p className="text-sm text-gray-600">
                            {user.two_factor_enabled
                              ? "✓ Активна - Допълнителна защита на акаунта"
                              : "Препоръчваме активиране за по-висока сигурност"}
                          </p>
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>

                  {/* Change Password */}
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Парола</p>
                      <p className="text-sm text-gray-500">
                        Последна промяна: Никога
                      </p>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      Промени парола
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border-t border-red-200 pt-6">
                <h3 className="text-xl font-semibold text-red-600 mb-4">
                  Опасна зона
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-red-900">
                        Изтриване на акаунт
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        След изтриване всички данни ще бъдат премахнати
                        безвъзвратно
                      </p>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 rounded-lg transition">
                      Изтрий акаунт
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
