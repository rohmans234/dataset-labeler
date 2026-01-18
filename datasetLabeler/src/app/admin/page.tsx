import { 
  fetchAdminStats, 
  fetchFilesAction,
} from "@/lib/actions";
import StatsCards from "@/components/admin/stats-cards";
import LabelDistributionChart from "@/components/admin/label-distribution-chart";

export default async function AdminDashboard() {
  
  const [statsResponse, filesResponse] = await Promise.all([
    fetchAdminStats(),
    fetchFilesAction(),
  ]);
  
 
  if (!statsResponse.success || !statsResponse.data) {
    return (
      <div className="p-8 text-red-500 font-medium">
        Gagal memuat statistik admin. Silakan periksa koneksi Google Sheets Anda.
      </div>
    );
  }

  const { totalLabeled, distribution } = statsResponse.data;
  

  const filesRemaining = filesResponse.data?.length || 0;


  const statsForCards = {
    totalLabeled: totalLabeled,
    filesRemaining: filesRemaining,
    labelCounts: distribution.map((d: any) => ({
      label: d.name,
      count: d.value
    }))
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 p-4 md:p-0">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">
          Admin Dashboard
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Ringkasan progres pelabelan dataset secara real-time.
        </p>
      </div>

      {/* Statistik Utama - Responsif Grid di dalamnya */}
      <StatsCards stats={statsForCards} />

      {/* Grid Layout Responsif: Stack di Mobile, Side-by-side di Desktop */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-full lg:col-span-4 bg-card p-4 rounded-xl border shadow-sm">
          <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
            Distribusi Label
          </h2>
          <LabelDistributionChart data={distribution} />
        </div>
      </div>
    </div>
  );
}