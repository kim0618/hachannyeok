import { PrimaryButton } from '../../../components/PrimaryButton';
import { MemoryInstrument } from '../AssessmentInstruments';
export function Day6IntroScreen({onStart}:{onStart:()=>void}){return <div className="screen daily-intro-screen memory-ready-screen"><main><p className="eyebrow">추가 분석 5 / 5</p><MemoryInstrument/><h1>방금 본 위치,<br/>얼마나 남아 있을까요?</h1><p>잠깐 나타나는 위치를 기억했다가<br/>화면이 비면 같은 자리를 다시 선택해 주세요.</p><p className="duration-copy">약 10~20초</p></main><div className="bottom-action"><PrimaryButton onClick={onStart}>추가 분석 시작</PrimaryButton></div></div>}
