"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { FaLock, FaUser } from "react-icons/fa";
import InputField from "@/components/inputField";
import Button from "@/components/Button";
import { userLoginSchema } from "@/app/schema/userSchema";
import { useToast } from "../toast";
import { useState } from "react";
type LoginFormData = z.infer<typeof userLoginSchema>;

const LoginForm = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(userLoginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        showToast("failed", result.error || "Login gagal!");
        return;
      }

      showToast("success", "Login Berhasil!");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      showToast("failed", `Terjadi kesalahan saat login: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-emerald-400/60 to-emerald-500">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          SOD Diagram
        </h2>
        <p className="text-center text-sm text-gray-500 mb-4">
          Silahkan login ke akun yang telah terdaftar
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <InputField
            type="text"
            placeholder="Username"
            {...register("username")}
            Icon={<FaUser />}
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}

          <InputField
            type="password"
            placeholder="Password"
            {...register("password")}
            Icon={<FaLock />}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
