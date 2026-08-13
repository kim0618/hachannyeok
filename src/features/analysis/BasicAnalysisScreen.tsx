import { PrimaryButton } from '../../components/PrimaryButton';
import type { BaselineRecord } from '../../domain/storage/types';
import type { DeriveAnalysisResult } from '../../domain/scoring/types';
import { ABILITIES } from '../../domain/scoring/types';
import { selectRepresentativeCertification } from '../../domain/scoring/representativeCertification';
import { ABILITY_LABELS, CERTIFICATION_LABELS, profileAbilities, profileDisplay, profileVariantDisplay, summarizeDay1Evidence } from './basicAnalysisContent';

interface Props { baseline?: BaselineRecord; analysis?: DeriveAnalysisResult; dailyCount?: number; onRestart: () => void; onHome?: () => void; saveStatus?: 'saving' | 'saved' | 'failed'; onRetrySave?: () => void }

export function BasicAnalysisScreen({ baseline, analysis, dailyCount = 0, onRestart, onHome, saveStatus = 'saved', onRetrySave }: Props) {
  if (!baseline) return <AnalysisError title="측정 기록을 찾을 수 없습니다." action="측정 시작으로 돌아가기" onAction={onRestart} />;
  if (!analysis?.ok) return <AnalysisError title="분석에 필요한 기록이 충분하지 않습니다." action="처음부터 다시 측정" onAction={onRestart} />;
  const value = analysis.value;
  const profile = profileAbilities(value.profile);
  const profileLabel = profileDisplay(value.profile);
  if (!profile || !profileLabel) return <AnalysisError title="분석에 필요한 기록이 충분하지 않습니다." action="처음부터 다시 측정" onAction={onRestart} />;
  const representative = selectRepresentativeCertification(value.certifications, value.scores);
  const evidence = summarizeDay1Evidence(baseline.assessmentRawResults);
  return <div className="screen analysis-screen">
    <header className="analysis-record-header"><span>하찮력 · {dailyCount > 0 ? '내 분석서' : '기본 분석'}</span><span>CAL-{value.calibrationVersion} / OS-{value.overallScoreVersion}</span></header>
    <main>
      <section className="analysis-hero" aria-labelledby="analysis-title"><p className="eyebrow">기본 분석 완료</p><div className="score-rule" /><strong className="overall-score">{value.overallScore}</strong><p className="score-label">종합 하찮력</p><h1 id="analysis-title">{profileLabel}</h1><span className="analysis-chip">{profileVariantDisplay(value.profile.profileVariantKey)}</span><div className="certification-hero"><span>대표 자격</span><strong>{CERTIFICATION_LABELS[representative.ability][representative.tier]}</strong></div></section>
      <section className="report-section"><div className="section-index">01 · ABILITY</div><h2>5개 능력치</h2><div className="ability-score-list">{ABILITIES.map((ability) => <div className="ability-score-row" key={ability}><div><span>{ABILITY_LABELS[ability]}</span><strong>{value.scores[ability]}</strong></div><div className="ability-track"><span style={{ width: `${value.scores[ability]}%` }} /></div></div>)}</div></section>
      <section className="report-section"><div className="section-index">02 · RAW EVIDENCE</div><h2>실제 측정 근거</h2><div className="evidence-list">{evidence.map((item) => <div key={item.ability}><span>{item.title}</span><strong>{item.value}</strong></div>)}</div></section>
      <section className="report-grid"><article className="report-section compact"><div className="section-index">STRENGTH</div><h2>{ABILITY_LABELS[profile.high]}</h2><p>다섯 측정 중 가장 높은 능력으로 확인됐습니다.</p></article><article className="report-section compact"><div className="section-index">WATCH</div><h2>{ABILITY_LABELS[profile.low]}</h2><p>현재 결과에서 가장 낮게 측정된 보완 영역입니다.</p></article></section>
      <section className="report-section"><div className="section-index">03 · BASIC MANUAL</div><h2>기본 사용설명서</h2><dl className="manual-list"><div><dt>강점</dt><dd>{ABILITY_LABELS[profile.high]}이 필요한 사소한 순간에 비교적 믿어볼 만합니다.</dd></div><div><dt>보완</dt><dd>{ABILITY_LABELS[profile.low]}은 한 번 더 확인하면 안전합니다.</dd></div><div><dt>취급 주의사항</dt><dd>활용처는 아직 확인되지 않았습니다. 추가 훈련은 권장하지 않습니다.</dd></div></dl></section>
      <section className="analysis-stage-card"><span className="analysis-chip">{dailyCount > 0 ? `심화 분석 ${dailyCount}/5` : '기본 분석 완료'}</span><h2>현재 측정 결과가 완성됐습니다.</h2><p>{dailyCount > 0 ? '추가 조건의 측정 근거가 분석서에 반영됐습니다.' : '추가 분석을 하면 다른 조건에서의 당신의 패턴을 더 확인할 수 있어요.'}</p></section>
      <p className="storage-copy">분석 결과는 현재 기기에 저장됩니다. 앱 데이터가 삭제되면 분석 기록도 복구할 수 없습니다.</p>
      {saveStatus === 'saving' && <p role="status" className="storage-status">결과를 기기에 저장하고 있습니다.</p>}
      {saveStatus === 'failed' && <div role="alert" className="storage-warning"><p>결과를 기기에 저장하지 못했습니다.</p>{onRetrySave && <button className="secondary-button" type="button" onClick={onRetrySave}>다시 저장</button>}</div>}
      <p className="boundary-copy">재미를 위한 행동 측정 결과이며, 의학·심리 진단이 아닙니다.</p>
      <div className="analysis-actions"><PrimaryButton disabled aria-describedby="share-status">결과 공유하기</PrimaryButton><p id="share-status">공유 기능은 준비 중입니다.</p><button className="secondary-button" type="button" disabled aria-describedby="detail-status">상세 분석 보기</button><p id="detail-status">상세 분석은 준비 중입니다.</p>{onHome && <button className="secondary-button" type="button" onClick={onHome}>홈으로</button>}</div>
    </main>
  </div>;
}

function AnalysisError({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  return <div className="screen analysis-error"><section role="alert"><p className="eyebrow">분석 중단</p><h1>{title}</h1><p>완료된 다섯 개 측정 기록을 다시 확인해 주세요.</p></section><div className="bottom-action"><PrimaryButton onClick={onAction}>{action}</PrimaryButton></div></div>;
}
