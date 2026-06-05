import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const savedSearches = await prisma.savedSearch.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    savedSearches.map((s) => ({
      ...s,
      filters: JSON.parse(s.filters),
    }))
  );
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, filters, alertEnabled, alertFrequency } = await request.json();

  if (!name || !filters) {
    return NextResponse.json(
      { error: 'Name and filters are required' },
      { status: 400 }
    );
  }

  const savedSearch = await prisma.savedSearch.create({
    data: {
      userId: session.user.id,
      name,
      filters: JSON.stringify(filters),
      alertEnabled: alertEnabled ?? false,
      alertFrequency: alertFrequency ?? 'daily',
    },
  });

  // Simulate alert: find top 3 matching jobs and create alerts
  if (alertEnabled) {
    const where: Prisma.JobWhereInput = { isActive: true };
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { company: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }
    if (filters.jobType?.length > 0) where.jobType = { in: filters.jobType };
    if (filters.locationType?.length > 0) where.locationType = { in: filters.locationType };
    if (filters.experienceLevel?.length > 0) where.experienceLevel = { in: filters.experienceLevel };
    if (filters.salaryMin) where.salaryMax = { gte: filters.salaryMin };
    if (filters.salaryMax) where.salaryMin = { lte: filters.salaryMax };

    const matchingJobs = await prisma.job.findMany({
      where,
      orderBy: { postedAt: 'desc' },
      take: 3,
    });

    if (matchingJobs.length > 0) {
      await prisma.alert.createMany({
        data: matchingJobs.map((job) => ({
          userId: session.user.id,
          savedSearchId: savedSearch.id,
          jobId: job.id,
          message: `New match for "${name}": ${job.title} at ${job.company}`,
        })),
      });
    }
  }

  return NextResponse.json({ ...savedSearch, filters });
}
