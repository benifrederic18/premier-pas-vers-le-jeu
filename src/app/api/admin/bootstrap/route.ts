import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Promotes the logged-in admin to SUPER_ADMIN if no SUPER_ADMIN exists yet.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const email = (session.user as any).email;

  const existingSuperAdmin = await prisma.admin.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (existingSuperAdmin) {
    return NextResponse.json({ error: 'Un Super Admin existe déjà. Contactez-le pour obtenir les droits.' }, { status: 400 });
  }

  const admin = await prisma.admin.update({
    where: { email },
    data: { role: 'SUPER_ADMIN' },
    select: { id: true, email: true, nom: true, role: true },
  });

  return NextResponse.json({ success: true, admin });
}
