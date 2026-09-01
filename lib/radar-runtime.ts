export function radarRuntimeConfigured(liveFlag: string | undefined, ingestSecret: string | undefined) {
  return liveFlag === 'true' && (ingestSecret?.trim().length ?? 0) >= 32;
}

export function radarRuntimeEnabled(liveFlag: string | undefined, ingestSecret: string | undefined, eventCount: number) {
  return radarRuntimeConfigured(liveFlag, ingestSecret) && eventCount > 0;
}
