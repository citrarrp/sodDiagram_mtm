"use client";
import LoginForm from "@/components/form/loginUser";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
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
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/sodDiagram/bg-mtm.jpg')" }}
    >
      {/* Overlay transparan + blur */}
      <div className="absolute inset-0 bg-gray-800/25 backdrop-blur-[1px]">
        <div className="relative z-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
