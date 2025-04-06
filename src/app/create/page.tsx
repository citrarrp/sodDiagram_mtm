"use server";

import CreateForm from "@/components/form/createCustomer";

export default async function Page() {
  const res = await fetch(`${process.env.BASE_URL}/api/sod/`, {
    next: { revalidate: 0 },
  });
  const data = await res.json();

  const res2 = await fetch(`${process.env.BASE_URL}/api/break/`, {
    next: { revalidate: 0 },
  });
  const breaks = await res2.json();

  return <CreateForm data={data.data} istirahat={breaks.data} />;
}
