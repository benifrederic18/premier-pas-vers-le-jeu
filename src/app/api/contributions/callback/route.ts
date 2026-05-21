import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('x-fedapay-signature') || '';

    if (process.env.FEDAPAY_WEBHOOK_SECRET && signature) {
      if (!verifySignature(payload, signature, process.env.FEDAPAY_WEBHOOK_SECRET)) {
        return new NextResponse('Signature invalide', { status: 401 });
      }
    }

    const event = JSON.parse(payload);
    const fedapayTransactionId = String(event.entity.id);

    if (event.name === 'transaction.approved') {
      const contribution = await prisma.contribution.findFirst({
        where: { fedapayTransactionId },
      });

      if (!contribution || contribution.statut === 'PAYE') {
        return new NextResponse('OK', { status: 200 });
      }

      await prisma.contribution.update({
        where: { id: contribution.id },
        data: {
          statut: 'PAYE',
          transactionId: event.entity.reference || fedapayTransactionId,
        },
      });

      // Recalcul du total de la campagne
      const stats = await prisma.contribution.aggregate({
        where: { campagneId: contribution.campagneId, statut: 'PAYE' },
        _sum: { montant: true, nombreVotes: true },
      });

      await prisma.campagneSoutien.update({
        where: { id: contribution.campagneId },
        data: {
          totalCollecte: stats._sum.montant || 0,
          totalVotes: stats._sum.nombreVotes || 0,
        },
      });
    }

    if (event.name === 'transaction.declined') {
      await prisma.contribution.updateMany({
        where: { fedapayTransactionId },
        data: { statut: 'ECHEC' },
      });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Erreur webhook contribution:', error);
    return new NextResponse('Erreur', { status: 500 });
  }
}
