begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.stream_status as enum (
  'scheduled',
  'preflight',
  'live',
  'ended',
  'cancelled'
);

create type public.stream_visibility as enum (
  'public',
  'followers',
  'unlisted'
);

create type public.message_moderation_state as enum (
  'visible',
  'held',
  'removed'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text not null,
  bio text not null default '',
  avatar_path text,
  locale text not null default 'en',
  is_creator boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length check (char_length(username) between 3 and 30),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]+$'),
  constraint profiles_display_name_length check (char_length(display_name) between 1 and 80),
  constraint profiles_bio_length check (char_length(bio) <= 500)
);

create unique index profiles_username_lower_idx on public.profiles (lower(username));

create table public.streams (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null unique,
  title text not null,
  topic text not null,
  language text not null default 'English',
  status public.stream_status not null default 'preflight',
  visibility public.stream_visibility not null default 'public',
  provider text not null default 'demo',
  provider_room_id text,
  scheduled_for timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  last_heartbeat_at timestamptz,
  viewer_count integer not null default 0,
  peak_viewer_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint streams_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint streams_title_length check (char_length(title) between 3 and 90),
  constraint streams_topic_length check (char_length(topic) between 2 and 60),
  constraint streams_viewer_count_nonnegative check (viewer_count >= 0),
  constraint streams_peak_viewer_count_nonnegative check (peak_viewer_count >= 0),
  constraint streams_time_order check (ended_at is null or started_at is null or ended_at >= started_at)
);

create index streams_creator_created_idx on public.streams (creator_id, created_at desc);
create index streams_live_discovery_idx on public.streams (started_at desc)
  where status = 'live' and visibility = 'public';
create index streams_scheduled_idx on public.streams (scheduled_for)
  where status = 'scheduled';

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, creator_id),
  constraint follows_no_self_follow check (follower_id <> creator_id)
);

create index follows_creator_created_idx on public.follows (creator_id, created_at desc);

create table public.chat_messages (
  id bigint generated always as identity primary key,
  stream_id uuid not null references public.streams (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  moderation_state public.message_moderation_state not null default 'visible',
  reply_to_id bigint references public.chat_messages (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint chat_messages_body_length check (char_length(btrim(body)) between 1 and 500)
);

create index chat_messages_stream_created_idx on public.chat_messages (stream_id, created_at desc);
create index chat_messages_author_created_idx on public.chat_messages (author_id, created_at desc);
create index chat_messages_reply_to_idx on public.chat_messages (reply_to_id)
  where reply_to_id is not null;
create index chat_messages_visible_stream_idx on public.chat_messages (stream_id, created_at desc)
  where moderation_state = 'visible';

create table public.stream_reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  stream_id uuid not null references public.streams (id) on delete cascade,
  message_id bigint references public.chat_messages (id) on delete set null,
  reason text not null,
  details text not null default '',
  created_at timestamptz not null default now(),
  constraint stream_reports_reason_length check (char_length(reason) between 2 and 80),
  constraint stream_reports_details_length check (char_length(details) <= 1000)
);

create index stream_reports_reporter_created_idx on public.stream_reports (reporter_id, created_at desc);
create index stream_reports_stream_created_idx on public.stream_reports (stream_id, created_at desc);
create index stream_reports_message_idx on public.stream_reports (message_id)
  where message_id is not null;

create function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function private.touch_updated_at() from public, anon, authenticated;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function private.touch_updated_at();

create trigger streams_touch_updated_at
before update on public.streams
for each row execute function private.touch_updated_at();

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    'live_' || left(replace(new.id::text, '-', ''), 12),
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'New creator'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke execute on function private.handle_new_user() from public, anon, authenticated, service_role;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create function private.enforce_stream_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if not (
    (old.status = 'scheduled' and new.status in ('preflight', 'cancelled')) or
    (old.status = 'preflight' and new.status in ('scheduled', 'live', 'cancelled')) or
    (old.status = 'live' and new.status = 'ended')
  ) then
    raise exception 'Invalid stream status transition: % -> %', old.status, new.status
      using errcode = 'check_violation';
  end if;

  if new.status = 'live' then
    new.started_at = coalesce(new.started_at, now());
    new.last_heartbeat_at = coalesce(new.last_heartbeat_at, now());
  elsif new.status = 'ended' then
    new.ended_at = coalesce(new.ended_at, now());
  end if;

  return new;
end;
$$;

revoke execute on function private.enforce_stream_transition() from public, anon, authenticated;

create trigger streams_enforce_transition
before update of status on public.streams
for each row execute function private.enforce_stream_transition();

alter table public.profiles enable row level security;
alter table public.streams enable row level security;
alter table public.follows enable row level security;
alter table public.chat_messages enable row level security;
alter table public.stream_reports enable row level security;

create policy profiles_read_public
on public.profiles for select
to anon, authenticated
using (true);

create policy profiles_insert_own
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy streams_read_discoverable_or_owned
on public.streams for select
to anon, authenticated
using (
  (visibility in ('public', 'unlisted') and status in ('scheduled', 'live', 'ended'))
  or creator_id = (select auth.uid())
);

create policy streams_insert_own
on public.streams for insert
to authenticated
with check (creator_id = (select auth.uid()));

create policy streams_update_own
on public.streams for update
to authenticated
using (creator_id = (select auth.uid()))
with check (creator_id = (select auth.uid()));

create policy streams_delete_unpublished_own
on public.streams for delete
to authenticated
using (
  creator_id = (select auth.uid())
  and status in ('scheduled', 'preflight', 'cancelled')
);

create policy follows_read
on public.follows for select
to anon, authenticated
using (true);

create policy follows_insert_own
on public.follows for insert
to authenticated
with check (follower_id = (select auth.uid()));

create policy follows_delete_own
on public.follows for delete
to authenticated
using (follower_id = (select auth.uid()));

create policy chat_messages_read_visible
on public.chat_messages for select
to anon, authenticated
using (
  moderation_state = 'visible'
  and exists (
    select 1
    from public.streams
    where streams.id = chat_messages.stream_id
      and streams.visibility in ('public', 'unlisted')
      and streams.status in ('live', 'ended')
  )
);

create policy chat_messages_read_own
on public.chat_messages for select
to authenticated
using (author_id = (select auth.uid()));

create policy chat_messages_insert_own_live
on public.chat_messages for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and moderation_state = 'visible'
  and exists (
    select 1
    from public.streams
    where streams.id = chat_messages.stream_id
      and streams.status = 'live'
  )
);

create policy chat_messages_delete_own_or_creator
on public.chat_messages for delete
to authenticated
using (
  author_id = (select auth.uid())
  or exists (
    select 1
    from public.streams
    where streams.id = chat_messages.stream_id
      and streams.creator_id = (select auth.uid())
  )
);

create policy stream_reports_insert_own
on public.stream_reports for insert
to authenticated
with check (reporter_id = (select auth.uid()));

create policy stream_reports_read_own
on public.stream_reports for select
to authenticated
using (reporter_id = (select auth.uid()));

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.streams, public.follows, public.chat_messages to anon;
grant select, insert, update on public.profiles, public.streams to authenticated;
grant delete on public.streams to authenticated;
grant select, insert, delete on public.follows, public.chat_messages to authenticated;
grant select, insert on public.stream_reports to authenticated;
grant usage, select on sequence public.chat_messages_id_seq to authenticated;
grant usage, select on sequence public.stream_reports_id_seq to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end;
$$;

commit;
