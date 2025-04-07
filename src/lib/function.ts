export async function getShifts() {
  // const isProduction = process.env.NODE_ENV === "production";

  // if (isProduction) {
  const res = await fetch(`${process.env.BASE_URL}/api/shift/`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch shifts");
  }

  const data = await res.json();
  return data;
  // }
}
