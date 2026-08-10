import type { PersistedRecord } from './types';

export type SaveDecision = 'newRecord' | 'idempotentSuccess' | 'recordConflict' | 'finalAlreadyCompleted';
export const stableRecordIdentity = (record: Pick<PersistedRecord, 'recordId' | 'sessionId'>): string => `${record.sessionId}:${record.recordId}`;

function semanticValueEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((value, index) => semanticValueEqual(value, right[index]));
  if (typeof left !== 'object' || left === null || typeof right !== 'object' || right === null) return false;
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord).sort();
  const rightKeys = Object.keys(rightRecord).sort();
  return leftKeys.length === rightKeys.length && leftKeys.every((key, index) => key === rightKeys[index] && semanticValueEqual(leftRecord[key], rightRecord[key]));
}

export const recordsSemanticallyEqual = (left: PersistedRecord, right: PersistedRecord): boolean => semanticValueEqual(left, right);

export function decideRecordSave(existing: PersistedRecord | undefined, incoming: PersistedRecord, finalSlotOccupied = false): SaveDecision {
  if (existing) return existing.recordId === incoming.recordId && recordsSemanticallyEqual(existing, incoming) ? 'idempotentSuccess' : 'recordConflict';
  if (finalSlotOccupied) return 'finalAlreadyCompleted';
  return 'newRecord';
}

