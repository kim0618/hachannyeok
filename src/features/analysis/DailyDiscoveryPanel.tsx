import type { ReactNode } from 'react';

interface Props {
  day: number;
  insight: string;
  nextTeaser: string;
  children?: ReactNode;
}

export function DailyDiscoveryPanel({ day, insight, nextTeaser, children }: Props) {
  return <section className="analysis-hero daily-discovery-panel" aria-label={`DAY ${day} 분석 결과`}>
    <p className="eyebrow">오늘 새로 발견한 것</p>
    <h1>{insight}</h1>
    {children}
    <div className="daily-discovery-progress"><span>7일 분석 진행</span><strong>DAY {day} / 7</strong></div>
    <div className="daily-discovery-next"><span>다음에 확인할 것</span><p>{nextTeaser}</p></div>
  </section>;
}
