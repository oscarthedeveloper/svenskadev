import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const admin = '00000000-0000-0000-0000-000000000001';
const outsider = '00000000-0000-0000-0000-000000000002';
const doc = '10000000-0000-0000-0000-000000000001';
const other = '10000000-0000-0000-0000-000000000002';
const article = { title: 'Min artikel', subtitle: 'Underrubrik', intro: 'En ingress.', category: 'Språkråd', period: 'Nutida', sections: [], blocks: [] };
async function database(existing = false) {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public, auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;`);
  for (const migration of ['20261017_svenska_dev.sql', '20261017_editorial_workflow.sql', '20261017_homepage.sql']) {
    await db.exec(await readFile(new URL(`../supabase/migrations/${migration}`, import.meta.url), 'utf8'));
    if (existing && migration === '20261017_svenska_dev.sql') {
      await db.query("insert into svenska_nodes (id,root,slug,title,kind,content,utkast) values ($1,'grammatik','befintlig','Befintlig artikel','doc',$2,true)",['20000000-0000-0000-0000-000000000001',article]);
    }
  }
  await db.query('insert into auth.users values ($1),($2)', [admin, outsider]);
  await db.query('insert into svenska_admins values ($1)', [admin]);
  await db.query("insert into svenska_nodes (id,root,slug,title,kind) values ($1,'sprakrad','min-artikel','Min artikel','doc'),($2,'sprakrad','annan','Annan','doc')", [doc,other]);
  return db;
}
async function asRole(db, role, user = '') {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user]);
  await db.exec(`set role ${role}`);
}
const count = async (db, table) => (await db.query(`select count(*)::int n from ${table}`)).rows[0].n;

test('utkast är privata, publicering behåller föregående version och avpublicering döljer artikeln', async () => {
  const db = await database();
  try {
    await asRole(db,'anon');
    assert.equal(await count(db,'svenska_nodes'),0);
    await assert.rejects(db.query('select * from svenska_drafts'),/permission denied/);
    await asRole(db,'authenticated',outsider);
    assert.equal(await count(db,'svenska_drafts'),0);
    await assert.rejects(db.query('select svenska_save_draft($1,$2,0)',[doc,article]),/Administratör/);
    await assert.rejects(db.query("insert into svenska_nodes(root,slug,title,kind) values ('sprakrad','intrang','Intrång','doc')"),/row-level security/);
    await asRole(db,'authenticated',admin);
    assert.equal(await count(db,'svenska_nodes'),2);
    await db.query('select svenska_save_draft($1,$2,0)',[doc,article]);
    await assert.rejects(db.query('select svenska_save_draft($1,$2,0)',[doc,article]),/annan flik/);
    await db.query('select svenska_publish($1,1)',[doc]);
    await db.query('select svenska_save_draft($1,$2,2)',[doc,{...article,title:'Privat ny titel',intro:'Privat ingress'}]);
    await asRole(db,'anon');
    const visible = (await db.query('select title,content from svenska_nodes')).rows;
    assert.equal(visible.length,1);
    assert.equal(visible[0].title,'Min artikel');
    assert.equal(visible[0].content.intro,'En ingress.');
    await assert.rejects(db.query('select content from svenska_drafts'),/permission denied/);
    await asRole(db,'authenticated',outsider);
    assert.equal(await count(db,'svenska_drafts'),0);
    assert.equal((await db.query('update svenska_nodes set title=$1 returning id',['Försök'])).rows.length,0);
    assert.equal((await db.query('delete from svenska_nodes returning id')).rows.length,0);
    await asRole(db,'authenticated',admin);
    await assert.rejects(db.query('select svenska_publish($1,2)',[doc]),/ändrats/);
    await db.query('select svenska_publish($1,3)',[doc]);
    await db.query('select svenska_unpublish($1,4)',[doc]);
    await asRole(db,'anon');
    assert.equal(await count(db,'svenska_nodes'),0);
    await asRole(db,'authenticated',admin);
    assert.equal(await count(db,'svenska_drafts'),1);
    const draft = (await db.query('select content,revision from svenska_drafts')).rows[0];
    assert.equal(draft.content.title,'Privat ny titel');
    assert.equal(draft.revision,5);
  } finally { await db.close(); }
});

test('publicering kräver innehåll och flytt fungerar atomärt även med lika position', async () => {
  const db = await database();
  try {
    await asRole(db,'authenticated',admin);
    await db.query('select svenska_save_draft($1,$2,0)',[doc,{...article,intro:''}]);
    await assert.rejects(db.query('select svenska_publish($1,1)',[doc]),/ingress/);
    await db.query('select svenska_move_node($1,1)',[doc]);
    assert.deepEqual((await db.query('select id from svenska_nodes order by position')).rows.map(r=>r.id),[other,doc]);
    await db.query('select svenska_move_node($1,-1)',[doc]);
    assert.deepEqual((await db.query('select id from svenska_nodes order by position')).rows.map(r=>r.id),[doc,other]);
    await asRole(db,'authenticated',outsider);
    await assert.rejects(db.query('select svenska_move_node($1,1)',[doc]),/Administratör/);
    assert.equal((await db.query('update svenska_settings set initialized=true returning id')).rows.length,0);
    assert.equal((await db.query('select initialized from svenska_settings')).rows[0].initialized,false);
  } finally { await db.close(); }
});

test('uppgradering bevarar redan publicerade texter och installationsstatus', async () => {
  const db = await database(true);
  try {
    await asRole(db, 'anon');
    assert.equal(await count(db,'svenska_nodes'),1);
    assert.equal((await db.query('select content from svenska_nodes')).rows[0].content.intro,'En ingress.');
    assert.equal((await db.query('select initialized from svenska_settings')).rows[0].initialized,true);
    await asRole(db,'authenticated',admin);
    const draft = (await db.query('select dirty,content from svenska_drafts')).rows[0];
    assert.equal(draft.dirty,false);
    assert.equal(draft.content.title,'Min artikel');
    await db.query('delete from svenska_nodes');
    await asRole(db,'anon');
    assert.equal(await count(db,'svenska_nodes'),0);
    assert.equal((await db.query('select initialized from svenska_settings')).rows[0].initialized,true);
  } finally { await db.close(); }
});

test('samlad installation fungerar och bevarar Fornsvenska-tabellerna', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema public, auth to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
      create table public.nodes (id integer primary key, title text);
      insert into public.nodes values (1,'Befintlig fornsvensk artikel');
      create table public.admins (user_id uuid primary key);
      insert into public.admins values ('00000000-0000-0000-0000-000000000001');`);
    await db.exec(await readFile(new URL('../supabase/install-svenska.sql',import.meta.url),'utf8'));
    assert.equal((await db.query('select title from public.nodes')).rows[0].title,'Befintlig fornsvensk artikel');
    assert.equal(await count(db,'public.admins'),1);
    assert.equal(await count(db,'public.svenska_admins'),0);
    assert.equal((await db.query('select initialized from public.svenska_settings')).rows[0].initialized,false);
    await asRole(db,'anon');
    assert.equal(await count(db,'public.svenska_nodes'),0);
    await assert.rejects(db.query('select * from public.svenska_drafts'),/permission denied/);
  } finally { await db.close(); }
});

test('grundinnehållet kan importeras flera gånger utan att ändra redigerade texter', async () => {
  const db = await database();
  try {
    const seed = await readFile(new URL('../supabase/operations/seed-initial.sql',import.meta.url),'utf8');
    await db.exec(seed);
    assert.equal(await count(db,'svenska_nodes'),12);
    assert.equal(await count(db,'svenska_drafts'),4);
    await db.query("update svenska_nodes set title='Redigerad rubrik' where slug='de-och-dem'");
    await db.exec(seed);
    assert.equal(await count(db,'svenska_nodes'),12);
    assert.equal((await db.query("select title from svenska_nodes where slug='de-och-dem'")).rows[0].title,'Redigerad rubrik');
    await asRole(db,'anon');
    assert.equal(await count(db,'svenska_nodes'),10);
    assert.equal((await db.query('select initialized from svenska_settings')).rows[0].initialized,true);
  } finally { await db.close(); }
});

test('startsidan är publik men bara administratören kan spara med rätt version', async () => {
  const db=await database();
  try {
    await asRole(db,'anon');
    assert.equal((await db.query('select homepage_revision from svenska_settings')).rows[0].homepage_revision,0);
    await assert.rejects(db.query("update svenska_settings set homepage='{}'"),/permission denied/);
    await asRole(db,'authenticated',outsider);
    assert.equal((await db.query("update svenska_settings set homepage='{}' returning id")).rows.length,0);
    await asRole(db,'authenticated',admin);
    assert.equal((await db.query("update svenska_settings set homepage=$1,homepage_revision=1 where id=true and homepage_revision=0 returning id",[{headline:'Ord för'}])).rows.length,1);
    assert.equal((await db.query("update svenska_settings set homepage=$1,homepage_revision=1 where id=true and homepage_revision=0 returning id",[{headline:'För gammal'}])).rows.length,0);
    await asRole(db,'anon');
    assert.equal((await db.query('select homepage from svenska_settings')).rows[0].homepage.headline,'Ord för');
  } finally { await db.close(); }
});
