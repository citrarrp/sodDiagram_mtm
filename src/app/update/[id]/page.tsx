import UpdateForm from "@/components/form/updateCycle";
import { getBreaks, getCycle } from "@/lib/function";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [customerNameRaw, cycleRaw] = id.split("-");
  const customerName = decodeURIComponent(customerNameRaw);
  const cycle = decodeURIComponent(cycleRaw);

  const data = await getCycle(customerName, cycle);
  const breaks = await getBreaks();

  return (
    <UpdateForm
      customer={customerName}
      cyc={parseInt(cycle)}
      data={data.data}
      breaks={breaks.data}
    />
  );
}
