import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

test('la migración guarda datos y RLS aísla a dos usuarios incluso con acceso SQL directo', async () => {
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
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${a}',false);`);
    assert.equal((await db.query<{product_count:number}>('select product_count from public.monthly_product_usage')).rows[0].product_count,1);
    assert.equal((await db.query('select * from public.analyses')).rows.length,1);
    await assert.rejects(db.query('insert into public.analyses(user_id,filename,products) values ($1,$2,$3::jsonb)',[b,'ajeno.csv',product]), /row-level security|quota_identity_mismatch/);
    await assert.rejects(db.query("update public.analyses set filename='cambio'"),/permission denied/);
    await assert.rejects(db.query('insert into public.analyses(filename,products) values ($1,$2::jsonb)',['invalid.csv','[]']),/check constraint/);
    await assert.rejects(db.query('insert into public.analyses(filename,products) values ($1,$2::jsonb)',['invalid.csv','[{"name":"A"}]']),/check constraint/);
    await db.query(`insert into public.analyses(filename,products) values ('cuatro.csv',$1::jsonb)`,[fourProducts]);
    await assert.rejects(db.query(`insert into public.analyses(filename,products) values ('sexto.csv',$1::jsonb)`,[product]),/free_monthly_product_limit_exceeded/);
    assert.equal((await db.query<{product_count:number}>('select product_count from public.monthly_product_usage')).rows[0].product_count,5);
    await db.exec(`select set_config('request.jwt.claim.sub','${b}',false);`);
    assert.equal((await db.query('select * from public.analyses where id=$1',[id])).rows.length,0);
    await db.query(`insert into public.analyses(filename,products) values ('segundo.csv',$1::jsonb)`,[product]);
    assert.equal((await db.query('select * from public.analyses')).rows.length,1);
    assert.equal((await db.query<{product_count:number}>('select product_count from public.monthly_product_usage')).rows[0].product_count,1);
    await assert.rejects(db.query('delete from public.analyses where id=$1',[id]),/permission denied/);
    await db.exec(`reset role; set role anon; select set_config('request.jwt.claim.sub','',false);`);
    await assert.rejects(db.query('select * from public.analyses'),/permission denied/);
    await assert.rejects(db.query('select * from public.monthly_product_usage'),/permission denied/);
    await assert.rejects(db.query(`insert into public.analyses(filename,products) values ('anon.csv',$1::jsonb)`,[product]),/permission denied/);
    await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${a}',false);`);
    const reopened=await db.query<{products:unknown;product_count:number}>('select products,product_count from public.analyses where id=$1',[id]);
    assert.deepEqual(reopened.rows[0].products,JSON.parse(product));
    assert.equal(reopened.rows[0].product_count,1);
  } finally { await db.close(); }
});
