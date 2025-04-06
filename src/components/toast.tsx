"use client";

import { toast } from "sonner";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export function useToast() {
  const showToast = (status: "success" | "failed", message: string) => {
    if (status === "success") {
      toast.success(message, {
        icon: <FaCheckCircle className="text-green-500" />,
        duration: 3000,
        style: {
          backgroundColor: "#D1FAE5",
          borderLeft: "6px solid #10B981",
          color: "#065F46",
        },
      });
    } else {
      toast.error(message, {
        icon: <FaExclamationCircle className="text-red-500" />,
        duration: 3000,
        style: {
          backgroundColor: "#FEE2E2",
          borderLeft: "6px solid #EF4444",
          color: "#7F1D1D",
        },
      });
    }
  };

  return { showToast };
}

// export default function CoolToast({
//   status,
//   message,
// }: {
//   status: "success" | "failed";
//   message: string;
// }) {
//   useEffect(() => {
//     if (status === "success") {
//       toast.success(message, {
//         icon: <FaCheckCircle className="text-green-500" />,
//         duration: 5000,
//         style: {
//           backgroundColor: "#D1FAE5",
//           borderLeft: "6px solid #10B981",
//           color: "#065F46",
//         },
//       });
//     } else {
//       toast.error(message, {
//         icon: <FaExclamationCircle className="text-red-500" />,
//         duration: 5000,
//         style: {
//           backgroundColor: "#FEE2E2",
//           borderLeft: "6px solid #EF4444",
//           color: "#7F1D1D",
//         },
//       });
//     }
//   }, [status, message]);

//   return null;
// }
