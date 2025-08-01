"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaLock, FaUser } from "react-icons/fa";
import InputField from "@/components/inputField";
import Button from "@/components/Button";
import { userCreateSchema } from "@/app/schema/userSchema";
import { useToast } from "../toast";
import Link from "next/link";
import { IoArrowBackCircle } from "react-icons/io5";

type CreateFormData = z.infer<typeof userCreateSchema>;

export default function RegisterForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateFormData>({
    resolver: zodResolver(userCreateSchema),
  });

  const onSubmit = async (data: CreateFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        showToast("failed", result.error || "Gagal melakukan pendaftaran!");
        return;
      }

      showToast("success", "Data berhasil ditambahkan!");
      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      showToast("failed", `Terjadi kesalahan saat mendaftarkan user: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-screen mx-30 mt-5 p-6 bg-white rounded-xl drop-shadow-lg">
      <div className="flex items-center space-x-2 mb-10">
        <Link href="/" className="mx-5 ">
          <IoArrowBackCircle size={25} />
        </Link>
        <h2 className="text-3xl font-semibold tracking-tight">
          Pendaftaran User
        </h2>
      </div>
      <form
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div>
          <h1>Username</h1>
          <InputField
            type="text"
            placeholder="Username"
            {...register("username", { required: "Username wajib diisi" })}
            Icon={<FaUser />}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>
        <div>
          <h1>Password</h1>
          <InputField
            type="password"
            placeholder="Password"
            {...register("password", { required: "Password wajib diisi" })}
            Icon={<FaLock />}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Daftar"}{" "}
        </Button>
      </form>
    </div>
  );
}
