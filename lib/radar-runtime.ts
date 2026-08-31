type RadarRuntimeEnv = {
  REGULATORY_RADAR_LIVE?: string;
  REGULATORY_INGEST_SECRET?: string;
};

export function radarRuntimeEnabled(env: RadarRuntimeEnv, eventCount: number) {
  const ingestSecretReady = (env.REGULATORY_INGEST_SECRET?.trim().length ?? 0) >= 32;
  return env.REGULATORY_RADAR_LIVE === 'true' && ingestSecretReady && eventCount > 0;
}
