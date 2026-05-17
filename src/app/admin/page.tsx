export const dynamic = 'force-dynamic';

import DashboardStats from '@/components/admin/DashboardStats';
import RecentInscriptions from '@/components/admin/RecentInscriptions';

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble des inscriptions</p>
      </div>
      <DashboardStats />
      <div className="mt-8">
        <RecentInscriptions />
      </div>
    </div>
  );
}