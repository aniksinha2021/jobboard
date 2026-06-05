export interface JobFilters {
  search?: string;
  jobType?: string[];
  locationType?: string[];
  experienceLevel?: string[];
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  pageSize?: number;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  locationType: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string;
  applyUrl: string;
  postedAt: string;
  isActive: boolean;
}

export interface SavedSearchData {
  id: string;
  name: string;
  filters: JobFilters;
  alertEnabled: boolean;
  alertFrequency: string;
  createdAt: string;
}

export interface AlertData {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  job: {
    id: string;
    title: string;
    company: string;
  };
  savedSearch: {
    id: string;
    name: string;
  };
}

export const JOB_TYPES = [
  'Full Stack Engineer',
  'Forward Deployment Engineer',
  'Product Manager',
  'Backend Engineer',
  'Frontend Engineer',
  'DevOps',
  'Data Scientist',
  'Designer',
  'Sales',
  'Marketing',
];

export const LOCATION_TYPES = ['REMOTE', 'ONSITE', 'HYBRID'];

export const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'lead'];

export const ALERT_FREQUENCIES = ['immediate', 'daily', 'weekly'];
