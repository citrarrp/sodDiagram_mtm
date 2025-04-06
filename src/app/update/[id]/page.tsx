"use server";
import UpdateForm from "@/components/form/updateCycle";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [customerNameRaw, cycleRaw] = id.split("-");
  const customerName = decodeURIComponent(customerNameRaw);
  const cycle = decodeURIComponent(cycleRaw);

  const getCycle = async () => {
    const res = await fetch(
      `${process.env.BASE_URL}/api/diagram/${customerName}-${cycle}`,
      {
        next: { revalidate: 0 },
      }
    );

    const data = await res.json();
    return data;
  };
  const data = await getCycle();
  const res2 = await fetch(`${process.env.BASE_URL}/api/break/`, {
    next: { revalidate: 0 },
  });
  const breaks = await res2.json();

  return (
    <UpdateForm
      customer={customerName}
      cyc={parseInt(cycle)}
      data={data.data}
      breaks={breaks.data}
    />
  );
}
