-- Create user_exams table for tracking user exam registrations
create table if not exists public.user_exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  registration_number text,
  application_status text default 'planning', -- 'planning', 'applied', 'admitted', 'appeared', 'result_awaited', 'qualified', 'not_qualified'
  target_rank integer,
  target_percentile decimal(5,2),
  preparation_status text default 'started', -- 'not_started', 'started', 'ongoing', 'completed'
  notes text,
  is_priority boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, exam_id)
);

-- Enable RLS
alter table public.user_exams enable row level security;

-- RLS policies for user_exams
create policy "user_exams_select_own"
  on public.user_exams for select
  using (auth.uid() = user_id);

create policy "user_exams_insert_own"
  on public.user_exams for insert
  with check (auth.uid() = user_id);

create policy "user_exams_update_own"
  on public.user_exams for update
  using (auth.uid() = user_id);

create policy "user_exams_delete_own"
  on public.user_exams for delete
  using (auth.uid() = user_id);
