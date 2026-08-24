import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App.tsx';
import { day1RawFixture } from './test/day1Fixture.ts';
import { addBaselineResult, type BaselineDraft } from './domain/session/baselineDraft.ts';

describe('최초 사용자 진입 흐름', () => {
  it('최초 홈에 브랜드와 Primary CTA를 렌더한다', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /필요 이상으로 정밀하게/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '쓸능검 측정 시작' })).toHaveClass('instrument-cta');
  });

  it('홈 CTA를 누르면 5개 측정 안내와 시작 CTA를 보여준다', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '쓸능검 측정 시작' }));

    expect(screen.getByRole('heading', { level: 1, name: '측정 전에 잠깐' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByRole('button', { name: '측정 시작' })).toBeInTheDocument();
  });

  it('안내 화면에서 뒤로 누르면 홈으로 돌아간다', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '쓸능검 측정 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '홈으로 돌아가기' }));

    expect(screen.getByRole('heading', { level: 1, name: /필요 이상으로 정밀하게/ })).toBeInTheDocument();
  });

  it('INTRO 측정 시작을 누르면 reference Time READY로 바로 이동한다', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '쓸능검 측정 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));

    expect(document.querySelector('.time-ready-reference-poster')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '시간 감각' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '측정 시작' })).toBeInTheDocument();
    expect(screen.queryByText('다음 화면에서 시작하면 시간 표시 없이 측정합니다.')).not.toBeInTheDocument();
  });

  it('reference READY Start 1회로 RUNNING에 진입한다', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '쓸능검 측정 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    expect(document.querySelector('.time-ready-reference-poster')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '측정 시작' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '지금!' })).toBeInTheDocument();
  });

  it('Home → Intro → Time 완료 후 Center Ready로 연결된다', () => {
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => { now += 3000; return now; });
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '쓸능검 측정 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    for (let trial = 0; trial < 3; trial += 1) {
      fireEvent.click(screen.getByRole('button', { name: trial === 0 ? '측정 시작' : '다음 측정' }));
      fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    }
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    expect(screen.getByRole('heading', { name: '중심 감각' })).toBeInTheDocument();
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
  });

  it('Center 완료 후 Balance Ready로 연결된다', () => {
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => { now += 3000; return now; });
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '쓸능검 측정 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    for (let trial = 0; trial < 3; trial += 1) {
      fireEvent.click(screen.getByRole('button', { name: trial === 0 ? '측정 시작' : '다음 측정' }));
      fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    }
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    for (let trial = 0; trial < 3; trial += 1) {
      fireEvent.click(screen.getByRole('button', { name: trial === 0 ? '측정 시작' : '다음 도형' }));
      const area = screen.getByRole('application');
      Object.defineProperty(area, 'getBoundingClientRect', { configurable: true, value: () => ({ left: 0, top: 0, width: 100, height: 100 }) });
      fireEvent.pointerDown(area, { clientX: 50, clientY: 50 });
    }
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    expect(screen.getByRole('heading', { name: '균형 분배' })).toBeInTheDocument();
    expect(screen.getByText('3 / 5')).toBeInTheDocument();
  });

  it('Balance 완료 후 Control Ready로 연결된다', () => {
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => { now += 3000; return now; });
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '쓸능검 측정 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    for (let trial = 0; trial < 3; trial += 1) {
      fireEvent.click(screen.getByRole('button', { name: trial === 0 ? '측정 시작' : '다음 측정' }));
      fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    }
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    for (let trial = 0; trial < 3; trial += 1) {
      fireEvent.click(screen.getByRole('button', { name: trial === 0 ? '측정 시작' : '다음 도형' }));
      const area = screen.getByRole('application');
      Object.defineProperty(area, 'getBoundingClientRect', { configurable: true, value: () => ({ left: 0, top: 0, width: 100, height: 100 }) });
      fireEvent.pointerDown(area, { clientX: 50, clientY: 50 });
    }
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '여기서 나누기' }));
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    fireEvent.click(screen.getByRole('button', { name: '여기서 나누기' }));
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));

    expect(screen.getByRole('heading', { name: '손가락 통제' })).toBeInTheDocument();
    expect(screen.getByText('4 / 5')).toBeInTheDocument();
    expect(screen.queryByText('검사 3 / 5')).not.toBeInTheDocument();
    expect(screen.queryByText('균형 분배 검사는 다음 단계에서 연결됩니다.')).not.toBeInTheDocument();
  });

  it('Control 완료 후 Focus Ready로 연결된다', () => {
    let now = 0;
    const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => now);
    const requestSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
    render(<App initialScreen="control-assessment" />);
    for (let trial = 0; trial < 3; trial += 1) {
      fireEvent.click(screen.getByRole('button', { name: trial === 0 ? '측정 시작' : '다음 측정' }));
      now += 1000;
      fireEvent.click(screen.getByRole('button', { name: '지금 멈추기' }));
    }
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    expect(screen.getByRole('heading', { name: '시각 집중' })).toBeInTheDocument();
    expect(screen.getByText('5 / 5')).toBeInTheDocument();
    nowSpy.mockRestore(); requestSpy.mockRestore();
  });

  it('선행 raw result 없이 Focus만 완료하면 누락 기록 오류 화면으로 이동한다', () => {
    let now = 0;
    const frames: FrameRequestCallback[] = [];
    const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => now);
    const requestSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { frames.push(callback); return frames.length; });
    render(<App initialScreen="focus-assessment" />);
    const targetChoices = [2, 8, 11];
    targetChoices.forEach((choice, index) => {
      fireEvent.click(screen.getByRole('button', { name: index === 0 ? '측정 시작' : '다음 측정' }));
      act(() => { frames.shift()?.(0); frames.shift()?.(0); }); now += 1000;
      fireEvent.click(screen.getByRole('button', { name: `선택지 ${choice}` }));
    });
    fireEvent.click(screen.getByRole('button', { name: '기본 분석 보기' }));
    expect(screen.getByRole('heading', { name: '측정 기록을 찾을 수 없습니다.' })).toBeInTheDocument();
    nowSpy.mockRestore(); requestSpy.mockRestore();
  });

  it('Focus 완료 후 앞선 네 raw result가 있으면 실제 Basic Analysis로 이동한다', () => {
    let now = 0;
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { frames.push(callback); return frames.length; });
    const draft = day1RawFixture.slice(0, 4).reduce<BaselineDraft>(addBaselineResult, {});
    render(<App initialScreen="focus-assessment" initialBaselineDraft={draft} initialSession={{ sessionId: 'session', startedAt: '2026-08-12T01:00:00.000Z', startedLocalDateKey: '2026-08-12' }} dateNow={() => new Date('2026-08-12T01:02:00.000Z')} />);
    [2, 8, 11].forEach((choice, index) => {
      fireEvent.click(screen.getByRole('button', { name: index === 0 ? '측정 시작' : '다음 측정' }));
      act(() => { frames.shift()?.(0); frames.shift()?.(0); }); now += 1000;
      fireEvent.click(screen.getByRole('button', { name: `선택지 ${choice}` }));
    });
    fireEvent.click(screen.getByRole('button', { name: '기본 분석 보기' }));
    expect(screen.getByText('종합 쓸능검')).toBeInTheDocument();
    expect(screen.getByText('기본 분석 완료')).toBeInTheDocument();
    expect(screen.getByText('오늘 새로 발견한 것')).toBeInTheDocument();
    expect(screen.getAllByText('DAY 1 / 7')).toHaveLength(2);
    expect(screen.queryByText('기본 분석 준비')).not.toBeInTheDocument();
  });

  it('이전 날짜 Time draft로 다음 assessment에 진입하면 전체 DAY 1을 즉시 폐기한다', async () => {
    const draft = addBaselineResult({}, day1RawFixture[0]!);
    render(<App initialScreen="center-assessment" initialBaselineDraft={draft} initialSession={{ sessionId: 'old-session', startedAt: '2026-08-12T01:00:00.000Z', startedLocalDateKey: '2026-08-12' }} dateNow={() => new Date('2026-08-13T01:00:00.000Z')} />);
    expect(await screen.findByRole('heading', { name: '날짜가 변경되어 측정을 다시 시작해야 합니다.' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '중심 감각' })).not.toBeInTheDocument();
  });

  it('날짜 invalidation 뒤 원래 날짜로 돌아와도 이전 draft를 복구하지 않고 새 session을 만든다', async () => {
    let date = new Date('2026-08-13T01:00:00.000Z');
    const createSessionId = vi.fn(() => 'new-session');
    const draft = addBaselineResult({}, day1RawFixture[0]!);
    render(<App initialScreen="center-assessment" initialBaselineDraft={draft} initialSession={{ sessionId: 'old-session', startedAt: '2026-08-12T01:00:00.000Z', startedLocalDateKey: '2026-08-12' }} dateNow={() => date} createSessionId={createSessionId} />);
    expect(await screen.findByRole('heading', { name: '날짜가 변경되어 측정을 다시 시작해야 합니다.' })).toBeInTheDocument();
    date = new Date('2026-08-12T02:00:00.000Z');
    fireEvent.click(screen.getByRole('button', { name: '처음부터 다시 측정' }));
    expect(screen.getByRole('heading', { name: '측정 전에 잠깐' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    expect(createSessionId).toHaveBeenCalledOnce();
    expect(screen.getByRole('heading', { name: '시간 감각' })).toBeInTheDocument();
  });

  it('Focus 완료 직전 날짜가 달라지면 final safeguard가 BaselineRecord 생성을 막는다', async () => {
    let date = new Date('2026-08-12T01:00:00.000Z');
    let now = 0;
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { frames.push(callback); return frames.length; });
    const draft = day1RawFixture.slice(0, 4).reduce<BaselineDraft>(addBaselineResult, {});
    render(<App initialScreen="focus-assessment" initialBaselineDraft={draft} initialSession={{ sessionId: 'session', startedAt: '2026-08-12T01:00:00.000Z', startedLocalDateKey: '2026-08-12' }} dateNow={() => date} />);
    [2, 8, 11].forEach((choice, index) => {
      fireEvent.click(screen.getByRole('button', { name: index === 0 ? '측정 시작' : '다음 측정' }));
      act(() => { frames.shift()?.(0); frames.shift()?.(0); }); now += 1000;
      fireEvent.click(screen.getByRole('button', { name: `선택지 ${choice}` }));
    });
    date = new Date('2026-08-13T01:00:00.000Z');
    fireEvent.click(screen.getByRole('button', { name: '기본 분석 보기' }));
    expect(await screen.findByRole('heading', { name: '날짜가 변경되어 측정을 다시 시작해야 합니다.' })).toBeInTheDocument();
    expect(screen.queryByText('종합 쓸능검')).not.toBeInTheDocument();
  });
});
