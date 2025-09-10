-- Create reminders table for smart notifications
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exam_id uuid references public.exams(id) on delete cascade,
  title text not null,
  description text,
  reminder_type text not null, -- 'application_deadline', 'exam_date', 'result_date', 'counseling', 'custom'
  reminder_date timestamp with time zone not null,
  is_sent boolean default false,
  is_read boolean default false,
  priority text default 'medium', -- 'low', 'medium', 'high', 'urgent'
  notification_methods text[] default array['in_app'], -- 'in_app', 'email', 'sms'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.reminders enable row level security;

-- RLS policies for reminders
create policy "reminders_select_own"
  on public.reminders for select
  using (auth.uid() = user_id);

create policy "reminders_insert_own"
  on public.reminders for insert
  with check (auth.uid() = user_id);

create policy "reminders_update_own"
  on public.reminders for update
  using (auth.uid() = user_id);

create policy "reminders_delete_own"
  on public.reminders for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index idx_reminders_user_date on public.reminders(user_id, reminder_date);
create index idx_reminders_type on public.reminders(reminder_type);
create index idx_reminders_unsent on public.reminders(is_sent, reminder_date) where is_sent = false;
