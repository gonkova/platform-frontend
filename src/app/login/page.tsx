"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import TwoFactorPrompt from "@/components/TwoFactorPrompt";
import api from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [twoFactorError, setTwoFactorError] = useState("");
  const { setUser, setToken, user } = useAuth();
  const router = useRouter();

  // Ако вече си логнат, пренасочи към dashboard
  if (user) {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", { email, password });

      // Провери дали изисква 2FA
      if (response.data.requires_2fa) {
        setTempToken(response.data.temp_token);
        setRequires2FA(true);
        setLoading(false);
        return;
      }

      // Ако няма 2FA, директен login
      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Грешен имейл или парола");
      setLoading(false);
    }
  };

  const handleVerify2FA = async (code: string) => {
    setTwoFactorError("");
    setLoading(true);

    try {
      // Задай временния токен в api instance
      const originalToken = localStorage.getItem("token");
      localStorage.setItem("token", tempToken);

      const response = await api.post("/verify-2fa", { code });

      // Запази финалния токен
      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setTwoFactorError(err.response?.data?.message || "Невалиден код");
      setLoading(false);
    }
  };

  const handleCancel2FA = () => {
    setRequires2FA(false);
    setTempToken("");
    setTwoFactorError("");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Добре дошли</h1>
            <p className="text-gray-600 mt-2">Влезте в системата</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Имейл адрес
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="ivan@admin.local"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Парола
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Влизане..." : "Вход"}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Тестови акаунти:
            </p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>Owner: ivan@admin.local / password</p>
              <p>Frontend: elena@frontend.local / password</p>
              <p>Backend: petar@backend.local / password</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Prompt Modal */}
      {requires2FA && (
        <TwoFactorPrompt
          onVerify={handleVerify2FA}
          onCancel={handleCancel2FA}
          loading={loading}
          error={twoFactorError}
        />
      )}
    </div>
  );
}
