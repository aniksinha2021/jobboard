import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const [savedSearchesRaw, alertsRaw] = await Promise.all([
    prisma.savedSearch.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.alert.findMany({
      where: { userId: session.user.id },
      include: {
        job: { select: { id: true, title: true, company: true } },
        savedSearch: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const savedSearches = savedSearchesRaw.map((s) => ({
    ...s,
    filters: JSON.parse(s.filters),
    createdAt: s.createdAt.toISOString(),
  }));

  const alerts = alertsRaw.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <DashboardClient
      initialSavedSearches={savedSearches}
      initialAlerts={alerts}
      userName={session.user.name || session.user.email || 'User'}
    />
  );
}
