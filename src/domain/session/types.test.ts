import { describe, expect, it } from 'vitest';
import { shouldDiscardBaselineCheckpoint, transitionSession, type ActiveBaselineSession } from './types';

const checkpoint: ActiveBaselineSession = { sessionId: 's', startedAt: '2026-08-01T00:00:00.000Z', startedLocalDateKey: '2026-08-01', completedAssessmentIds: [], partialRawResults: [] };
describe('assessment session과 DAY 1 checkpoint', () => {
  it('저장 실패 후 같은 computedPendingSave 상태에서 재시도한다', () => expect(transitionSession('computedPendingSave', 'saveFailed')).toEqual({ ok: true, state: 'computedPendingSave' }));
  it('허용되지 않은 saved 전환을 거부한다', () => expect(transitionSession('saved', 'start').ok).toBe(false));
  it('local date가 바뀐 DAY 1 checkpoint를 폐기한다', () => expect(shouldDiscardBaselineCheckpoint(checkpoint, '2026-08-02')).toBe(true));
});

