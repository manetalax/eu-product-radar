export function radarRuntimeEnabled(liveFlag: string | undefined, ingestSecret: string | undefined, eventCount: number) {
  const ingestSecretReady = (ingestSecret?.trim().length ?? 0) >= 32;
  return liveFlag === 'true' && ingestSecretReady && eventCount > 0;
}
