begin;

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;

drop policy chat_messages_read_visible on public.chat_messages;
drop policy chat_messages_read_own on public.chat_messages;

create policy chat_messages_read_visible_anon
on public.chat_messages for select
to anon
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

create policy chat_messages_read_visible_or_own
on public.chat_messages for select
to authenticated
using (
  author_id = (select auth.uid())
  or (
    moderation_state = 'visible'
    and exists (
      select 1
      from public.streams
      where streams.id = chat_messages.stream_id
        and streams.visibility in ('public', 'unlisted')
        and streams.status in ('live', 'ended')
    )
  )
);

commit;
