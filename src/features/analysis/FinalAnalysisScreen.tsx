import { PrecisionCertificationSeal } from '../../components/PrecisionCertificationSeal';
import { ABILITIES, type DeriveAnalysisResult, type FinalMetric } from '../../domain/scoring/types';
import { selectRepresentativeCertification } from '../../domain/scoring/representativeCertification';
import type { BaselineRecord, DailyRecord, FinalRecord } from '../../domain/storage/types';
import { ABILITY_LABELS, CERTIFICATION_LABELS, profileAbilities, profileDisplay, profileVariantDisplay, summarizeDay1Evidence } from './basicAnalysisContent';
import { crossInsightCopy, cumulativeEvidenceRows, selectPresentedCrossInsights } from './finalAnalysisContent';
import { AbilityCompactSummary } from './AnalysisPresentation';
import { ShareAction } from '../../components/ShareAction';
import type { SharePort } from '../../infrastructure/share/SharePort';
import { appsInTossShare } from '../../infrastructure/share/appsInTossShare';
import { finalShareMessage } from '../../infrastructure/share/shareMessage';

interface Props {
  baseline?: BaselineRecord;
  dailyRecords?: readonly DailyRecord[];
  finalRecord?: FinalRecord;
  analysis?: DeriveAnalysisResult;
  saveStatus: 'saving' | 'saved' | 'failed';
  onRetrySave?: () => void;
  onHome?: () => void;
  sharePort?: SharePort;
}

const metricCopy = (metric: FinalMetric, fallback: string) => metric.status === 'selected'
  ? ABILITY_LABELS[metric.ability]
  : fallback;

export function FinalAnalysisScreen({ baseline, dailyRecords = [], finalRecord, analysis, saveStatus, onRetrySave, onHome, sharePort = appsInTossShare }: Props) {
  if (!baseline || !analysis?.ok) return <div className="screen analysis-error"><section role="alert"><h1>최종 분석을 표시할 수 없습니다.</h1><p>저장된 측정 근거를 다시 확인해 주세요.</p></section></div>;
  const value = analysis.value;
  const profile = profileAbilities(value.profile);
  const profileLabel = profileDisplay(value.profile);
  if (!profile || !profileLabel) return <div className="screen analysis-error"><section role="alert"><h1>최종 프로필을 표시할 수 없습니다.</h1></section></div>;
  const representative = selectRepresentativeCertification(value.certifications, value.scores);
  const evidence = summarizeDay1Evidence(baseline.assessmentRawResults);
  const cumulative = cumulativeEvidenceRows(baseline, dailyRecords, finalRecord);
  const presentedCrossInsights = selectPresentedCrossInsights(value.crossInsights);
  return <div className="screen analysis-screen final-analysis-screen">
    <header className="analysis-record-header"><span>쓸능검 · 최종 분석서</span><span>CAL-{value.calibrationVersion} / OS-{value.overallScoreVersion}</span></header>
    <main>
      <section className="analysis-hero final-report-hero" aria-labelledby="final-analysis-title"><div className="final-report-status" aria-hidden="true"><span>FINAL REPORT</span><strong>7 / 7 COMPLETE</strong></div><p className="eyebrow">최종 분석 완료</p><div className="score-rule"/><strong className="overall-score">{value.overallScore}</strong><p className="score-label">최종 종합 쓸능검</p><h1 id="final-analysis-title">{profileLabel}</h1><span className="analysis-chip">{profileVariantDisplay(value.profile.profileVariantKey)}</span><div className="certification-hero"><PrecisionCertificationSeal/><div className="certification-copy"><span>최종 주요 자격 인증</span><strong>{CERTIFICATION_LABELS[representative.ability][representative.tier]}</strong><small>{ABILITY_LABELS[representative.ability]} 누적 측정 기반 · 앱 내 가상 자격</small></div></div><AbilityCompactSummary scores={value.scores} high={profile.high} low={profile.low} label="최종 분석 5개 능력 요약" /></section>
      <section className="report-section"><div className="section-index">01 · FINAL ABILITY</div><h2>최종 5개 능력치</h2><div className="ability-score-list">{ABILITIES.map(ability=><div className="ability-score-row" key={ability}><div><span>{ABILITY_LABELS[ability]}</span><strong>{value.scores[ability]}</strong></div><div className="ability-track"><span style={{width:`${value.scores[ability]}%`}}/></div></div>)}</div></section>
      <section className="report-grid final-metric-grid" aria-label="최종 분석 대표 지표"><article className="report-section compact"><div className="section-index">MOST STABLE</div><h2>{metricCopy(value.finalMetrics.mostStable,'충분한 근거 없음')}</h2><p>가장 안정적으로 유지된 능력</p></article><article className="report-section compact"><div className="section-index">CONDITION-SENSITIVE</div><h2>{metricCopy(value.finalMetrics.mostConditionSensitive,'뚜렷한 조건 민감도 없음')}</h2><p>조건 변화에 가장 민감했던 능력</p></article><article className="report-section compact"><div className="section-index">POSITIVELY UPDATED</div><h2>{metricCopy(value.finalMetrics.mostPositivelyUpdated,'뚜렷한 상승 없음')}</h2><p>추가 분석에서 가장 긍정적으로 보정된 능력</p></article></section>
      <section className="report-section cross-insight-section"><div className="section-index">02 · CROSS INSIGHT</div><h2>누적 조건 해석</h2>{presentedCrossInsights.length ? <ul className="insight-list">{presentedCrossInsights.map(insight=><li key={`${insight.key}:${insight.ability}`}><small>ANALYSIS NOTE</small>{crossInsightCopy(insight)}</li>)}</ul> : <p>조건을 가로질러 단정할 만큼 뚜렷한 패턴은 아직 없어요.</p>}</section>
      <section className="report-grid"><article className="report-section compact"><div className="section-index">STRENGTH</div><h2>{ABILITY_LABELS[profile.high]}</h2><p>누적 측정에서 상대적으로 높은 강점입니다.</p></article><article className="report-section compact"><div className="section-index">WATCH</div><h2>{ABILITY_LABELS[profile.low]}</h2><p>상황에 따라 한 번 더 확인할 보완 영역입니다.</p></article><article className="report-section compact"><div className="section-index">HANDLING NOTE</div><h2>취급 주의사항</h2><p>{ABILITY_LABELS[profile.low]}이 필요한 순간에는 결과를 한 번 더 확인해 주세요.</p></article></section>
      <section className="report-section cumulative-evidence-section"><div className="section-index">03 · CUMULATIVE EVIDENCE</div><h2>누적 실제 측정 근거</h2><div className="evidence-disclosures">{evidence.map(item=><EvidenceDisclosure key={item.ability} title={`DAY 1 · ${item.title}`} value={item.value}/>)}{cumulative.map(item=><EvidenceDisclosure key={item.key} title={item.title} value={item.value}/>)}</div><p>각 날짜의 실제 raw evidence가 최종 점수와 조건 해석에 함께 반영됐습니다.</p></section>
      {saveStatus==='saving'&&<p role="status" className="storage-status">최종 분석을 기기에 저장하고 있습니다.</p>}
      {saveStatus==='failed'&&<div role="alert" className="storage-warning"><p>최종 분석을 저장하지 못했습니다.</p>{onRetrySave&&<button className="secondary-button" onClick={onRetrySave}>다시 저장</button>}</div>}
      <p className="boundary-copy">재미를 위한 행동 측정 결과이며, 의학·심리 진단이 아닙니다.</p>
      <div className="analysis-actions"><ShareAction message={finalShareMessage(value)} sharePort={sharePort} statusId="final-share-status"/>{onHome&&<button className="secondary-button" onClick={onHome}>홈으로</button>}</div>
    </main>
  </div>;
}

function EvidenceDisclosure({title,value}:{title:string;value:string}){
  const representative=value.split(' · ')[0]??value;
  return <details className="evidence-disclosure"><summary><span className="evidence-summary-title">{title}</span><strong className="evidence-summary-value">{representative}</strong></summary><p>{value}</p></details>;
}
