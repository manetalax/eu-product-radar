import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const migration = (name: string) => readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');

async function bootstrapAuth(db: PGlite) {
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key);
    grant usage on schema auth to anon, authenticated;
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;
  `);
}

test('consume_api_rate_limit is atomic, bounded and resets after its fixed window', async () => {
  const db = new PGlite();
  const user = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  try {
    await bootstrapAuth(db);
    await db.query('insert into auth.users(id) values ($1)', [user]);
    await db.exec(migration('202608310006_api_rate_limits.sql'));

    for (let i = 0; i < 3; i++) {
      const result = await db.query<{ allowed: boolean }>(
        'select public.consume_api_rate_limit($1,$2,$3,$4) as allowed',
        [user, 'regulatory-agent', 3, 3600],
      );
      assert.equal(result.rows[0].allowed, true);
    }
    const denied = await db.query<{ allowed: boolean }>(
      'select public.consume_api_rate_limit($1,$2,$3,$4) as allowed',
      [user, 'regulatory-agent', 3, 3600],
    );
    assert.equal(denied.rows[0].allowed, false);

    const invalid = await db.query<{ allowed: boolean }>(
      'select public.consume_api_rate_limit($1,$2,$3,$4) as allowed',
      [user, 'regulatory-agent', 0, 3600],
    );
    assert.equal(invalid.rows[0].allowed, false);

    await db.query(
      `update public.api_rate_limits set window_start = now() - interval '2 hours' where user_id=$1 and route=$2`,
      [user, 'regulatory-agent'],
    );
    const reset = await db.query<{ allowed: boolean }>(
      'select public.consume_api_rate_limit($1,$2,$3,$4) as allowed',
      [user, 'regulatory-agent', 3, 3600],
    );
    assert.equal(reset.rows[0].allowed, true);
    const count = await db.query<{ request_count: number }>(
      'select request_count from public.api_rate_limits where user_id=$1 and route=$2',
      [user, 'regulatory-agent'],
    );
    assert.equal(count.rows[0].request_count, 1);
  } finally {
    await db.close();
  }
});

test('analysis evidence composite FK rejects cross-account ownership even outside RLS', async () => {
  const db = new PGlite();
  const owner = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const other = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  try {
    await bootstrapAuth(db);
    await db.query('insert into auth.users(id) values ($1),($2)', [owner, other]);
    await db.exec(migration('202608270001_private_analyses.sql'));
    await db.exec(migration('202608290001_free_monthly_quota.sql'));
    await db.exec(migration('20260829075235_global_market_architecture.sql'));
    await db.exec(migration('202608300001_stripe_subscriptions.sql'));
    await db.exec(migration('202608300003_analysis_evidence_and_safe_reanalysis.sql'));
    await db.exec(migration('202608300004_restore_immutable_analyses.sql'));
    await db.exec(migration('202608310002_evidence_traceability.sql'));
    await db.exec(migration('202608310007_evidence_owner_fk.sql'));

    const products = JSON.stringify([{ name: 'Producto', manufacturer: '', responsible: '', warning: '' }]);
    const analysis = await db.query<{ id: string }>(
      'insert into public.analyses(user_id,filename,products) values ($1,$2,$3::jsonb) returning id',
      [owner, 'producto.csv', products],
    );

    await assert.rejects(
      db.query(
        `insert into public.analysis_evidence(analysis_id,user_id,product_index,evidence_key,status)
         values ($1,$2,0,'manual','available')`,
        [analysis.rows[0].id, other],
      ),
      /foreign key constraint|violates foreign key/,
    );

    await db.query(
      `insert into public.analysis_evidence(analysis_id,user_id,product_index,evidence_key,status)
       values ($1,$2,0,'manual','available')`,
      [analysis.rows[0].id, owner],
    );
    const rows = await db.query<{ user_id: string }>('select user_id from public.analysis_evidence where analysis_id=$1', [analysis.rows[0].id]);
    assert.deepEqual(rows.rows, [{ user_id: owner }]);
  } finally {
    await db.close();
  }
});
