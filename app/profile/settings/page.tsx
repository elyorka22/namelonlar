// Используем клиентский компонент для проверки авторизации
// Это решает проблему синхронизации cookies между клиентом и сервером
import ProfileSettingsPageClient from "./page-client";

export const dynamic = 'force-dynamic';

export default function ProfileSettingsPage() {
  return <ProfileSettingsPageClient />;
}

