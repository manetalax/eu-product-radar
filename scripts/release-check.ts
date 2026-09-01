import { checkReleaseConfig } from '../lib/release-config';

const result = checkReleaseConfig({ ...process.env, NODE_ENV: 'production' });
for (const warning of result.warnings) console.warn(`WARN: ${warning}`);
if (!result.ok) {
  for (const error of result.errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}
console.log('ImportVerifier production configuration: OK');
