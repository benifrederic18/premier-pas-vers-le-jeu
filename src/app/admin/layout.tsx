export const dynamic = 'force-dynamic';

import { auth } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      <AdminNav />
      <main className="flex-1 ml-64 p-8 overflow-auto">{children}</main>
    </div>
  );
}