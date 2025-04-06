"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./toast";
import { MdDelete } from "react-icons/md";

export default function DeleteButton({
  customer,
  cycle,
}: {
  customer: string;
  cycle: number;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/diagram?customer=${encodeURIComponent(customer)}&cycle=${cycle}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (response.ok) {
        router.refresh();

        showToast("success", "Data deleted successfully!");
      } else {
        showToast("failed", `Error: ${data.message}`);
      }
    } catch (error) {
      showToast("failed", `Failed to delete data: ${error}`);
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
