"use client";
import { useState } from "react";
import { useToast } from "./toast";
import { MdDelete } from "react-icons/md";

export default function DeleteButton({
  customer,
  cycle,
  onDelete,
}: {
  customer: string;
  cycle: number;
  onDelete?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/api/diagram?customer=${encodeURIComponent(customer)}&cycle=${cycle}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (response.ok) {
        showToast("success", "Data berhasil dihapus!");
        onDelete?.();
      } else {
        showToast(
          "failed",
          `Terjadi kesalahan saat menghapus data: ${data.message}`
        );
      }
    } catch (error) {
      showToast("failed", `${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="px-2 py-1 cursor-pointer bg-red-500 hover:bg-red-600 text-white rounded my-1 flex items-center gap-1.5"
      >
        <MdDelete />
        {loading ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
