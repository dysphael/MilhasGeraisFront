// Dados mock para desenvolvimento (quando backend não está disponível)
export const mockDashboardData = {
  totalMiles: 106000,
  crescimento: 4000,
  aVencer: 5000,
  programas: [
    { id: '1', name: 'LATAM Pass', miles: 18000, color: 'bg-[#6EA4BF]', logo: '🛫' },
    { id: '2', name: 'Smiles', miles: 25000, color: 'bg-[#054A91]', logo: '✈️' },
    { id: '3', name: 'TudoAzul', miles: 15000, color: 'bg-[#6EA4BF]', logo: '🛩️' },
    { id: '4', name: 'Livelo', miles: 40000, color: 'bg-[#748944]', logo: '🎯' },
    { id: '5', name: 'Esfera', miles: 8000, color: 'bg-[#054A91]', logo: '💎' },
  ],
  transacoes: [
    { id: '1', type: 'credit', program: 'Smiles', amount: 5000, date: '05/04/2026', description: 'Compra cartão' },
    { id: '2', type: 'transfer', program: 'Livelo', amount: 10000, date: '03/04/2026', description: 'Transferência' },
    { id: '3', type: 'debit', program: 'LATAM Pass', amount: 12000, date: '01/04/2026', description: 'Resgate viagem' },
  ],
  alerts: [
    { id: '1', text: '5.000 milhas Smiles vencem em 15 dias', type: 'warning' },
    { id: '2', text: 'Promoção: Transferência com 50% de bônus', type: 'info' },
  ],
};

export const mockAnalyticsData = {
  programas: [
    { name: 'Livelo', miles: 40000, fill: '#748944' },
    { name: 'Smiles', miles: 25000, fill: '#054A91' },
    { name: 'LATAM', miles: 18000, fill: '#6EA4BF' },
    { name: 'TudoAzul', miles: 15000, fill: '#054A91' },
    { name: 'Esfera', miles: 8000, fill: '#6EA4BF' },
  ],
  distribuicao: [
    { name: 'Livelo', miles: 40000, color: '#748944' },
    { name: 'Smiles', miles: 25000, color: '#054A91' },
    { name: 'LATAM Pass', miles: 18000, color: '#6EA4BF' },
    { name: 'TudoAzul', miles: 15000, color: '#054A91' },
    { name: 'Esfera', miles: 8000, color: '#6EA4BF' },
  ],
  evolucao: [
    { month: 'Nov', miles: 85000 },
    { month: 'Dez', miles: 92000 },
    { month: 'Jan', miles: 88000 },
    { month: 'Fev', miles: 95000 },
    { month: 'Mar', miles: 102000 },
    { month: 'Abr', miles: 106000 },
  ],
  vencimento: [
    { month: 'Abr', miles: 5000 },
    { month: 'Mai', miles: 8000 },
    { month: 'Jun', miles: 3000 },
    { month: 'Jul', miles: 12000 },
    { month: 'Ago', miles: 6000 },
    { month: 'Set', miles: 4000 },
  ],
  crescimento: '+4.000',
  aVencer: '5.000',
  totalVencimento: '38.000',
};
