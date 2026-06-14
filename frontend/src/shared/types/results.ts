export interface Subject {
  sno: string;
  code: string;
  name: string;
  grades: string[];
  credits: string;
  status: string;
}

export interface ResultMeta {
  source: "firebase" | "scraped" | "scraped_and_cached" | "scraped_and_updated" | "mixed";
  cached: boolean;
  cachedAt?: string;
  updated?: boolean;
  responseMs?: number;
  cachedAtA?: string;
  cachedAtB?: string;
}

export interface StudentResult {
  hallTicket: string;
  studentName?: string;
  branch?: string;
  cgpa?: string;
  percentage?: string;
  creditsObtained?: string;
  creditsTotal?: string;
  subjectsDue?: string;
  subjectsTotal?: string;
  subjects?: Subject[];
  error?: string;
  _meta?: ResultMeta;
}

export interface BacklogReport {
  hallTicket: string;
  studentName?: string;
  branch?: string;
  cgpa?: string;
  creditsObtained?: string;
  creditsTotal?: string;
  subjectsDue?: string;
  subjectsTotal?: string;
  backlogCount: number;
  backlogs: Subject[];
  error?: string;
  _meta?: ResultMeta;
}

export interface CreditsProfile {
  hallTicket: string;
  studentName?: string;
  branch?: string;
  cgpa?: string;
  creditsObtained?: string;
  creditsTotal?: string;
  creditsRemaining?: number | null;
  completionPercent?: number | null;
  subjectsDue?: string;
  subjectsTotal?: string;
  subjects?: Subject[];
}

export interface CreditsCompareMetric {
  label: string;
  first: string | number | null;
  second: string | number | null;
}

export interface CreditsCompare {
  first: CreditsProfile;
  second: CreditsProfile;
  comparison: {
    creditsDifference: number | null;
    completionPercentDifference: number | null;
    metrics: CreditsCompareMetric[];
  };
  error?: string;
  _meta?: ResultMeta;
}

export interface ContrastStudent extends StudentResult {
  backlogCount?: number;
}

export interface ContrastMetric {
  label: string;
  first: string | number | null;
  second: string | number | null;
}

export interface ResultContrast {
  first: ContrastStudent;
  second: ContrastStudent;
  comparison: {
    cgpaDifference: number | null;
    creditsDifference: number | null;
    backlogCountFirst: number;
    backlogCountSecond: number;
    metrics: ContrastMetric[];
  };
  error?: string;
  _meta?: ResultMeta;
}

export interface ClassStudent {
  hallTicket: string;
  studentName?: string;
  branch?: string;
  cgpa?: string;
  creditsObtained?: string;
  creditsTotal?: string;
  subjectsDue?: string;
}

export interface ClassResult {
  prefix: string;
  startRoll: number;
  endRoll: number;
  rollDigits: number;
  totalAttempted: number;
  successCount: number;
  failedCount: number;
  classAverageCgpa?: number | null;
  students: ClassStudent[];
  failed: { hallTicket: string; error: string }[];
  _meta?: ResultMeta;
}

export interface ApiError {
  error: string;
}
