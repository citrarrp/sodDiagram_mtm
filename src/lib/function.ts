export async function getShifts() {
    const res = await fetch(`${process.env.BASE_URL}/api/shift/`, {
      next: { revalidate: 0 },
    });
  
    if (!res.ok) {
      throw new Error("Failed to fetch shifts");
    }
  
    const data = await res.json();
    return data;
  }