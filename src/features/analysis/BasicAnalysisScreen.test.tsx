import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { deriveAnalysis } from '../../domain/scoring/deriveAnalysis';
import { baselineFixture, day1RawFixture } from '../../test/day1Fixture';
import { BasicAnalysisScreen } from './BasicAnalysisScreen';
import { profileDisplay, profileVariantDisplay } from './basicAnalysisContent';

const analysis = deriveAnalysis({ schemaVersion: 1, baseline: baselineFixture, dailyRecords: [], metadata: {} });

describe('BasicAnalysisScreen', () => {
  it('실제 분석 score/profile/자격/5개 능력/측정 근거를 표시하고 engine key는 숨긴다', () => {
    expect(analysis.ok).toBe(true);
    const view=render(<BasicAnalysisScreen baseline={baselineFixture} analysis={analysis} onRestart={() => undefined} onHome={() => undefined} />);
    expect(view.container.querySelector('.final-completion-motion')).not.toBeInTheDocument();
    if (!analysis.ok) return;
    expect(screen.getByText('쓸능검 · 기본 분석')).toBeInTheDocument();
    expect(screen.getByText('BASELINE · 1차 분석')).toBeVisible();
    expect(screen.getAllByText('DAY 1 / 7')[0]).toBeVisible();
    expect(screen.getByText(/오늘은 5가지 기본 능력의 기준점을 만들었습니다/)).toBeVisible();
    expect(screen.getByText(/남은 조건 측정 후 최종 결과가 완성됩니다/)).toBeVisible();
    expect(screen.getByText('종합 쓸능검')).toBeInTheDocument();
    expect(screen.getByText(String(analysis.value.overallScore))).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: profileDisplay(analysis.value.profile)! })).toBeInTheDocument();
    expect(screen.getByText(profileVariantDisplay(analysis.value.profile.profileVariantKey))).toBeInTheDocument();
    expect(screen.getByText('5개 능력치')).toBeInTheDocument();
    const compact = screen.getByLabelText('기본 분석 5개 능력 요약');
    expect(compact.children).toHaveLength(5);
    Object.entries(analysis.value.scores).forEach(([ability, score]) => {
      const cell = within(compact).getByText(String(score)).parentElement!;
      expect(cell).toHaveTextContent(({ time: '시간', center: '중심', balance: '균형', control: '통제', focus: '집중' } as const)[ability as keyof typeof analysis.value.scores]);
    });
    expect(screen.getByText(/평균 3\.000초/)).toBeInTheDocument();
    expect(screen.getByText(/3회 중 2회/)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain(analysis.value.profile.profileFamilyKey);
    expect(document.body.textContent).not.toContain(analysis.value.profile.profileVariantKey);
    expect(document.body.textContent).not.toMatch(/special|grade1|grade2|grade3|observer/);
    expect(screen.getByRole('button', { name: '결과 공유하기' })).toBeEnabled();
    expect(document.querySelector('.certification-hero .certification-seal')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('주요 자격 인증')).toBeInTheDocument();
    expect(document.querySelector('.certification-seal-copy')).toHaveTextContent('PRECISION CERTIFIED');
    expect(document.querySelector('.certification-hero')?.children).toHaveLength(2);
    expect(document.querySelector('.certification-hero')?.firstElementChild).toHaveClass('certification-seal');
    expect(document.querySelector('.certification-copy > strong')).toHaveTextContent('화면중앙감별사 특급');
    expect(document.querySelector('.analysis-hero .overall-score')).toBeInTheDocument();
    expect(document.querySelector('.final-share-card')).not.toBeInTheDocument();
  });
  it('baseline 누락과 insufficient evidence를 명시적으로 처리한다', () => {
    const view = render(<BasicAnalysisScreen onRestart={() => undefined} onHome={() => undefined} />);
    expect(screen.getByRole('heading', { name: '측정 기록을 찾을 수 없습니다.' })).toBeInTheDocument();
    view.rerender(<BasicAnalysisScreen baseline={baselineFixture} analysis={{ ok: false, reason: 'insufficientEvidence' }} onRestart={() => undefined} onHome={() => undefined} />);
    expect(screen.getByRole('heading', { name: '분석에 필요한 기록이 충분하지 않습니다.' })).toBeInTheDocument();
  });
  it('calculationFailure를 0점 정상 결과 대신 안전 오류 화면으로 처리한다', () => {
    render(<BasicAnalysisScreen baseline={baselineFixture} analysis={{ ok: false, reason: 'calculationFailure' }} onRestart={() => undefined} onHome={() => undefined} />);
    expect(screen.getByRole('heading', { name: '분석에 필요한 기록이 충분하지 않습니다.' })).toBeInTheDocument();
    expect(screen.queryByText('종합 쓸능검')).not.toBeInTheDocument();
  });
  it('Focus 정답이 0개면 실제 정답 수와 정답 반응 기록 없음을 표시한다', () => {
    const assessmentRawResults = day1RawFixture.map((result) => result.assessmentType === 'day1_focus_search'
      ? { ...result, trials: result.trials.map((trial) => ({ ...trial, selectedTargetId: 'wrong-item', correct: false })) }
      : result);
    const zeroCorrectBaseline = { ...baselineFixture, assessmentRawResults };
    const zeroCorrectAnalysis = deriveAnalysis({ schemaVersion: 1, baseline: zeroCorrectBaseline, dailyRecords: [], metadata: {} });
    render(<BasicAnalysisScreen baseline={zeroCorrectBaseline} analysis={zeroCorrectAnalysis} onRestart={() => undefined} onHome={() => undefined} />);
    expect(screen.getByText(/3회 중 0회/)).toBeInTheDocument();
    expect(screen.getByText(/정답 반응 기록 없음/)).toBeInTheDocument();
  });
  it('동일 baseline은 동일한 핵심 결과 텍스트를 렌더한다', () => {
    const first = render(<BasicAnalysisScreen baseline={baselineFixture} analysis={analysis} onRestart={() => undefined} onHome={() => undefined} />);
    const firstText = first.container.textContent;
    first.unmount();
    const second = render(<BasicAnalysisScreen baseline={baselineFixture} analysis={analysis} onRestart={() => undefined} onHome={() => undefined} />);
    expect(second.container.textContent).toBe(firstText);
  });
  it('DAY1 진행 정보와 다음 조건을 유지하고 미완성 상세 CTA는 표시하지 않는다', () => {
    render(<BasicAnalysisScreen baseline={baselineFixture} analysis={analysis} onRestart={() => undefined} onHome={() => undefined} />);
    expect(screen.getAllByText('DAY 1 / 7')).toHaveLength(2);
    expect(screen.getByText(/DAY 2에는 움직임이 있을 때/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '홈으로' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: '상세 분석 보기' })).not.toBeInTheDocument();
    expect(screen.queryByText('상세 분석은 준비 중입니다.')).not.toBeInTheDocument();
  });
  it('활성 Basic CTA가 실제 presentation message를 adapter에 전달한다', async () => {
    expect(analysis.ok).toBe(true);
    const open = vi.fn().mockResolvedValue(undefined);
    render(<BasicAnalysisScreen baseline={baselineFixture} analysis={analysis} sharePort={{ open }} onRestart={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: '결과 공유하기' }));
    await waitFor(() => expect(open).toHaveBeenCalledTimes(1));
    expect(open.mock.calls[0]?.[0]).toContain(analysis.ok ? `종합 쓸능검 ${analysis.value.overallScore}점` : '');
    expect(screen.getByRole('heading', { name: analysis.ok ? profileDisplay(analysis.value.profile)! : '' })).toBeInTheDocument();
  });
});

describe('profile display content', () => {
  it('high/low family를 확정된 사용자 문구로 조합한다', () => expect(profileDisplay({ profileFamilyKey: 'balance_control', profileVariantKey: 'mixed:noTendency', supportingEvidenceKeys: [] })).toBe('균형은 잘 맞추지만\n멈출 때를 조금 놓치는 인간'));
});
