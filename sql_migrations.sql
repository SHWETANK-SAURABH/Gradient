-- Enable pgcrypto for gen_random_uuid
create extension if not exists "pgcrypto";

-- Unique indexes to support upserts used in backend
create unique index if not exists idx_exams_unique_name on exams (name);
create unique index if not exists idx_exam_calendar_unique on exam_calendar (exam_id, event_type, year);
create unique index if not exists idx_pyq_unique on pyq_questions (exam_id, year, subject, question_text);

-- Fix user_reminders FK to reference exam_calendar if needed
-- Note: Adjust if your table/column names differ.
alter table if exists user_reminders
    drop constraint if exists user_reminders_exam_date_id_fkey;

alter table if exists user_reminders
    add constraint user_reminders_exam_date_id_fkey
        foreign key (exam_date_id) references exam_calendar(id) on delete cascade;
