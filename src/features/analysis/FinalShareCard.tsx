import type { DerivedAnalysis } from '../../domain/scoring/types';
import { ABILITY_LABELS } from './basicAnalysisContent';
import { finalShareCardData } from './finalShareCardModel';

const signed = (value: number) => value > 0 ? `+${value}` : String(value);

export function FinalShareCard({ value }: { value: DerivedAnalysis }) {
  const data = finalShareCardData(value);
  if (!data) return null;
  const change = data.change;
  return <figure className="final-share-card" aria-label={data.accessibleLabel}>
    <div className="share-card-register" aria-hidden="true"><span>HJ · 07</span><i/><span>FINAL</span></div>
    <header className="share-card-header"><div><strong>쓸능검</strong><span>7 DAY CALIBRATION REPORT</span></div><div className="share-card-seal" aria-hidden="true"><span>7/7</span><small>COMPLETE</small></div></header>
    <section className="share-card-overall"><span>FINAL OVERALL</span><strong>{data.overall}</strong><small>종합점수</small></section>
    <h2>{data.profile}</h2>
    <section className="share-card-certification"><span>앱 내 대표 자격</span><strong>{data.certification}</strong></section>
    {change && <section className="share-card-change"><div className="share-card-change-title"><span>{change.label}</span><strong>{ABILITY_LABELS[change.ability]}</strong></div><div className="share-card-change-values"><span>{change.beforeLabel}</span><strong>{change.before} <i aria-hidden="true">→</i> {change.final}</strong><small>변화 {signed(change.delta)}</small></div><div className="share-card-mini-track" aria-hidden="true"><span className="share-card-track-line"/><i className="share-card-track-before" style={{left:`${change.before}%`}}/><i className="share-card-track-final" style={{left:`${change.final}%`}}/></div></section>}
    <footer><span>DAY 7 / 7 COMPLETE</span><small>재미를 위한 행동 측정 결과 · 앱 내 가상 자격</small></footer>
  </figure>;
}
