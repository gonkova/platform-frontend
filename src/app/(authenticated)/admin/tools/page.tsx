"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface Tool {
  id: number;
  name: string;
  description: string;
  url: string;
  difficulty_level: string;
  status: string;
  status_label: string;
  status_color: string;
  created_at: string;
  creator: {
    name: string;
    email: string;
  };
}

export default function AdminToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchTools();
  }, [filter]);

  const fetchTools = async () => {
    try {
      setLoading(true);

      let url = "/ai-tools";
      if (filter !== "all") {
        url += `?status=${filter}`;
      }

      const response = await api.get(url);

      // Фиксваме структурата - API може да върне data.data или директно data
      const toolsData = response.data.data || response.data || [];
      setTools(Array.isArray(toolsData) ? toolsData : []);
    } catch (error) {
      console.error("Error fetching tools:", error);
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setActionLoading(id);
      await api.post(`/admin/tools/${id}/approve`);
      await fetchTools();
    } catch (error) {
      console.error("Error approving tool:", error);
      alert("Грешка при одобрение на инструмента");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    try {
      setActionLoading(id);
      await api.post(`/admin/tools/${id}/reject`);
      await fetchTools();
    } catch (error) {
      console.error("Error rejecting tool:", error);
      alert("Грешка при отказване на инструмента");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedTools.length === 0) return;

    try {
      setActionLoading(-1);
      await api.post("/admin/tools/bulk-approve", { ids: selectedTools });
      setSelectedTools([]);
      await fetchTools();
    } catch (error) {
      console.error("Error bulk approving:", error);
      alert("Грешка при масово одобрение");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkReject = async () => {
    if (selectedTools.length === 0) return;

    try {
      setActionLoading(-2);
      await api.post("/admin/tools/bulk-reject", { ids: selectedTools });
      setSelectedTools([]);
      await fetchTools();
    } catch (error) {
      console.error("Error bulk rejecting:", error);
      alert("Грешка при масово отказване");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSelectTool = (id: number) => {
    setSelectedTools((prev) =>
      prev.includes(id) ? prev.filter((toolId) => toolId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTools.length === tools.length) {
      setSelectedTools([]);
    } else {
      setSelectedTools(tools.map((tool) => tool.id));
    }
  };

  const getStatusBadge = (status: string, statusColor: string) => {
    const colors = {
      yellow: "bg-yellow-100 text-yellow-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
      gray: "bg-gray-100 text-gray-800",
    };

    return colors[statusColor as keyof typeof colors] || colors.gray;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Зареждане...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Управление на AI Tools
          </h1>
          <p className="text-gray-600">
            Одобрявай или отказвай предложени инструменти
          </p>
        </div>

        {/* Филтри */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 px-6 py-4 font-medium transition ${
                filter === "all"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Всички
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`flex-1 px-6 py-4 font-medium transition ${
                filter === "pending"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Чакат одобрение
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`flex-1 px-6 py-4 font-medium transition ${
                filter === "approved"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Одобрени
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`flex-1 px-6 py-4 font-medium transition ${
                filter === "rejected"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Отказани
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTools.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <span className="text-blue-900 font-medium">
              Избрани {selectedTools.length} инструмента
            </span>
            <div className="flex gap-3">
              <button
                onClick={handleBulkApprove}
                disabled={actionLoading === -1}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === -1 ? "Обработва се..." : "Одобри всички"}
              </button>
              <button
                onClick={handleBulkReject}
                disabled={actionLoading === -2}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === -2 ? "Обработва се..." : "Откажи всички"}
              </button>
              <button
                onClick={() => setSelectedTools([])}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Отмени
              </button>
            </div>
          </div>
        )}

        {/* Таблица с tools */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedTools.length === tools.length && tools.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Име
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Създател
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Трудност
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tools.map((tool) => (
                <tr key={tool.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTools.includes(tool.id)}
                      onChange={() => toggleSelectTool(tool.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {tool.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {tool.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {tool.creator?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="capitalize">{tool.difficulty_level}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                        tool.status,
                        tool.status_color
                      )}`}
                    >
                      {tool.status_label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(tool.created_at).toLocaleDateString("bg-BG")}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    {tool.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(tool.id)}
                          disabled={actionLoading === tool.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === tool.id ? "..." : "Одобри"}
                        </button>
                        <button
                          onClick={() => handleReject(tool.id)}
                          disabled={actionLoading === tool.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === tool.id ? "..." : "Откажи"}
                        </button>
                      </div>
                    )}
                    {tool.status === "approved" && (
                      <span className="text-green-600">✓ Одобрен</span>
                    )}
                    {tool.status === "rejected" && (
                      <span className="text-red-600">✗ Отказан</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {tools.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Няма намерени инструменти</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
