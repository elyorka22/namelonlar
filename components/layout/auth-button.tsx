"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenAdmin, setHasSeenAdmin] = useState(false);
  const roleFetchedRef = useRef(false);
  const initialDoneRef = useRef(false);

  useEffect(() => {
    if (initialDoneRef.current) return;
    const supabase = createClient();

    const finish = (user: any) => {
      if (!initialDoneRef.current) {
        initialDoneRef.current = true;
        setSupabaseUser(user ?? null);
        setLoading(false);
      }
    };

    const t = setTimeout(() => finish(null), 2500);

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      finish(s?.user ?? null);
      clearTimeout(t);
    }).catch(() => {
      finish(null);
      clearTimeout(t);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSupabaseUser(s?.user ?? null);
      if (event === "SIGNED_OUT") setLoading(false);
      if (event === "SIGNED_IN" && s?.user) {
        initialDoneRef.current = true;
        setLoading(false);
        router.refresh();
      }
    });

    return () => {
      clearTimeout(t);
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (isAdmin) setHasSeenAdmin(true);
  }, [isAdmin]);

  useEffect(() => {
    if (!supabaseUser && !session?.user) {
      setHasSeenAdmin(false);
      roleFetchedRef.current = false;
    }
  }, [supabaseUser, session?.user]);

  useEffect(() => {
    if (loading || (!supabaseUser && !session?.user) || roleFetchedRef.current) return;
    roleFetchedRef.current = true;
    fetch("/api/auth/role")
      .then((res) => res.json())
      .then((data: { isAdmin?: boolean }) => {
        if (data.isAdmin === true) setHasSeenAdmin(true);
      })
      .catch(() => {});
  }, [loading, supabaseUser, session?.user]);

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
          <button
            type="button"
            onClick={() => { window.location.href = "/admin"; }}
            className="hidden md:flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors font-medium"
          >
            <LayoutDashboard size={20} />
            <span>Boshqaruv paneli</span>
          </button>
          <button
            type="button"
            onClick={() => { window.location.href = "/listing/new"; }}
            className="hidden md:flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            <span>E'lon joylashtirish</span>
          </button>
          <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
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

  if (user) {
    return (
      <>
        {showAdmin && (
          <button
            type="button"
            onClick={() => { window.location.href = "/admin"; }}
            className="hidden md:flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors font-medium"
          >
            <LayoutDashboard size={20} />
            <span>Boshqaruv paneli</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => { window.location.href = "/listing/new"; }}
          className="hidden md:flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          <span>E'lon joylashtirish</span>
        </button>
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

