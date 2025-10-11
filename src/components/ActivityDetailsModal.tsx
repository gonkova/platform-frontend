"use client";

interface Activity {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  action: string;
  model_type: string | null;
  model_id: number | null;
  description: string | null;
  properties: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface ActivityDetailsModalProps {
  activity: Activity | null;
  onClose: () => void;
}

export default function ActivityDetailsModal({
  activity,
  onClose,
}: ActivityDetailsModalProps) {
  if (!activity) return null;

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: "Създаване",
      updated: "Обновяване",
      deleted: "Изтриване",
      approved: "Одобрение",
      rejected: "Отказ",
      login: "Вход",
      logout: "Изход",
      "2fa_enabled": "Активиране на 2FA",
      "2fa_disabled": "Деактивиране на 2FA",
    };
    return labels[action] || action;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Детайли за активност
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Основна информация
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Действие</label>
                <p className="text-sm font-medium text-gray-900">
                  {getActionLabel(activity.action)}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Дата и час</label>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(activity.created_at).toLocaleString("bg-BG")}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Потребител</label>
                <p className="text-sm font-medium text-gray-900">
                  {activity.user.name}
                </p>
                <p className="text-xs text-gray-500">{activity.user.email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">IP Адрес</label>
                <p className="text-sm font-medium text-gray-900">
                  {activity.ip_address || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {activity.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Описание
              </h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {activity.description}
              </p>
            </div>
          )}

          {/* Model Info */}
          {activity.model_type && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Засегнат обект
              </h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">
                  <span className="text-gray-500">Тип:</span>{" "}
                  <span className="font-medium">{activity.model_type}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">ID:</span>{" "}
                  <span className="font-medium">{activity.model_id}</span>
                </p>
              </div>
            </div>
          )}

          {/* Properties */}
          {activity.properties &&
            Object.keys(activity.properties).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Допълнителна информация
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <pre className="text-xs text-gray-700 overflow-auto max-h-64">
                    {JSON.stringify(activity.properties, null, 2)}
                  </pre>
                </div>
              </div>
            )}

          {/* User Agent */}
          {activity.user_agent && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Браузър/Устройство
              </h3>
              <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg break-all">
                {activity.user_agent}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Затвори
          </button>
        </div>
      </div>
    </div>
  );
}
