import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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

  const where: Prisma.JobWhereInput = {
    isActive: true,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (jobTypes.length > 0) {
    where.jobType = { in: jobTypes };
  }

  if (locationTypes.length > 0) {
    where.locationType = { in: locationTypes };
  }

  if (experienceLevels.length > 0) {
    where.experienceLevel = { in: experienceLevels };
  }

  if (salaryMin) {
    where.salaryMax = { gte: parseInt(salaryMin) };
  }

  if (salaryMax) {
    where.salaryMin = { lte: parseInt(salaryMax) };
  }

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
