-- Create exams table for exam information
create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  full_name text not null,
  category text not null, -- 'engineering', 'medical', 'law', 'management', etc.
  conducting_body text not null,
  exam_date date,
  application_start_date date,
  application_end_date date,
  result_date date,
  counseling_start_date date,
  counseling_end_date date,
  official_website text,
  description text,
  eligibility_criteria text,
  exam_pattern text,
  syllabus text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (public read access for exam data)
alter table public.exams enable row level security;

-- RLS policies for exams (read-only for all authenticated users)
create policy "exams_select_all"
  on public.exams for select
  using (auth.role() = 'authenticated');

-- Insert sample exam data
insert into public.exams (name, full_name, category, conducting_body, exam_date, application_start_date, application_end_date, official_website, description) values
('JEE Main', 'Joint Entrance Examination Main', 'engineering', 'NTA', '2024-04-15', '2024-01-01', '2024-02-15', 'https://jeemain.nta.nic.in', 'National level entrance exam for engineering admissions'),
('JEE Advanced', 'Joint Entrance Examination Advanced', 'engineering', 'IIT', '2024-05-26', '2024-04-30', '2024-05-07', 'https://jeeadv.ac.in', 'Entrance exam for IIT admissions'),
('NEET UG', 'National Eligibility cum Entrance Test', 'medical', 'NTA', '2024-05-05', '2024-02-09', '2024-03-09', 'https://neet.nta.nic.in', 'National level medical entrance exam'),
('CLAT', 'Common Law Admission Test', 'law', 'Consortium of NLUs', '2024-12-01', '2024-07-15', '2024-10-15', 'https://consortiumofnlus.ac.in', 'National level law entrance exam'),
('CAT', 'Common Admission Test', 'management', 'IIM', '2024-11-24', '2024-08-01', '2024-09-13', 'https://iimcat.ac.in', 'MBA entrance exam for IIMs');
