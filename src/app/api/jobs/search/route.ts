import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { fetchFromJSearch } from '@/lib/jsearch';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function syncQueryIfStale(query: string) {
  if (!query.trim()) return;

  const cache = await prisma.searchCache.findUnique({ where: { query } });
  const isStale = !cache || Date.now() - cache.fetchedAt.getTime() > CACHE_TTL_MS;
  if (!isStale) return;

  const jobs = await fetchFromJSearch(query);
  for (const job of jobs) {
    try {
      await prisma.job.upsert({
        where: { externalId: job.externalId },
        update: { isActive: true },
        create: job,
      });
    } catch {
      // skip duplicates
    }
  }

  await prisma.searchCache.upsert({
    where: { query },
    update: { fetchedAt: new Date() },
    create: { query, fetchedAt: new Date() },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search') || '';
  const jobTypes = searchParams.getAll('jobType');
  const locationTypes = searchParams.getAll('locationType');
  const experienceLevels = searchParams.getAll('experienceLevel');
  const salaryMin = searchParams.get('salaryMin');
  const salaryMax = searchParams.get('salaryMax');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');

  // Fetch from JSearch if needed (keyword search only)
  if (search) {
    await syncQueryIfStale(search);
  }

  // Build DB query
  const where: Prisma.JobWhereInput = { isActive: true };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (jobTypes.length > 0) where.jobType = { in: jobTypes };
  if (locationTypes.length > 0) where.locationType = { in: locationTypes };
  if (experienceLevels.length > 0) where.experienceLevel = { in: experienceLevels };
  if (salaryMin) where.salaryMax = { gte: parseInt(salaryMin) };
  if (salaryMax) where.salaryMin = { lte: parseInt(salaryMax) };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { postedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({
    jobs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
