import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { deriveAnalysis } from '../../domain/scoring/deriveAnalysis';
import { baselineFixture, day1RawFixture } from '../../test/day1Fixture';
import { BasicAnalysisScreen } from './BasicAnalysisScreen';
import { profileDisplay, profileVariantDisplay } from './basicAnalysisContent';

const analysis = deriveAnalysis({ schemaVersion: 1, baseline: baselineFixture, dailyRecords: [], metadata: {} });

describe('BasicAnalysisScreen', () => {
  it('실제 분석 score/profile/자격/5개 능력/측정 근거를 표시하고 engine key는 숨긴다', () => {
    expect(analysis.ok).toBe(true);
    render(<BasicAnalysisScreen baseline={baselineFixture} analysis={analysis} onRestart={() => undefined} onHome={() => undefined} />);
    if (!analysis.ok) return;
    expect(screen.getByText(String(analysis.value.overallScore))).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: profileDisplay(analysis.value.profile)! })).toBeInTheDocument();
    expect(screen.getByText(profileVariantDisplay(analysis.value.profile.profileVariantKey))).toBeInTheDocument();
    expect(screen.getByText('5개 능력치')).toBeInTheDocument();
    Object.values(analysis.value.scores).forEach((score) => expect(screen.getByText(String(score))).toBeInTheDocument());
    expect(screen.getByText(/평균 3\.000초/)).toBeInTheDocument();
    expect(screen.getByText(/3회 중 2회/)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain(analysis.value.profile.profileFamilyKey);
    expect(document.body.textContent).not.toContain(analysis.value.profile.profileVariantKey);
    expect(document.body.textContent).not.toMatch(/special|grade1|grade2|grade3|observer/);
    expect(screen.getByRole('button', { name: '결과 공유하기' })).toBeDisabled();
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
    expect(screen.queryByText('종합 하찮력')).not.toBeInTheDocument();
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
  it('상세 분석 CTA를 준비 중 상태로 명확히 표시한다', () => {
    render(<BasicAnalysisScreen baseline={baselineFixture} analysis={analysis} onRestart={() => undefined} onHome={() => undefined} />);
    expect(screen.getByRole('button', { name: '상세 분석 보기' })).toBeDisabled();
    expect(screen.getByText('상세 분석은 준비 중입니다.')).toBeInTheDocument();
  });
});

describe('profile display content', () => {
  it('high/low family를 확정된 사용자 문구로 조합한다', () => expect(profileDisplay({ profileFamilyKey: 'balance_control', profileVariantKey: 'mixed:noTendency', supportingEvidenceKeys: [] })).toBe('균형은 잘 맞추지만\n멈출 때를 조금 놓치는 인간'));
});
