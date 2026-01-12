// src/app/admin/page.tsx
import { fetchAdminStats, fetchFilesAction } from "@/lib/actions"; // Tambahkan fetchFilesAction
import StatsCards from "@/components/admin/stats-cards";
import LabelDistributionChart from "@/components/admin/label-distribution-chart";
import ActivityChart from "@/components/admin/activity-chart";

export default async function AdminDashboard() {
  // Ambil data statistik dari Sheets dan data file dari Drive
  const statsResponse = await fetchAdminStats();
  const filesResponse = await fetchFilesAction();
  
  if (!statsResponse.success || !statsResponse.data) {
    return <div className="p-8 text-red-500">Gagal memuat statistik admin.</div>;
  }

  const { totalLabeled, distribution } = statsResponse.data;
  
  // Hitung jumlah file yang tersisa di folder "ALL"
  const filesRemaining = filesResponse.data?.length || 0;

  // Susun objek stats sesuai dengan StatsCardsProps
  const statsForCards = {
    totalLabeled: totalLabeled,
    filesRemaining: filesRemaining,
    labelCounts: distribution.map((d: any) => ({
      label: d.name,
      count: d.value
    }))
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan progres pelabelan dataset skripsi.</p>
      </div>

      {/* Card Statistik Utama dengan prop yang sudah diperbaiki */}
      <StatsCards stats={statsForCards} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <LabelDistributionChart data={distribution} />
        </div>
        <div className="col-span-3">
          <ActivityChart />
        </div>
      </div>
    </div>
  );
}