"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "./auth-provider";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    const checkAdmin = async () => {
      if (!user) {
        console.log("[ADMIN GUARD] No user session found, redirecting to login");
        router.replace("/admin/login");
        return;
      }

      console.log("[ADMIN GUARD] Checking admin status for:", user.id);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("[ADMIN GUARD] Profile fetch error:", error.message, error.code);
        router.replace("/dashboard");
        return;
      }

      if (profile?.role !== "admin") {
        console.warn("[ADMIN GUARD] User is not an admin, Role:", profile?.role);
        router.replace("/dashboard");
        return;
      }

      console.log("[ADMIN GUARD] Admin authorized");
      setAuthorized(true);
    };

    void checkAdmin();
  }, [loading, router, user]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
