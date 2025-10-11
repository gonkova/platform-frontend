"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";

interface TwoFactorStatus {
  enabled: boolean;
  confirmed_at: string | null;
  has_backup_codes: boolean;
}

export default function SecurityPage() {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [showingBackupCodes, setShowingBackupCodes] = useState(false);
  const [step, setStep] = useState<"status" | "setup" | "confirm">("status");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(""); // Изчиства предишни грешки
      const response = await api.get("/2fa/status");
      setStatus(response.data);
    } catch (error) {
      console.error("Error fetching 2FA status:", error);
      // НЕ задаваме error тук - може да е временна мрежова грешка
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.post("/2fa/enable");
      setQrCode(response.data.qr_code_url);
      setSecret(response.data.secret);
      setStep("setup");
    } catch (error: any) {
      setError(error.response?.data?.message || "Грешка при активиране на 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm2FA = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.post("/2fa/confirm", {
        code: verificationCode,
      });
      setBackupCodes(response.data.backup_codes);
      setSuccess(response.data.message);
      setStep("confirm");
      setShowingBackupCodes(true);
      await fetchStatus();
    } catch (error: any) {
      setError(error.response?.data?.message || "Невалиден код");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!password) {
      setError("Моля въведете парола");
      return;
    }

    if (!confirm("Сигурни ли сте, че искате да деактивирате 2FA?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await api.post("/2fa/disable", { password });
      setSuccess("2FA е деактивирана успешно");
      setPassword("");
      setStep("status");
      await fetchStatus();
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Грешка при деактивиране на 2FA"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!password) {
      setError("Моля въведете парола");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await api.post("/2fa/backup-codes", { password });
      setBackupCodes(response.data.backup_codes);
      setSuccess(response.data.message);
      setShowingBackupCodes(true);
      setPassword("");
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Грешка при регенериране на кодове"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "2fa-backup-codes.txt";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Зареждане...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Сигурност на акаунта
        </h1>
        <p className="text-gray-600 mb-8">
          Управление на двуфакторно удостоверяване (2FA)
        </p>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Status View */}
        {step === "status" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Двуфакторно удостоверяване (2FA)
                </h2>
                <p className="text-gray-600">
                  Добавете допълнителен слой сигурност към вашия акаунт
                </p>
              </div>
              <div>
                {status?.enabled ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    ✓ Активна
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                    Неактивна
                  </span>
                )}
              </div>
            </div>

            {!status?.enabled ? (
              <div>
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Защо да използвам 2FA?
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • Допълнителна защита дори ако паролата ви е
                      компрометирана
                    </li>
                    <li>
                      • Използва временни кодове от вашето мобилно приложение
                    </li>
                    <li>• Препоръчва се за всички потребители</li>
                  </ul>
                </div>
                <button
                  onClick={handleEnable2FA}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? "Зареждане..." : "Активирай 2FA"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    2FA е активна от{" "}
                    {status.confirmed_at &&
                      new Date(status.confirmed_at).toLocaleDateString("bg-BG")}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Парола (за деактивиране или регенериране на кодове)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Въведете парола"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleRegenerateBackupCodes}
                    disabled={loading || !password}
                    className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    Регенерирай Backup Кодове
                  </button>
                  <button
                    onClick={handleDisable2FA}
                    disabled={loading || !password}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                  >
                    Деактивирай 2FA
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Setup View */}
        {step === "setup" && qrCode && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">
              Стъпка 1: Сканирайте QR кода
            </h2>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Отворете Google Authenticator или друго 2FA приложение и
                сканирайте този QR код:
              </p>

              <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
                <QRCodeSVG value={qrCode} size={256} />
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Или въведете ръчно този код:
                </p>
                <code className="text-sm font-mono bg-white px-3 py-2 rounded border">
                  {secret}
                </code>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Стъпка 2: Въведете 6-цифрен код
              </h3>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/\D/g, ""))
                }
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="000000"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep("status");
                  setQrCode(null);
                  setSecret(null);
                  setVerificationCode("");
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 transition"
              >
                Отказ
              </button>
              <button
                onClick={handleConfirm2FA}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Проверка..." : "Потвърди"}
              </button>
            </div>
          </div>
        )}

        {/* Backup Codes View */}
        {showingBackupCodes && backupCodes.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              ⚠️ Важно: Запазете тези backup кодове
            </h2>
            <p className="text-gray-600 mb-4">
              Всеки код може да се използва еднократно, ако загубите достъп до
              вашето authenticator приложение.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
              {backupCodes.map((code, index) => (
                <code
                  key={index}
                  className="px-3 py-2 bg-white rounded border text-center font-mono"
                >
                  {code}
                </code>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={downloadBackupCodes}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition"
              >
                📥 Изтегли като файл
              </button>
              <button
                onClick={() => {
                  setShowingBackupCodes(false);
                  setBackupCodes([]);
                  setStep("status");
                }}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Готово
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
