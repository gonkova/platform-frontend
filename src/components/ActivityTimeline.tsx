"use client";

interface User {
  id: number;
  name: string;
  email: string;
}

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
  user: User;
  action_label?: string;
  model_name?: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
}

export default function ActivityTimeline({
  activities,
  onActivityClick,
}: ActivityTimelineProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return "➕";
      case "updated":
        return "✏️";
      case "deleted":
        return "🗑️";
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      case "login":
        return "🔑";
      case "logout":
        return "🚪";
      case "2fa_enabled":
        return "🔐";
      case "2fa_disabled":
        return "🔓";
      default:
        return "📝";
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "bg-green-100 text-green-800 border-green-200";
      case "updated":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "deleted":
        return "bg-red-100 text-red-800 border-red-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "login":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "logout":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "2fa_enabled":
      case "2fa_disabled":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Преди малко";
    if (diffInSeconds < 3600)
      return `Преди ${Math.floor(diffInSeconds / 60)} минути`;
    if (diffInSeconds < 86400)
      return `Преди ${Math.floor(diffInSeconds / 3600)} часа`;
    if (diffInSeconds < 604800)
      return `Преди ${Math.floor(diffInSeconds / 86400)} дни`;

    return date.toLocaleDateString("bg-BG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Няма активности</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                {/* Icon */}
                <div>
                  <span
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-lg border-2 ${getActionColor(
                      activity.action
                    )}`}
                  >
                    {getActionIcon(activity.action)}
                  </span>
                </div>

                {/* Content */}
                <div
                  className={`min-w-0 flex-1 ${
                    onActivityClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onActivityClick && onActivityClick(activity)}
                >
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {activity.user.name}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-700">
                      {activity.description}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span>{formatDate(activity.created_at)}</span>
                    {activity.ip_address && (
                      <span className="flex items-center gap-1">
                        <span>🌐</span>
                        {activity.ip_address}
                      </span>
                    )}
                    {activity.model_type && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(
                          activity.action
                        )}`}
                      >
                        {activity.model_name || activity.model_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
