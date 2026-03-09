"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { data: session } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Если уже авторизован — редирект, чтобы не застревать на странице входа
  useEffect(() => {
    const check = async () => {
      if (session?.user) {
        router.replace(callbackUrl);
        return;
      }
      const supabase = createClient();
      const { data: { session: sbSession } } = await supabase.auth.getSession();
      if (sbSession?.user) {
        router.replace(callbackUrl);
        return;
      }
      setCheckingAuth(false);
    };
    check();
  }, [session?.user, callbackUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("[SIGNIN] Attempting login with:", { 
      email: email.trim().toLowerCase(), 
      passwordLength: password.length 
    });

    try {
      // Пробуем предварительную проверку пароля через API (необязательно)
      // Если API недоступен, просто пропускаем проверку и идем к NextAuth
      let testResult = null;
      try {
        const testResponse = await fetch("/api/test-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password: password,
          }),
        });
        
        if (testResponse.ok) {
          testResult = await testResponse.json();
          console.log("[SIGNIN] Test password result:", testResult);

          if (!testResult.found) {
            setError("Foydalanuvchi topilmadi");
            setLoading(false);
            return;
          }

          if (!testResult.hasPassword) {
            setError("Parol o'rnatilmagan. Profil sozlamalarida parol o'rnating.");
            setLoading(false);
            return;
          }

          if (testResult.passwordValidation?.valid && !testResult.passwordValidation.valid.includes("✅")) {
            setError("Noto'g'ri parol");
            setLoading(false);
            return;
          }
        } else {
          // Если API вернул ошибку, просто логируем и продолжаем
          console.warn("[SIGNIN] Test password API returned error, skipping validation");
        }
      } catch (testError) {
        // Если API недоступен, просто пропускаем проверку
        console.warn("[SIGNIN] Test password API unavailable, proceeding with NextAuth:", testError);
      }

      // Пробуем войти через NextAuth
      console.log("[SIGNIN] Attempting NextAuth signIn");
      
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password: password,
        redirect: false,
      });

      console.log("[SIGNIN] NextAuth result:", result);

      if (result?.error) {
        console.error("[SIGNIN] NextAuth error:", result.error);
        setError("Noto'g'ri email yoki parol");
      } else if (result?.ok) {
        console.log("[SIGNIN] Login successful, redirecting to:", callbackUrl);
        router.push(callbackUrl);
        router.refresh();
      } else {
        console.error("[SIGNIN] Unexpected result:", result);
        setError("Xatolik yuz berdi. Qayta urinib ko'ring.");
      }
    } catch (err) {
      console.error("[SIGNIN] Error:", err);
      setError("Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      const supabase = createClient();
      
      // Проверяем, что Supabase настроен
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setError("Supabase не настроен. Проверьте переменные окружения.");
        setGoogleLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(callbackUrl)}`,
        },
      });

      if (error) {
        console.error("Supabase OAuth error:", error);
        setError(`Google bilan kirishda xatolik: ${error.message}`);
        setGoogleLoading(false);
      } else if (data?.url) {
        // Если получили URL, перенаправляем на него
        window.location.href = data.url;
      } else {
        setError("Google bilan kirishda xatolik yuz berdi.");
        setGoogleLoading(false);
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(`Xatolik yuz berdi: ${err?.message || "Noma'lum xatolik"}`);
      setGoogleLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Kirish
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Hisobingizga kiring yoki yangi yarating
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="example@mail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parol
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Kirilmoqda...</span>
              </>
            ) : (
              "Kirish"
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">yoki</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="mt-4 w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Yuklanmoqda...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Kirish через Google
              </>
            )}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Hisobingiz yo'qmi?{" "}
          <Link href="/auth/register" className="text-primary-600 hover:text-primary-700 font-semibold">
            Ro'yxatdan o'tish
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}

