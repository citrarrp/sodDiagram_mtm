import CreateForm from "@/components/form/createCustomer";
import { getBreaks, getSOD } from "@/lib/function";

export default async function Page() {
  const data = await getSOD();
  const breaks = await getBreaks();

  return <CreateForm data={data.data} istirahat={breaks.data} />;
}
