import DashboardShell from '@/components/dashboard/DashboardShell';

export default function DosenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="Dosen">{children}</DashboardShell>;
}