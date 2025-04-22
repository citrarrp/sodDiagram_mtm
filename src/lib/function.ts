export async function getShifts() {
  // const isProduction = process.env.NODE_ENV === "production";

  // if (isProduction) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/shift/`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch shifts");
  }

  const data = await res.json();
  return data;
  // }
}

export async function getCycle(customerName: string, cycle: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/diagram/${customerName}-${cycle}`,
    {
      next: { revalidate: 0 },
    }
  );

  const data = await res.json();
  return data;
}

export async function getSODData(
  searchValue: string,
  currentPage: number,
  limit: number,
  signal?: AbortSignal
) {
  // const isProduction = process.env.NODE_ENV === "production";

  // if (isProduction) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/sod?search=${encodeURIComponent(
      searchValue
    )}&page=${currentPage}&limit=${limit}`,
    { signal: signal }
    // { cache: "no-store" }
  );

  return res.json();
  // }
}

export async function getDataSOD(
  currentPage: number,
  limit: number,
  signal?: AbortSignal
) {
  // const isProduction = process.env.NODE_ENV === "production";

  // if (isProduction) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/sod?page=${currentPage}&limit=${limit}`,
    { signal: signal }
    // { cache: "no-store" }
  );

  return res.json();
  // }
}

export async function getSOD() {
  // const isProduction = process.env.NODE_ENV === "production";

  // if (isProduction) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sod`, {
    next: { revalidate: 0 },
  });

  return res.json();
  // }
}

export async function getDiagram() {
  // const isProduction = process.env.NODE_ENV === "production";

  // if (isProduction) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/diagram`, {
    next: { revalidate: 0 },
  });
  const sod = await res.json();
  return sod;
  // }
}

export async function getBreaks() {
  // const isProduction = process.env.NODE_ENV === "production";

  // if (isProduction) {
  console.log(process.env.NEXT_PUBLIC_BASE_URL, "VASE");
  const res2 = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/break/`, {
    next: { revalidate: 0 },
  });
  const breaks = await res2.json();
  return breaks;
  // }
}
