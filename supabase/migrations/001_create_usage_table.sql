-- User usage tracking
create table public.user_usage (
  id uuid primary key references auth.users(id) on delete cascade,
  questions_used integer default 0,
  max_questions integer default 16,
  created_at timestamp with time zone default now(),
  last_question_at timestamp with time zone
);

-- Enable RLS
alter table public.user_usage enable row level security;

-- Users can read their own usage
create policy "Users can view own usage"
  on public.user_usage for select
  using (auth.uid() = id);

-- Create usage row on first sign-in (trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_usage (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
