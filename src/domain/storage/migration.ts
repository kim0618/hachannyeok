import { validatePersistedAppData } from './schema';
import type { PersistedAppData } from './types';

export const CURRENT_SCHEMA_VERSION = 1 as const;
export type MigrationResult =
  | { ok: true; data: PersistedAppData }
  | { ok: false; error: 'corruptData' | 'unsupportedSchemaVersion' };

export function migratePersistedData(payload: unknown): MigrationResult {
  if (typeof payload !== 'object' || payload === null || !('schemaVersion' in payload) || typeof payload.schemaVersion !== 'number') return { ok: false, error: 'corruptData' };
  if (payload.schemaVersion !== CURRENT_SCHEMA_VERSION) return { ok: false, error: 'unsupportedSchemaVersion' };
  return validatePersistedAppData(payload);
}

