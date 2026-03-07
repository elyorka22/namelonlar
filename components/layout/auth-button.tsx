"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { UserMenu } from "./user-menu";
import { Plus } from "lucide-react";

export function AuthButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем Supabase сессию
    const supabase = createClient();
    
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error getting user:", error);
        }
        setSupabaseUser(user);
        setLoading(false);
      } catch (error) {
        console.error("Error checking user:", error);
        setLoading(false);
      }
    };

    checkUser();

    // Слушаем изменения в аутентификации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setSupabaseUser(session?.user ?? null);
      setLoading(false);
      
      // Если пользователь вошел, обновляем страницу
      if (event === "SIGNED_IN" && session?.user) {
        // Небольшая задержка для синхронизации с сервером
        setTimeout(() => {
          router.refresh();
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Проверяем сессию при изменении пути (например, после callback)
  useEffect(() => {
    if (pathname === "/" || pathname.startsWith("/auth/callback")) {
      const supabase = createClient();
      const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !supabaseUser) {
          setSupabaseUser(user);
          setLoading(false);
          router.refresh();
        }
      };
      // Небольшая задержка для того, чтобы cookies успели установиться
      const timeout = setTimeout(checkUser, 500);
      return () => clearTimeout(timeout);
    }
  }, [pathname, supabaseUser, router]);

  // Определяем текущего пользователя (приоритет Supabase, затем NextAuth)
  const user = supabaseUser
    ? {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
        image: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
      }
    : session?.user || null;

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (user) {
    return (
      <>
        <Link
          href="/listing/new"
          className="hidden md:flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          <span>E'lon joylashtirish</span>
        </Link>
        <UserMenu user={user} />
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

