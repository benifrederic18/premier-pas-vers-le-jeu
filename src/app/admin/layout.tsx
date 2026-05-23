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
      <main className="flex-1 md:ml-64 mt-14 md:mt-0 mb-16 md:mb-0 p-4 md:p-8 overflow-auto min-w-0">{children}</main>
    </div>
  );
}