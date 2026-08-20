import type { ReactNode } from 'react';
import { timeResultMarkerPosition } from './time/timeResultMarker';

interface InstrumentProps { className?: string; children?: ReactNode }
const Frame = ({ className = '', children }: InstrumentProps) => <div className={`assessment-instrument ${className}`.trim()} aria-hidden="true">{children}</div>;

export function TimeInstrument({ mode = 'ready', actualMs }: { mode?: 'ready' | 'running' | 'result'; actualMs?: number }) {
  const actualPosition = timeResultMarkerPosition(actualMs ?? 3000);
  return <Frame className={`time-instrument time-instrument-${mode}`}><div className="time-crown"><i /><i /></div><div className="time-dial">{mode !== 'running' && <><strong>3.000</strong><span>{mode === 'ready' ? 'REFERENCE' : 'TARGET'}</span></>}</div>{mode === 'result' && <div className="time-scale"><i className="time-target-tick" /><i className="time-actual-tick" style={{ left: `${actualPosition}%` }} /></div>}</Frame>;
}

export function CenterInstrument() { return <Frame className="center-instrument"><div className="optical-frame"><i /><i /><i /><i /></div></Frame>; }
export function BalanceInstrument() { return <Frame className="balance-instrument"><div className="partition-preview"><i className="partition-rail" /><i className="partition-divider" /><b /></div></Frame>; }
export function ControlInstrument() { return <Frame className="control-instrument"><div className="movement-preview"><i className="movement-rail" /><i className="movement-marker" /><i className="movement-target" /></div></Frame>; }

const neutralCells = Array.from({ length: 12 }, (_, index) => index);
export function FocusInstrument() { return <Frame className="focus-instrument"><div className="search-preview">{neutralCells.map(index => <i key={index} className={index % 3 === 0 ? 'neutral-ring' : ''} />)}</div></Frame>; }
export function MemoryInstrument() { return <Frame className="memory-instrument"><svg viewBox="0 0 180 112"><path d="M28 75 L84 23 L151 69" /><circle cx="28" cy="75" r="6" /><circle cx="84" cy="23" r="6" /><circle cx="151" cy="69" r="6" /></svg><span>OBSERVE · HOLD · RECALL</span></Frame>; }

export function InstrumentReadyContent({ instrument, eyebrow, titleId, title, children }: { instrument: ReactNode; eyebrow?: string; titleId?: string; title: ReactNode; children: ReactNode }) {
  return <section className="ready-content identity-ready-content" aria-labelledby={titleId}>{instrument}{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1 id={titleId}>{title}</h1><p>{children}</p></section>;
}
