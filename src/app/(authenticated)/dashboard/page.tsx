"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  // Различни бутони според ролята
  const getRoleButtons = () => {
    // Общ бутон за всички роли
    const commonButton = (
      <DashboardCard
        title="AI Инструменти"
        description="Преглед и управление на AI инструменти"
        icon="🤖"
        color="indigo"
        href="/ai-tools"
      />
    );

    switch (user.role.name) {
      case "owner":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {commonButton}
            <DashboardCard
              title="Управление на потребители"
              description="Добавяне и редактиране на потребители"
              icon="👥"
              color="blue"
            />
            <DashboardCard
              title="Frontend задачи"
              description="Преглед на всички frontend задачи"
              icon="🎨"
              color="purple"
            />
            <DashboardCard
              title="Backend задачи"
              description="Преглед на всички backend задачи"
              icon="⚙️"
              color="green"
            />
            <DashboardCard
              title="Статистики"
              description="Преглед на цялата статистика"
              icon="📊"
              color="yellow"
            />
            <DashboardCard
              title="Настройки"
              description="Системни настройки"
              icon="⚡"
              color="red"
            />
            <DashboardCard
              title="Отчети"
              description="Генериране на отчети"
              icon="📄"
              color="indigo"
            />
          </div>
        );
      case "frontend":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commonButton}
            <DashboardCard
              title="Моите задачи"
              description="Преглед на възложени frontend задачи"
              icon="📋"
              color="purple"
            />
            <DashboardCard
              title="UI компоненти"
              description="Библиотека с UI компоненти"
              icon="🎨"
              color="pink"
            />
            <DashboardCard
              title="Дизайн система"
              description="Достъп до дизайн файлове"
              icon="✨"
              color="blue"
            />
            <DashboardCard
              title="Код преглед"
              description="Чакащи код ревюта"
              icon="👀"
              color="green"
            />
          </div>
        );
      case "backend":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commonButton}
            <DashboardCard
              title="API задачи"
              description="Разработка на API endpoints"
              icon="🔌"
              color="green"
            />
            <DashboardCard
              title="База данни"
              description="Управление на базата данни"
              icon="💾"
              color="blue"
            />
            <DashboardCard
              title="Сървъри"
              description="Мониторинг на сървърите"
              icon="🖥️"
              color="red"
            />
            <DashboardCard
              title="Документация"
              description="API документация"
              icon="📚"
              color="yellow"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white mb-8">
        <h2 className="text-3xl font-bold mb-2">
          Добре дошъл, {user.name}! 👋
        </h2>
        <p className="text-blue-100 text-lg">
          Ти си с роля:{" "}
          <span className="font-semibold">{user.role.display_name}</span>
        </p>
        <p className="text-blue-100 mt-2">{user.role.description}</p>
      </div>

      {/* Role-based buttons */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Бързи действия
        </h3>
        {getRoleButtons()}
      </div>
    </div>
  );
}

// Dashboard Card Component
function DashboardCard({
  title,
  description,
  icon,
  color,
  href,
}: {
  title: string;
  description: string;
  icon: string;
  color: string;
  href?: string;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    purple:
      "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    green:
      "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    yellow:
      "from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700",
    red: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
    pink: "from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700",
    indigo:
      "from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700",
  };

  const Card = (
    <div
      className={`bg-gradient-to-br ${
        colorClasses[color as keyof typeof colorClasses]
      } text-white rounded-xl p-6 text-left transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-sm text-white/90">{description}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{Card}</Link>;
  }

  return <button type="button">{Card}</button>;
}
