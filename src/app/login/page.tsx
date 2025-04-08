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
    <div className="w-full">
      <LoginForm />
    </div>
  );
}
