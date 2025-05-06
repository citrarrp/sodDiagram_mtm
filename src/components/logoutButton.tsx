"use client";
import { useRouter } from "next/navigation";
import { IoLogOutOutline } from "react-icons/io5";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const response = await fetch("/api/user/logout", { method: "POST" });

    if (response.ok) {
      router.replace("/login");
    } else {
      console.error("Logout failed");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer hover:bg-red-700 flex gap-2 mb-7"
    >
      <IoLogOutOutline className="align-middle" size={25} />
      Logout
    </button>
  );
}
