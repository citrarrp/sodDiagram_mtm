import CreateForm from "@/components/form/createCustomer";
import { getBreaks, getSOD } from "@/lib/function";

export default async function Page() {
  try {
    const data = await getSOD();
    const breaks = await getBreaks();
    return <CreateForm data={data.data} istirahat={breaks.data} />;
  } catch (error) {
    console.error("Gagal mengambil data", error);
    return (
      <div className="p-4 text-red-500">
        Gagal memuat data. Silakan refresh halaman
      </div>
    );
  }
}
