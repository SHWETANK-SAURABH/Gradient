-- Create predictions table for rank and cutoff predictions
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  prediction_type text not null, -- 'rank_predictor', 'cutoff_predictor'
  category text not null, -- 'general', 'obc', 'sc', 'st', etc.
  college_name text,
  branch_name text,
  predicted_rank integer,
  predicted_cutoff decimal(8,2),
  previous_year_cutoff decimal(8,2),
  confidence_score decimal(3,2), -- 0.00 to 1.00
  year integer not null,
  round_number integer, -- for counseling rounds
  seat_type text, -- 'home_state', 'other_state', 'all_india'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (public read access for prediction data)
alter table public.predictions enable row level security;

-- RLS policies for predictions (read-only for all authenticated users)
create policy "predictions_select_all"
  on public.predictions for select
  using (auth.role() = 'authenticated');

-- Create indexes for better performance
create index idx_predictions_exam_type on public.predictions(exam_id, prediction_type);
create index idx_predictions_category on public.predictions(category);
create index idx_predictions_year on public.predictions(year);
