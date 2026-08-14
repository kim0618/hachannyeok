import type { Ability, AbilityScores } from '../../domain/scoring/types';
import { ABILITIES } from '../../domain/scoring/types';
import { ABILITY_LABELS } from './basicAnalysisContent';

export function AbilityCompactSummary({ scores, high, low, label }: { scores: AbilityScores; high: Ability; low: Ability; label: string }) {
  return <div className="ability-compact-summary" aria-label={label}>
    {ABILITIES.map(ability => <div key={ability} className={ability === high ? 'is-profile-high' : ability === low ? 'is-profile-low' : undefined}>
      <span>{ABILITY_LABELS[ability]}</span><strong>{scores[ability]}</strong>
      {ability === high && <small>강점</small>}{ability === low && <small>보완</small>}
    </div>)}
  </div>;
}

export function EvidenceReportRows({ rows }: { rows: readonly { ability: Ability; title: string; value: string }[] }) {
  return <div className="evidence-list evidence-report-rows">{rows.map(item => {
    const [primary, ...secondary] = item.value.split(' · ');
    return <div key={item.ability}><span>{item.title}</span><strong>{primary}</strong>{secondary.length > 0 && <small>{secondary.join(' · ')}</small>}</div>;
  })}</div>;
}
