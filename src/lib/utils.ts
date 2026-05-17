export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '0.0.0.0';
  return anonymizeIP(ip);
}

function anonymizeIP(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    parts[3] = '0';
    return parts.join('.');
  }
  return ip.split(':').slice(0, 3).join(':') + '::';
}

export function formatMontant(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatutLabel(statut: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    EN_ATTENTE_PAIEMENT: { label: 'En attente', color: 'yellow' },
    PAIEMENT_EN_COURS: { label: 'En cours', color: 'blue' },
    PAYE: { label: 'Payé', color: 'green' },
    ECHEC_PAIEMENT: { label: 'Échec', color: 'red' },
    REMBOURSE: { label: 'Remboursé', color: 'purple' },
    ANNULE: { label: 'Annulé', color: 'gray' },
  };
  return map[statut] ?? { label: statut, color: 'gray' };
}