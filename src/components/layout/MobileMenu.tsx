"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  roles?: string[];
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user || !isOpen) return null;

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: "🏠" },
    { name: "AI Инструменти", href: "/ai-tools", icon: "🤖" },
    { name: "Управление", href: "/admin", icon: "⚙️", roles: ["owner"] },
    { name: "Профил", href: "/profile", icon: "👤" },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user.role.name);
  });

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <div className="md:hidden border-t bg-white">
      <div className="px-4 py-3 space-y-1">
        {/* User Info */}
        <div className="px-3 py-3 bg-gray-50 rounded-lg mb-3">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.role.display_name}</p>
        </div>

        {/* Navigation Links */}
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition ${
              isActive(item.href)
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-xl mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <span className="text-xl mr-3">🚪</span>
          Изход
        </button>
      </div>
    </div>
  );
}
