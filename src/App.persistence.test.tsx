import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { deriveAnalysis } from './domain/scoring/deriveAnalysis';
import type { StoragePort } from './domain/storage/StoragePort';
import { baselineFixture } from './test/day1Fixture';
import { day1RawFixture } from './test/day1Fixture';
import { addBaselineResult, type BaselineDraft } from './domain/session/baselineDraft';
import { MemoryStorageAdapter } from './infrastructure/storage/MemoryStorageAdapter';
import type { PersistedAppData } from './domain/storage/types';
import type { LocalDateKey } from './domain/progression/types';
import { selectRepresentativeCertification } from './domain/scoring/representativeCertification';
import { summarizeDay1Evidence } from './features/analysis/basicAnalysisContent';

const data = { schemaVersion: 1 as const, baseline: baselineFixture, dailyRecords: [], metadata: {} };
const checkpointData = (date: LocalDateKey = '2026-08-12'): PersistedAppData => ({
  schemaVersion: 1, dailyRecords: [], metadata: {}, activeBaselineSession: {
    sessionId: 'checkpoint-session', startedAt: `${date}T01:00:00.000Z`, startedLocalDateKey: date,
    completedAssessmentIds: ['day1_time', 'day1_center'], partialRawResults: day1RawFixture.slice(0, 2),
  },
});
describe('App persistence startup', () => {
  it('load 전 최초 사용자 화면을 flash하지 않고 empty load 뒤 STATE A를 표시한다', async () => {
    render(<App storagePort={new MemoryStorageAdapter()} bypassInitialLoad={false} />);
    expect(screen.getByRole('heading', { name: '저장 데이터 확인 중...' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '쓸능검' })).not.toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: '쓸능검' })).toBeInTheDocument();
  });
  it('persisted raw baseline을 load해 STATE B와 동일 분석 결과를 복원한다', async () => {
    const expected = deriveAnalysis(data); expect(expected.ok).toBe(true);
    render(<App storagePort={new MemoryStorageAdapter(data)} bypassInitialLoad={false} dateNow={() => new Date('2026-08-12T12:00:00.000Z')} />);
    fireEvent.click(await screen.findByRole('button', { name: '기본 분석서 보기' }));
    expect(screen.getByText('종합 쓸능검')).toBeInTheDocument();
    if (expected.ok) expect(screen.getByText(String(expected.value.overallScore))).toBeInTheDocument();
  });
  it('다음 날짜는 STATE C placeholder를, 날짜 역행은 STATE B를 유지한다', async () => {
    const next = render(<App storagePort={new MemoryStorageAdapter(data)} bypassInitialLoad={false} dateNow={() => new Date('2026-08-13T12:00:00.000Z')} />);
    expect(await screen.findByRole('button', { name: '오늘의 추가 분석' })).toBeInTheDocument(); next.unmount();
    render(<App storagePort={new MemoryStorageAdapter(data)} bypassInitialLoad={false} dateNow={() => new Date('2026-08-11T12:00:00.000Z')} />);
    expect(await screen.findByRole('button', { name: '기본 분석서 보기' })).toBeInTheDocument();
  });
  it('load failure와 corrupt payload를 안전 UI로 분리한다', async () => {
    const failed = new MemoryStorageAdapter(); failed.fail('load');
    const first = render(<App storagePort={failed} bypassInitialLoad={false} />);
    expect(await screen.findByRole('heading', { name: '저장된 기록을 확인하지 못했습니다.' })).toBeInTheDocument(); first.unmount();
    const corrupt: StoragePort = { load: async () => ({ ok: false, error: 'corruptData' }), save: async () => ({ ok: true }), clear: async () => ({ ok: true }) };
    render(<App storagePort={corrupt} bypassInitialLoad={false} />);
    expect(await screen.findByRole('heading', { name: '저장된 분석 기록을 불러오지 못했습니다.' })).toBeInTheDocument();
  });
  it('cross-date checkpoint를 영속 폐기해 날짜 원복 뒤에도 복원하지 않는다', async () => {
    const storage = new MemoryStorageAdapter(checkpointData());
    const first = render(<App storagePort={storage} bypassInitialLoad={false} dateNow={() => new Date('2026-08-13T12:00:00.000Z')} />);
    expect(await screen.findByRole('heading', { name: '쓸능검' })).toBeInTheDocument();
    expect(storage.peek()?.activeBaselineSession).toBeNull();
    first.unmount();
    render(<App storagePort={storage} bypassInitialLoad={false} dateNow={() => new Date('2026-08-12T12:00:00.000Z')} />);
    expect(await screen.findByRole('heading', { name: '쓸능검' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '중심 감각' })).not.toBeInTheDocument();
  });
  it('cross-date checkpoint 폐기 저장 실패를 STATE A로 위장하지 않는다', async () => {
    const storage = new MemoryStorageAdapter(checkpointData()); storage.fail('save');
    render(<App storagePort={storage} bypassInitialLoad={false} dateNow={() => new Date('2026-08-13T12:00:00.000Z')} />);
    expect(await screen.findByRole('heading', { name: '이전 측정 기록을 정리하지 못했습니다.' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '쓸능검' })).not.toBeInTheDocument();
  });
  it('initial load 실패 후 retry 성공도 공통 경로로 checkpoint를 복원한다', async () => {
    const storage = new MemoryStorageAdapter(checkpointData()); storage.fail('load');
    render(<App storagePort={storage} bypassInitialLoad={false} dateNow={() => new Date('2026-08-12T12:00:00.000Z')} />);
    expect(await screen.findByRole('heading', { name: '저장된 기록을 확인하지 못했습니다.' })).toBeInTheDocument();
    storage.recover('load'); fireEvent.click(screen.getByRole('button', { name: '다시 불러오기' }));
    expect(await screen.findByRole('heading', { name: '균형 분배' })).toBeInTheDocument();
  });
  it('확인 후 clear하면 memory와 storage가 STATE A로 초기화된다', async () => {
    const storage = new MemoryStorageAdapter(data);
    render(<App storagePort={storage} bypassInitialLoad={false} dateNow={() => new Date('2026-08-12T12:00:00.000Z')} />);
    fireEvent.click(await screen.findByRole('button', { name: '전체 데이터 초기화' }));
    expect(screen.getByText(/기록을 모두 지울까요/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '기록 모두 지우기' }));
    await waitFor(() => expect(storage.peek()).toBeNull());
    expect(screen.getByRole('heading', { name: '쓸능검' })).toBeInTheDocument();
  });
  it('clear 실패 시 기존 결과를 보존하고 실패를 알린다', async () => {
    const storage = new MemoryStorageAdapter(data); storage.fail('clear');
    render(<App storagePort={storage} bypassInitialLoad={false} dateNow={() => new Date('2026-08-12T12:00:00.000Z')} />);
    fireEvent.click(await screen.findByRole('button', { name: '전체 데이터 초기화' }));
    fireEvent.click(screen.getByRole('button', { name: '기록 모두 지우기' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('기록을 초기화하지 못했습니다.');
    expect(storage.peek()?.baseline?.recordId).toBe(baselineFixture.recordId);
  });
  it('DAY 1 save 실패 후 결과와 recordId를 유지한 채 동일 record를 재저장한다', async () => {
    let now = 0; const frames: FrameRequestCallback[] = [];
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { frames.push(callback); return frames.length; });
    const storage = new MemoryStorageAdapter(); storage.fail('save');
    const draft = day1RawFixture.slice(0, 4).reduce<BaselineDraft>(addBaselineResult, {});
    render(<App initialScreen="focus-assessment" initialBaselineDraft={draft} initialSession={{ sessionId: 'stable-session', startedAt: '2026-08-12T01:00:00.000Z', startedLocalDateKey: '2026-08-12' }} dateNow={() => new Date('2026-08-12T01:02:00.000Z')} storagePort={storage} />);
    [2, 8, 11].forEach((choice, index) => {
      fireEvent.click(screen.getByRole('button', { name: index === 0 ? '시작하기' : '다음 측정' }));
      act(() => { frames.shift()?.(0); frames.shift()?.(0); }); now += 1000;
      fireEvent.click(screen.getByRole('button', { name: `선택지 ${choice}` }));
    });
    fireEvent.click(screen.getByRole('button', { name: '기본 분석 보기' }));
    expect(await screen.findByText('결과를 기기에 저장하지 못했습니다.')).toBeInTheDocument();
    expect(screen.getByText('종합 쓸능검')).toBeInTheDocument();
    storage.recover('save'); fireEvent.click(screen.getByRole('button', { name: '다시 저장' }));
    await waitFor(() => expect(storage.peek()?.baseline?.recordId).toBe('stable-session:baseline'));
    expect(screen.queryByText('결과를 기기에 저장하지 못했습니다.')).not.toBeInTheDocument();
  });
  it('checkpoint 저장 실패 시 다음 검사로 가지 않고 동일 payload retry 뒤 이동한다', async () => {
    let now = 0; vi.spyOn(performance, 'now').mockImplementation(() => { now += 3000; return now; });
    const storage = new MemoryStorageAdapter(); storage.fail('save');
    render(<App initialScreen="time-assessment" initialSession={{ sessionId: 'checkpoint-session', startedAt: '2026-08-12T01:00:00.000Z', startedLocalDateKey: '2026-08-12' }} dateNow={() => new Date('2026-08-12T01:01:00.000Z')} storagePort={storage} />);
    for (let trial = 0; trial < 3; trial += 1) {
      fireEvent.click(screen.getByRole('button', { name: trial === 0 ? '측정 시작' : '다음 측정' }));
      fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    }
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    expect(await screen.findByRole('heading', { name: '진행 기록을 저장하지 못했습니다.' })).toBeInTheDocument();
    storage.recover('save'); fireEvent.click(screen.getByRole('button', { name: '다시 저장' }));
    expect(await screen.findByRole('heading', { name: '중심 감각' })).toBeInTheDocument();
    expect(storage.peek()?.activeBaselineSession?.sessionId).toBe('checkpoint-session');
  });
  it('recordConflict를 전용 상태로 표시하고 기존 root를 덮어쓰지 않는다', async () => {
    let now = 0; const frames: FrameRequestCallback[] = [];
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { frames.push(callback); return frames.length; });
    const storage = new MemoryStorageAdapter(data);
    const draft = day1RawFixture.slice(0, 4).reduce<BaselineDraft>(addBaselineResult, {});
    render(<App initialScreen="focus-assessment" initialPersistedData={data} initialBaselineDraft={draft} initialSession={{ sessionId: baselineFixture.sessionId, startedAt: baselineFixture.startedAt, startedLocalDateKey: '2026-08-12' }} dateNow={() => new Date('2026-08-12T01:03:00.000Z')} storagePort={storage} />);
    [2, 8, 11].forEach((choice, index) => {
      fireEvent.click(screen.getByRole('button', { name: index === 0 ? '시작하기' : '다음 측정' }));
      act(() => { frames.shift()?.(0); frames.shift()?.(0); }); now += 2000;
      fireEvent.click(screen.getByRole('button', { name: `선택지 ${choice}` }));
    });
    fireEvent.click(screen.getByRole('button', { name: '기본 분석 보기' }));
    expect(screen.getByRole('heading', { name: '저장된 기록과 현재 측정 기록이 충돌했습니다.' })).toBeInTheDocument();
    expect(storage.peek()?.baseline).toEqual(baselineFixture);
    fireEvent.click(screen.getByRole('button', { name: '기존 기록 보기' }));
    expect(screen.getByText('종합 쓸능검')).toBeInTheDocument();
  });
  it('Storage round-trip 후 전체 파생 결과와 measurement evidence가 동일하다', async () => {
    const storage = new MemoryStorageAdapter();
    expect((await storage.save(data)).ok).toBe(true);
    const loaded = await storage.load(); expect(loaded.ok && loaded.data).toBeTruthy();
    if (!loaded.ok || !loaded.data) return;
    const before = deriveAnalysis(data); const after = deriveAnalysis(loaded.data);
    expect(after).toEqual(before);
    if (!before.ok || !after.ok) return;
    expect(after.value.overallScore).toBe(before.value.overallScore);
    expect(after.value.scores).toEqual(before.value.scores);
    expect(after.value.profile).toEqual(before.value.profile);
    expect(selectRepresentativeCertification(after.value.certifications, after.value.scores)).toEqual(selectRepresentativeCertification(before.value.certifications, before.value.scores));
    expect(summarizeDay1Evidence(loaded.data.baseline!.assessmentRawResults)).toEqual(summarizeDay1Evidence(data.baseline.assessmentRawResults));
  });

  it('STATE C에서 DAY 2를 저장하고 같은 날 STATE D와 reload 결과를 유지한다', async () => {
    let performanceTime = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => { performanceTime += 3000; return performanceTime; });
    const storage = new MemoryStorageAdapter(data);
    const app = render(<App storagePort={storage} bypassInitialLoad={false} dateNow={() => new Date('2026-08-13T12:00:00.000Z')} createSessionId={() => 'stable-day2-session'} />);
    fireEvent.click(await screen.findByRole('button', { name: '오늘의 추가 분석' }));
    expect(screen.getByRole('heading', { name: /방해가 있어도/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '추가 분석 시작' }));
    for (let index = 0; index < 4; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: index === 0 ? '측정 시작' : '다음 측정' }));
      fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    }
    fireEvent.click(screen.getByRole('button', { name: '결과 확인' }));
    expect(screen.getByText('심화 분석 1/5')).toBeInTheDocument();
    await waitFor(() => expect(storage.peek()?.dailyRecords[0]).toMatchObject({ recordId: 'stable-day2-session:day2', analysisDay: 2, assessmentType: 'day2_time_distraction', localDateKey: '2026-08-13' }));
    fireEvent.click(screen.getByRole('button', { name: '홈으로' }));
    expect(screen.getByRole('heading', { name: '오늘의 추가 분석 완료' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '업데이트된 분석서 보기' })).toBeInTheDocument();
    app.unmount();
    render(<App storagePort={storage} bypassInitialLoad={false} dateNow={() => new Date('2026-08-13T13:00:00.000Z')} />);
    expect(await screen.findByRole('heading', { name: '오늘의 추가 분석 완료' })).toBeInTheDocument();
  });

  it('DAY 2 save 실패 후 동일 record를 재저장하며 사용자는 재측정하지 않는다', async () => {
    let performanceTime = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => { performanceTime += 3000; return performanceTime; });
    const storage = new MemoryStorageAdapter(data); storage.fail('save');
    render(<App storagePort={storage} initialPersistedData={data} dateNow={() => new Date('2026-08-13T12:00:00.000Z')} createSessionId={() => 'retry-day2-session'} />);
    fireEvent.click(screen.getByRole('button', { name: '오늘의 추가 분석' })); fireEvent.click(screen.getByRole('button', { name: '추가 분석 시작' }));
    for (let index = 0; index < 4; index += 1) { fireEvent.click(screen.getByRole('button', { name: index === 0 ? '측정 시작' : '다음 측정' })); fireEvent.click(screen.getByRole('button', { name: '지금!' })); }
    fireEvent.click(screen.getByRole('button', { name: '결과 확인' }));
    expect(await screen.findByText(/추가 분석을 저장하지 못했습니다/)).toBeInTheDocument();
    storage.recover('save'); fireEvent.click(screen.getByRole('button', { name: '다시 저장' }));
    await waitFor(() => expect(storage.peek()?.dailyRecords[0]?.recordId).toBe('retry-day2-session:day2'));
    expect(screen.getByText('오늘 새로 확인한 것')).toBeInTheDocument();
  });

  it('DAY 2 다음 유효 날짜에는 DAY 3 intro를 연결하고 날짜 역행은 unlock하지 않는다', async () => {
    const root = { ...data, dailyRecords: [{ recordId: 'd2:day2', sessionId: 'd2', analysisDay: 2 as const, assessmentType: 'day2_time_distraction' as const, startedAt: '2026-08-13T01:00:00.000Z', completedAt: '2026-08-13T01:01:00.000Z', localDateKey: '2026-08-13' as const, rawResult: { assessmentType: 'day2_time_distraction' as const, trials: ['plain', 'distracted', 'plain', 'distracted'].map((condition, index) => ({ kind: 'timeCondition' as const, condition: condition as 'plain' | 'distracted', targetDurationMs: 3000 as const, observedDurationMs: 3000, trialId: `d2-${index}`, startedAtMs: index * 4000, completedAtMs: index * 4000 + 3000, valid: true as const, invalidReason: null })) } }] };
    const next = render(<App initialPersistedData={root} dateNow={() => new Date('2026-08-14T12:00:00.000Z')} />);
    fireEvent.click(screen.getByRole('button', { name: '오늘의 추가 분석' })); expect(screen.getByRole('heading', { name: /눈은 생각보다/ })).toBeInTheDocument(); next.unmount();
    render(<App initialPersistedData={root} dateNow={() => new Date('2026-08-12T12:00:00.000Z')} />);
    expect(screen.getByRole('button', { name: '업데이트된 분석서 보기' })).toBeInTheDocument(); expect(screen.queryByRole('button', { name: '오늘의 추가 분석' })).not.toBeInTheDocument();
  });
});
