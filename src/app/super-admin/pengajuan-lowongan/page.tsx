"use client";

import DashboardShell from '@/components/dashboard/DashboardShell';
import PengajuanLowonganView from '@/components/admin/PengajuanLowonganView';

export default function SuperAdminPengajuanLowonganPage() {
  return (
    <DashboardShell role="Super Admin">
      <PengajuanLowonganView role="Super Admin" />
    </DashboardShell>
  );
}
