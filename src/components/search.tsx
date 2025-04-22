// "use client";
// import { useEffect, useState, useRef } from "react";

// type SOD = {
//   id: number;
//   customerName: string;
//   processName: string;
//   cycle: string;
//   waktu: string;
//   durasi: string;
// };



// function SearchInput() {
//   const [data, setData] = useState<SOD[]>([]);
//   const [searchValue, setSearchValue] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [totalPages, setTotalPages] = useState<number>(1);

//   const controllerRef = useRef<AbortController>(null);

//   useEffect(() => {
//     const delayDebounce = setTimeout(() => {
//       setLoading(true);

//       if (controllerRef.current) {
//         controllerRef.current.abort();
//       }

//       const controller = new AbortController();
//       controllerRef.current = controller;

//       fetch(
//         `${process.env.BASE_URL}/api/data?search=${encodeURIComponent(
//           searchValue
//         )}&page=${currentPage}&limit=100`,
//         { signal: controller.signal }
//       )
//         .then((res) => {
//           if (!res.ok) throw new Error("Network response was not ok");
//           return res.json();
//         })
//         .then((json) => {
//           setData(json.data);
//           setTotalPages(json.totalPages);
//           setLoading(false);
//         })
//         .catch((err) => {
//           if (err.name !== "AbortError") {
//             console.error("Fetch error:", err);
//             setLoading(false);
//           }
//         });
//     }, 500);

//     return () => clearTimeout(delayDebounce);
//   }, [searchValue, currentPage]);

//   return (
//     <div className="overflow-x-auto">
//       <input
//         type="text"
//         placeholder="Cari data..."
//         className="mb-4 p-2 border rounded w-full max-w-md"
//         value={searchValue}
//         onChange={(e) => setSearchValue(e.target.value)}
//       />
//     </div>
//   );
// }
// {
//   /* {loading && <p className="text-sm text-gray-500 mb-2">Loading...</p>}

//           {data.length === 0 && !loading ? (
//           <p className="text-center p-4 text-gray-500 font-bold text-3xl">
//             Data tidak ditemukan</p> 
//           ) : (
//             data.map((item, idx) => (

//             )))}

//       <div className="flex justify-center items-center gap-2 mt-4">
//         {Array.from({ length: totalPages }, (_, idx) => (
//           <button
//             key={idx}
//             className={`px-3 py-1 border rounded ${
//               currentPage === idx + 1 ? "bg-blue-700 text-white" : "bg-white"
//             }`}
//             onClick={() => setCurrentPage(idx + 1)}
//           >
//             {idx + 1}
//           </button>
//           ))}
//       </div>
//    </div>
//   ); */
// }
// {
//   /* } */
// }

// export default SearchInput;
