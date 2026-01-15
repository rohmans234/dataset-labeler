import { 
  fetchAdminStats, 
  fetchFilesAction, 
  fetchActivityChartData
} from "@/lib/actions";
import StatsCards from "@/components/admin/stats-cards";
import LabelDistributionChart from "@/components/admin/label-distribution-chart";
import ActivityChart from "@/components/admin/activity-chart";

export default async function AdminDashboard() {
  // 1. Ambil semua data secara paralel untuk performa lebih cepat
  const [statsResponse, filesResponse, chartResponse] = await Promise.all([
    fetchAdminStats(),
    fetchFilesAction(),
    fetchActivityChartData()
  ]);
  
  // 2. Error handling jika data utama gagal dimuat
  if (!statsResponse.success || !statsResponse.data) {
    return (
      <div className="p-8 text-red-500 font-medium">
        Gagal memuat statistik admin. Silakan periksa koneksi Google Sheets Anda.
      </div>
    );
  }

  const { totalLabeled, distribution } = statsResponse.data;
  
  // 3. Hitung jumlah file yang tersisa di folder "ALL" Google Drive
  const filesRemaining = filesResponse.data?.length || 0;

  // 4. Transformasi data untuk komponen StatsCards
  const statsForCards = {
    totalLabeled: totalLabeled,
    filesRemaining: filesRemaining,
    labelCounts: distribution.map((d: any) => ({
      label: d.name,
      count: d.value
    }))
  };

  // 5. Pastikan data aktivitas tersedia (fallback ke array kosong jika gagal)
  const activityData = chartResponse?.success ? chartResponse.data : [];

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
        
        <div className="col-span-full lg:col-span-3 bg-card p-4 rounded-xl border shadow-sm">
          <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
            Aktivitas Pelabelan Harian
          </h2>
          {/* Kirim data hasil fetch ke ActivityChart agar dinamis */}
          <ActivityChart data={activityData} />
        </div>
      </div>
    </div>
  );
}