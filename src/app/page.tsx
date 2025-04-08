"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import "../styles/globals.css"
// export const runtime = "edge";
// export const dynamic = "force-dynamic";
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const accessToken = getCookie("accessToken");
    setTimeout(() => {
      if (accessToken) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }, 1500);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-white-100">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>

        <p className="text-lg font-semibold text-emerald-900 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}