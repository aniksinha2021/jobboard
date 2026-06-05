import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const alerts = await prisma.alert.findMany({
    where: { userId: session.user.id },
    include: {
      job: { select: { id: true, title: true, company: true } },
      savedSearch: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(alerts);
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { alertId, isRead } = await request.json();

  await prisma.alert.updateMany({
    where: { id: alertId, userId: session.user.id },
    data: { isRead },
  });

  return NextResponse.json({ success: true });
}
