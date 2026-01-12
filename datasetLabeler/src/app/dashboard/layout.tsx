import Header from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header role="user" />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
