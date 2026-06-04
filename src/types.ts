export type ViewState = 'registration' | 'success' | 'admin';

export const DEPARTMENTS = [
  'Cardiology',
  'Orthopedics',
  'Neurology',
  'Pediatrics',
  'General Medicine',
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const DEPT_META: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  Cardiology:        { color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-200',   dot: 'bg-rose-500' },
  Orthopedics:       { color: 'text-sky-600',     bg: 'bg-sky-50',     border: 'border-sky-200',    dot: 'bg-sky-500' },
  Neurology:         { color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',  dot: 'bg-amber-500' },
  Pediatrics:        { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200',dot: 'bg-emerald-500' },
  'General Medicine':{ color: 'text-slate-600',   bg: 'bg-slate-50',   border: 'border-slate-200',  dot: 'bg-slate-500' },
};

export interface PatientFormData {
  full_name: string;
  age: string;
  gender: string;
  mobile_number: string;
  address: string;
  department: string;
  priority: string;
}

export interface PatientRecord {
  id: string;
  token_number: string;
  full_name: string;
  age: number;
  gender: string;
  mobile_number: string;
  address: string;
  department: string;
  status: string;
  priority: string;
  registered_at: string;
}
