import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const JOB_QUERIES = [
  'full stack engineer',
  'forward deployment engineer',
  'product manager',
  'backend engineer',
  'frontend engineer',
  'devops engineer',
  'data scientist',
  'UX designer',
];

function classifyJobType(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('forward deployment')) return 'Forward Deployment Engineer';
  if (t.includes('full stack') || t.includes('fullstack')) return 'Full Stack Engineer';
  if (t.includes('frontend') || t.includes('front-end') || t.includes('front end')) return 'Frontend Engineer';
  if (t.includes('backend') || t.includes('back-end') || t.includes('back end')) return 'Backend Engineer';
  if (t.includes('devops') || t.includes('site reliability') || t.includes('sre') || t.includes('platform engineer')) return 'DevOps';
  if (t.includes('data scientist') || t.includes('machine learning') || t.includes('ml engineer')) return 'Data Scientist';
  if (t.includes('product manager') || t.includes(' pm ') || t.includes('product management')) return 'Product Manager';
  if (t.includes('design') || t.includes('ux') || t.includes('ui ')) return 'Designer';
  if (t.includes('sales') || t.includes('account executive') || t.includes('account manager')) return 'Sales';
  if (t.includes('marketing') || t.includes('growth') || t.includes('seo')) return 'Marketing';
  return 'Full Stack Engineer';
}

function classifyExperience(months?: number): string {
  if (!months) return 'mid';
  if (months <= 12) return 'entry';
  if (months <= 36) return 'mid';
  if (months <= 72) return 'senior';
  return 'lead';
}

function classifyLocationType(isRemote: boolean, city?: string): string {
  if (isRemote) return 'REMOTE';
  if (!city) return 'ONSITE';
  return 'ONSITE';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapJob(raw: any) {
  return {
    externalId: raw.job_id,
    title: raw.job_title || 'Software Engineer',
    company: raw.employer_name || 'Unknown Company',
    location: [raw.job_city, raw.job_state, raw.job_country].filter(Boolean).join(', ') || 'Remote',
    locationType: classifyLocationType(raw.job_is_remote, raw.job_city),
    jobType: classifyJobType(raw.job_title || ''),
    experienceLevel: classifyExperience(raw.job_required_experience?.required_experience_in_months),
    salaryMin: raw.job_min_salary ? Math.round(raw.job_min_salary) : 80000,
    salaryMax: raw.job_max_salary ? Math.round(raw.job_max_salary) : 130000,
    description: (raw.job_description || '').slice(0, 2000),
    requirements: (raw.job_highlights?.Qualifications || []).join('\n').slice(0, 1000) || 'See job description',
    applyUrl: raw.job_apply_link || raw.job_google_link || '#',
    postedAt: raw.job_posted_at_datetime_utc ? new Date(raw.job_posted_at_datetime_utc) : new Date(),
    isActive: true,
  };
}

export async function POST(request: NextRequest) {
  // Protect with a shared secret so only Vercel Cron can call this
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.JSEARCH_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'JSEARCH_API_KEY not configured' }, { status: 500 });
  }

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const query of JOB_QUERIES) {
    try {
      const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&num_pages=2&date_posted=week`;
      const res = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
      });

      if (!res.ok) {
        errors.push(`Query "${query}" failed: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const jobs = data.data || [];

      for (const raw of jobs) {
        if (!raw.job_id) continue;
        try {
          await prisma.job.upsert({
            where: { externalId: raw.job_id },
            update: { isActive: true },
            create: mapJob(raw),
          });
          created++;
        } catch {
          skipped++;
        }
      }
    } catch (err) {
      errors.push(`Query "${query}" error: ${String(err)}`);
    }
  }

  return NextResponse.json({ created, skipped, errors });
}

// Allow GET for manual testing in browser (still requires auth)
export async function GET(request: NextRequest) {
  return POST(request);
}
