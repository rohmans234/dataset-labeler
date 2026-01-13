import { fetchHistoryAction } from '@/lib/actions';

export default async function HistoryPage() {
  const result = await fetchHistoryAction();
  const history = result.data || [];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header Section - Stacked on Mobile, Row on Desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 font-headline">
            Riwayat Pelabelan
          </h1>
          <p className="text-sm text-muted-foreground">
            Daftar aktivitas pelabelan yang telah diselesaikan.
          </p>
        </div>
        <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20 shadow-sm">
          Total: {history.length} File
        </span>
      </div>

      {/* Table Container - Custom Scrollbar for Mobile */}
      <div className="bg-card shadow-sm rounded-xl overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">Waktu</th>
                <th className="px-4 py-3 text-left text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">Pelabel</th>
                <th className="px-4 py-3 text-left text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">File (Asli)</th>
                <th className="px-4 py-3 text-left text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">Nama Baru</th>
                <th className="px-4 py-3 text-left text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">Label</th>
                <th className="px-4 py-3 text-left text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">Feedback</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic text-sm">
                    Belum ada riwayat pelabelan yang tercatat.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-[11px] md:text-xs text-muted-foreground">
                      {item.timestamp}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {item.user}
                    </td>
                    <td className="px-4 py-4 text-xs md:text-sm text-muted-foreground max-w-[120px] md:max-w-[180px] truncate" title={item.originalName}>
                      {item.originalName}
                    </td>
                    <td className="px-4 py-4 text-[11px] md:text-xs font-mono text-primary font-medium">
                      {item.newName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-[10px] font-bold rounded-full border shadow-sm
                        ${item.label === 'MUMTAZ' ? 'bg-green-100 text-green-800 border-green-200' : 
                          item.label === 'RASIB' ? 'bg-red-100 text-red-800 border-red-200' : 
                          item.label === 'JAYYID_JIDDAN' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          item.label === 'JAYYID' ? 'bg-sky-100 text-sky-800 border-sky-200' :
                          'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                        {item.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs md:text-sm text-muted-foreground max-w-[150px] md:max-w-[250px] truncate md:whitespace-normal italic">
                      {item.feedback || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}