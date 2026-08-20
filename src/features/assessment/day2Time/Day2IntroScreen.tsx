import { PrimaryButton } from '../../../components/PrimaryButton';

interface Props { onStart: () => void; targetDurationMs: number; trialCount: number }
const steps = [{ label: 'INTRO', state: 'complete' }, { label: 'PLAIN', state: 'active' }, { label: 'DISTRACTED', state: 'pending' }, { label: 'ANALYSIS', state: 'pending' }, { label: 'COMPLETE', state: 'pending' }] as const;

export function Day2IntroScreen({ onStart, targetDurationMs, trialCount }: Props) {
  const targetSeconds = (targetDurationMs / 1000).toFixed(3);
  return <div className="screen day2-plain-ready">
    <header className="day2-ready-masthead"><span className="day2-ready-back" aria-hidden="true">‹</span><div><strong>DAY 2</strong><h1>시간 감각 · 조건 비교</h1></div><span className="day2-ready-help" aria-hidden="true">?</span></header>
    <ol className="day2-condition-progress" aria-label="DAY 2 진행 단계">{steps.map((step) => <li className={`is-${step.state}`} key={step.label} aria-current={step.state === 'active' ? 'step' : undefined}><span aria-hidden="true">{step.state === 'complete' ? '✓' : ''}</span><strong>{step.label}</strong></li>)}</ol>
    <main className="day2-ready-content">
      <section className="day2-condition-card"><span className="day2-flask" aria-hidden="true" /><div><h2>기본 조건 · PLAIN</h2><p>방해 요소가 없는 환경에서<br />당신의 시간 감각을 측정합니다.</p></div></section>
      <section className="day2-protocol-card" aria-label="측정 안내">
        <div><span className="day2-row-icon icon-clock" aria-hidden="true" /><p><strong>목표 시간</strong><small>디스플레이에 표시된 시간이 {targetSeconds}초가 되는 순간을 정확히 맞춰 탭하세요.</small></p></div>
        <div><span className="day2-row-icon icon-target" aria-hidden="true" /><p><strong>시행 구성</strong><small>{trialCount}회 측정으로 조건별 평균 오차를 계산합니다.</small></p></div>
        <div><span className="day2-row-icon icon-record" aria-hidden="true" /><p><strong>기록 항목</strong><small>반응 시간과 오차를 기록하여 분석에 사용합니다.</small></p></div>
      </section>
      <section className="day2-target-card" aria-label={`목표 시간 ${targetSeconds}초, 현재 조건 PLAIN`}><div className="day2-target-side"><small>목표 시간</small><strong>{targetSeconds}</strong><span>초</span></div><div className="day2-ready-dial" aria-hidden="true"><i /><strong>{targetSeconds}</strong><span>SECONDS</span></div><div className="day2-condition-side"><small>현재 조건</small><strong>PLAIN</strong><span>기본 조건</span></div></section>
      <aside className="day2-ready-note"><span aria-hidden="true">i</span><p>측정 중에는 화면을 주의 깊게 바라봐 주세요.<br />준비가 되면 아래 버튼을 눌러 시작합니다.</p></aside>
    </main>
    <div className="day2-ready-action"><PrimaryButton onClick={onStart}>측정 시작</PrimaryButton><p><span aria-hidden="true">♢</span> 모든 데이터는 안전하게 저장되며 분석에만 사용됩니다.</p></div>
  </div>;
}
