import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { PGlite } from "@electric-sql/pglite";

const migrationsDirectory = resolve("supabase/migrations");
const migrationFiles = (await readdir(migrationsDirectory)).filter((file) => file.endsWith(".sql")).sort();
if (migrationFiles.length !== 1) throw new Error(`Expected one foundation migration, found ${migrationFiles.length}.`);

const sql = await readFile(resolve(migrationsDirectory, migrationFiles[0]), "utf8");
const db = new PGlite();

await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin;
  create schema auth;
  create table auth.users (
    id uuid primary key,
    email text,
    raw_user_meta_data jsonb not null default '{}'::jsonb
  );
  create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
  create publication supabase_realtime;
`);

await db.exec(sql);

const userId = "5f6c4577-91a4-4c8f-97e6-fc6abf6cbc14";
await db.query(
  "insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3::jsonb)",
  [userId, "creator@example.com", JSON.stringify({ display_name: "Test Creator" })],
);

const profile = await db.query("select username, display_name from public.profiles where id = $1", [userId]);
if (profile.rows[0]?.display_name !== "Test Creator") throw new Error("New-user profile trigger did not create the expected profile.");

const liveStreamId = "933ba8db-190c-4bc0-b6c5-556b8f3c35be";
await db.query(
  `insert into public.streams (id, creator_id, slug, title, topic, status)
   values ($1, $2, 'migration-test-live', 'Migration test live', 'Technology', 'preflight')`,
  [liveStreamId, userId],
);
await db.query("update public.streams set status = 'live' where id = $1", [liveStreamId]);
await db.query("update public.streams set status = 'ended' where id = $1", [liveStreamId]);
const ended = await db.query("select started_at, ended_at from public.streams where id = $1", [liveStreamId]);
if (!ended.rows[0]?.started_at || !ended.rows[0]?.ended_at) throw new Error("Lifecycle timestamps were not populated.");

const scheduledStreamId = "a2b55e7f-9496-47d8-b6e0-f710c92a1c0a";
await db.query(
  `insert into public.streams (id, creator_id, slug, title, topic, status)
   values ($1, $2, 'migration-test-scheduled', 'Scheduled migration test', 'Technology', 'scheduled')`,
  [scheduledStreamId, userId],
);
let invalidTransitionBlocked = false;
try {
  await db.query("update public.streams set status = 'live' where id = $1", [scheduledStreamId]);
} catch {
  invalidTransitionBlocked = true;
}
if (!invalidTransitionBlocked) throw new Error("Invalid stream status transition was not blocked.");

const rls = await db.query(`
  select count(*)::int as count
  from pg_class
  where oid in (
    'public.profiles'::regclass,
    'public.streams'::regclass,
    'public.follows'::regclass,
    'public.chat_messages'::regclass,
    'public.stream_reports'::regclass
  ) and relrowsecurity
`);
if (rls.rows[0]?.count !== 5) throw new Error("RLS is not enabled on every exposed table.");

const publication = await db.query(`
  select count(*)::int as count
  from pg_publication_tables
  where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages'
`);
if (publication.rows[0]?.count !== 1) throw new Error("chat_messages was not added to realtime publication.");

await db.close();
console.log(JSON.stringify({
  status: "passed",
  migration: migrationFiles[0],
  checks: ["schema parsed", "profile trigger", "valid lifecycle", "invalid lifecycle", "RLS coverage", "realtime publication"],
}, null, 2));
