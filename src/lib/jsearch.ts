export function classifyJobType(title: string): string {
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

export function classifyExperience(months?: number): string {
  if (!months) return 'mid';
  if (months <= 12) return 'entry';
  if (months <= 36) return 'mid';
  if (months <= 72) return 'senior';
  return 'lead';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapJSearchJob(raw: any) {
  return {
    externalId: raw.job_id,
    title: raw.job_title || 'Software Engineer',
    company: raw.employer_name || 'Unknown Company',
    location: [raw.job_city, raw.job_state, raw.job_country].filter(Boolean).join(', ') || 'Remote',
    locationType: raw.job_is_remote ? 'REMOTE' : 'ONSITE',
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

export async function fetchFromJSearch(query: string): Promise<ReturnType<typeof mapJSearchJob>[]> {
  const apiKey = process.env.JSEARCH_API_KEY;
  if (!apiKey) return [];

  const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&num_pages=2&date_posted=week`;
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return (data.data || []).filter((r: { job_id?: string }) => r.job_id).map(mapJSearchJob);
}
