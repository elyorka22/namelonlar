"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "Namangan Elonlar",
    siteDescription: "Namangan uchun e'lonlar platformasi",
    contactEmail: "info@namanganelonlar.uz",
    contactPhone: "+998 90 123 45 67",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Здесь будет сохранение настроек
    setTimeout(() => {
      setLoading(false);
      alert("Sozlamalar saqlandi!");
    }, 1000);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Sozlamalar</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          {/* General Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Umumiy sozlamalar
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sayt nomi
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sayt tavsifi
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      siteDescription: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Contact Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Aloqa ma'lumotlari
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, contactEmail: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={settings.contactPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, contactPhone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Tizim sozlamalari
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Texnik xizmat rejimi
                  </label>
                  <p className="text-xs text-gray-500">
                    Sayt faqat adminlar uchun ochiq bo'ladi
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenanceMode: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Ro'yxatdan o'tishga ruxsat
                  </label>
                  <p className="text-xs text-gray-500">
                    Yangi foydalanuvchilar ro'yxatdan o'tishi mumkin
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowRegistration}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      allowRegistration: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email tasdiqlash talab qilinadi
                  </label>
                  <p className="text-xs text-gray-500">
                    Foydalanuvchilar emailni tasdiqlashlari kerak
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requireEmailVerification}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      requireEmailVerification: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Saqlash</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

