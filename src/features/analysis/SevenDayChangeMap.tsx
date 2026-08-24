import type { Ability, AbilityScores } from '../../domain/scoring/types';
import { ABILITY_LABELS } from './basicAnalysisContent';
import { sevenDayChangeRows } from './sevenDayChangeMapModel';

interface Props { baselineScores: AbilityScores; finalScores: AbilityScores; selectedAbility: Ability | null }
const signed = (value: number) => value > 0 ? `+${value}` : String(value);

export function SevenDayChangeMap({ baselineScores, finalScores, selectedAbility }: Props) {
  return <section className="report-section seven-day-change-map" aria-labelledby="seven-day-change-title">
    <div className="section-index">01 · 7-DAY CHANGE MAP</div><h2 id="seven-day-change-title">7일 변화 지도</h2>
    <p className="change-map-description">첫날의 기준점과 7일 후 최종 결과를 비교합니다.</p>
    <div className="change-map-rows">{sevenDayChangeRows(baselineScores, finalScores, selectedAbility).map((row) => {
      const start = Math.min(row.day1Baseline, row.final); const distance = Math.abs(row.final - row.day1Baseline);
      return <article className={row.day7Selected ? 'change-map-row is-day7-selected' : 'change-map-row'} key={row.ability}>
        <header><strong>{ABILITY_LABELS[row.ability]}</strong>{row.day7Selected && <span>DAY 7 보정</span>}</header>
        <div className="change-map-values"><span>DAY 1 <strong>{row.day1Baseline}</strong></span><span>FINAL <strong>{row.final}</strong></span><b className={row.delta > 0 ? 'is-positive' : row.delta < 0 ? 'is-negative' : undefined}>{signed(row.delta)}</b></div>
        <div className="change-map-track" role="img" aria-label={`${ABILITY_LABELS[row.ability]} DAY 1 ${row.day1Baseline}점에서 FINAL ${row.final}점, 변화 ${signed(row.delta)}점`}><i className="change-map-segment" style={{ left: `${start}%`, width: `${distance}%` }}/><i className="change-map-dot is-day1" style={{ left: `${row.day1Baseline}%` }}/><i className="change-map-dot is-final" style={{ left: `${row.final}%` }}/></div>
      </article>;
    })}</div>
  </section>;
}
