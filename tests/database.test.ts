import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

test('la migración guarda datos, aplica 5 productos lifetime y RLS aísla a dos usuarios', async () => {
  const db = new PGlite();
  const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', b='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const product=JSON.stringify([{name:'Prueba',manufacturer:'',responsible:'',warning:''}]);
  const fourProducts=JSON.stringify(Array(4).fill({name:'Prueba',manufacturer:'',responsible:'',warning:''}));
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); grant usage on schema auth to anon,authenticated; create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; insert into auth.users values ('${a}'),('${b}');`);
    await db.exec(readFileSync(new URL('../supabase/migrations/202608270001_private_analyses.sql',import.meta.url),'utf8'));
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${a}',false);`);
    const saved = await db.query<{id:string}>(`insert into public.analyses(filename,products) values ('prueba.csv',$1::jsonb) returning id`,[product]);
    const id=saved.rows[0].id;
    await db.exec('reset role;');
    await db.exec(readFileSync(new URL('../supabase/migrations/202608290001_free_monthly_quota.sql',import.meta.url),'utf8'));
    await db.exec(readFileSync(new URL('../supabase/migrations/20260829075235_global_market_architecture.sql',import.meta.url),'utf8'));
    await db.exec(readFileSync(new URL('../supabase/migrations/202608300001_stripe_subscriptions.sql',import.meta.url),'utf8'));
    await db.exec(readFileSync(new URL('../supabase/migrations/202608300003_analysis_evidence_and_safe_reanalysis.sql',import.meta.url),'utf8'));
    await db.exec(readFileSync(new URL('../supabase/migrations/202608300004_restore_immutable_analyses.sql',import.meta.url),'utf8'));
    await db.exec(readFileSync(new URL('../supabase/migrations/202608310001_unlimited_plan.sql',import.meta.url),'utf8'));
    await db.exec(readFileSync(new URL('../supabase/migrations/202608310004_free_lifetime_trial.sql',import.meta.url),'utf8'));

    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${a}',false);`);
    assert.equal((await db.query<{product_count:number}>('select product_count from public.free_account_usage')).rows[0].product_count,1);
    assert.equal((await db.query('select * from public.analyses')).rows.length,1);
    const legacy = await db.query<{market_code:string;rule_version:string}>('select market_code,rule_version from public.analyses where id=$1',[id]);
    assert.deepEqual(legacy.rows[0], { market_code: 'EU', rule_version: 'missing-fields-v1' });
    await assert.rejects(db.query(`insert into public.analyses(filename,products,market_code) values ('mal.csv',$1::jsonb,'EUROPE')`,[product]),/check constraint/);
    await assert.rejects(db.query('insert into public.analyses(user_id,filename,products) values ($1,$2,$3::jsonb)',[b,'ajeno.csv',product]), /row-level security|quota_identity_mismatch/);
    await assert.rejects(db.query("update public.analyses set filename='cambio'"),/permission denied/);
    await assert.rejects(db.query('update public.analyses set products=$1::jsonb where id=$2',[fourProducts,id]),/permission denied/);
    await assert.rejects(db.query('insert into public.analyses(filename,products) values ($1,$2::jsonb)',['invalid.csv','[]']),/check constraint/);
    await assert.rejects(db.query('insert into public.analyses(filename,products) values ($1,$2::jsonb)',['invalid.csv','[{"name":"A"}]']),/check constraint/);
    await db.query(`insert into public.analyses(filename,products,market_code) values ('cuatro.csv',$1::jsonb,'EU')`,[fourProducts]);
    await assert.rejects(db.query(`insert into public.analyses(filename,products) values ('sexto.csv',$1::jsonb)`,[product]),/free_account_product_limit_exceeded/);
    assert.equal((await db.query<{product_count:number}>('select product_count from public.free_account_usage')).rows[0].product_count,5);

    await db.exec('reset role;');
    await db.query(`insert into public.subscriptions(user_id,plan_id,status,product_limit,current_period_end) values ($1,'starter','active',1000000,now()+interval '1 month')`,[a]);
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${a}',false);`);
    await db.query(`insert into public.analyses(filename,products) values ('septimo.csv',$1::jsonb)`,[product]);
    assert.equal((await db.query<{product_count:number}>('select product_count from public.free_account_usage')).rows[0].product_count,5, 'paid usage must not mutate lifetime free usage');

    await db.exec(`select set_config('request.jwt.claim.sub','${b}',false);`);
    assert.equal((await db.query('select * from public.analyses where id=$1',[id])).rows.length,0);
    await db.query(`insert into public.analyses(filename,products) values ('segundo.csv',$1::jsonb)`,[product]);
    assert.equal((await db.query('select * from public.analyses')).rows.length,1);
    assert.equal((await db.query<{product_count:number}>('select product_count from public.free_account_usage')).rows[0].product_count,1);
    await assert.rejects(db.query('delete from public.analyses where id=$1',[id]),/permission denied/);

    await db.exec(`reset role; set role anon; select set_config('request.jwt.claim.sub','',false);`);
    await assert.rejects(db.query('select * from public.analyses'),/permission denied/);
    await assert.rejects(db.query('select * from public.free_account_usage'),/permission denied/);
    await assert.rejects(db.query('select * from public.stripe_webhook_events'),/permission denied/);
    await assert.rejects(db.query(`insert into public.analyses(filename,products) values ('anon.csv',$1::jsonb)`,[product]),/permission denied/);

    await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${a}',false);`);
    const reopened=await db.query<{products:unknown;product_count:number}>('select products,product_count from public.analyses where id=$1',[id]);
    assert.deepEqual(reopened.rows[0].products,JSON.parse(product));
    assert.equal(reopened.rows[0].product_count,1);
    await db.exec('reset role;');
    await db.query('delete from auth.users where id=$1',[a]);
    assert.equal((await db.query('select * from public.analyses where user_id=$1',[a])).rows.length,0);
    assert.equal((await db.query('select * from public.free_account_usage where user_id=$1',[a])).rows.length,0);
    assert.equal((await db.query('select * from public.analyses where user_id=$1',[b])).rows.length,1);
  } finally { await db.close(); }
});
