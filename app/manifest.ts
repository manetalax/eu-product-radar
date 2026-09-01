import type { MetadataRoute } from 'next';
import { manifestFor } from '@/lib/pwa-manifest';
import { serverLanguage } from '@/lib/server-language';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  return manifestFor(await serverLanguage());
}
