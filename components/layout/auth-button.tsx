"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { UserMenu } from "./user-menu";
import { Plus, LayoutDashboard } from "lucide-react";

interface AuthButtonProps {
  isAdmin?: boolean;
}

export function AuthButton({ isAdmin = false }: AuthButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenAdmin, setHasSeenAdmin] = useState(false);

  useEffect(() => {
    // Проверяем Supabase сессию
    const supabase = createClient();
    
    const checkUser = async () => {
      try {
        // Используем getSession вместо getUser для более надежной проверки
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          // Игнорируем ошибки отсутствия сессии - это нормально для неавторизованных пользователей
          if (error.message !== "Auth session missing!") {
            console.error("Error getting session:", error);
          }
          setSupabaseUser(null);
          setLoading(false);
          return;
        }
        setSupabaseUser(session?.user ?? null);
        setLoading(false);
      } catch (error: any) {
        // Игнорируем ошибки отсутствия сессии
        if (error?.message !== "Auth session missing!") {
          console.error("Error checking user:", error);
        }
        setSupabaseUser(null);
        setLoading(false);
      }
    };

    checkUser();

    // Слушаем изменения в аутентификации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Игнорируем INITIAL_SESSION если сессии нет
      if (event === "INITIAL_SESSION" && !session) {
        setLoading(false);
        return;
      }
      
      setSupabaseUser(session?.user ?? null);
      setLoading(false);
      
      // Если пользователь вошел, обновляем страницу
      if (event === "SIGNED_IN" && session?.user) {
        // Небольшая задержка для синхронизации с сервером
        setTimeout(() => {
          router.refresh();
        }, 500);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (isAdmin) setHasSeenAdmin(true);
  }, [isAdmin]);

  useEffect(() => {
    if (!supabaseUser && !session?.user) setHasSeenAdmin(false);
  }, [supabaseUser, session?.user]);

  // Проверяем сессию при изменении пути (например, после callback)
  useEffect(() => {
    const supabase = createClient();
    
    // Проверяем сессию при монтировании и при изменении пути
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        // Игнорируем ошибки отсутствия сессии
        if (error && error.message !== "Auth session missing!") {
          console.error("Error getting session:", error);
        }
        if (session?.user) {
          setSupabaseUser(session.user);
          setLoading(false);
        } else if (!session && supabaseUser) {
          // Если пользователь вышел
          setSupabaseUser(null);
          setLoading(false);
        }
      } catch (error: any) {
        // Игнорируем ошибки отсутствия сессии
        if (error?.message !== "Auth session missing!") {
          console.error("Error checking user:", error);
        }
      }
    };

    // Если мы на главной странице или после callback, проверяем через задержку
    if (pathname === "/" || pathname.includes("auth")) {
      const timeout = setTimeout(() => {
        checkUser();
        router.refresh();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [pathname, router, supabaseUser]);

  // Определяем текущего пользователя (приоритет Supabase, затем NextAuth)
  const user = supabaseUser
    ? {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || null,
        image: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
      }
    : session?.user || null;

  const showAdmin = isAdmin || hasSeenAdmin;

  if (loading) {
    if (showAdmin) {
      return (
        <>
          <a
            href="/admin"
            className="hidden md:flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors font-medium"
          >
            <LayoutDashboard size={20} />
            <span>Boshqaruv paneli</span>
          </a>
          <Link
            href="/listing/new"
            className="hidden md:flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            <span>E'lon joylashtirish</span>
          </Link>
          <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
        </>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (user) {
    return (
      <>
        {showAdmin && (
          <a
            href="/admin"
            className="hidden md:flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors font-medium"
          >
            <LayoutDashboard size={20} />
            <span>Boshqaruv paneli</span>
          </a>
        )}
        <Link
          href="/listing/new"
          className="hidden md:flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          <span>E'lon joylashtirish</span>
        </Link>
        <UserMenu user={user} isAdmin={showAdmin} />
      </>
    );
  }

  return (
    <Link
      href="/auth/signin"
      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
    >
      Kirish
    </Link>
  );
}

