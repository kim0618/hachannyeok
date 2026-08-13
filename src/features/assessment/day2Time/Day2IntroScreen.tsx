import { PrimaryButton } from '../../../components/PrimaryButton';

export function Day2IntroScreen({ onStart }: { onStart: () => void }) {
  return <div className="screen ready-screen day2-intro"><header className="progress-header"><span>추가 분석</span><span>1 / 5</span></header><section className="ready-content"><span className="analysis-chip">시간 방해 안정성</span><h1>방해가 있어도<br />3초는 3초일까?</h1><p>이번에는 화면에 다른 움직임이 있어요.<br />신경 쓰지 말고 3초라고 느껴지는 순간 눌러주세요.</p><p className="day2-duration">약 15초</p></section><div className="bottom-action"><PrimaryButton onClick={onStart}>추가 분석 시작</PrimaryButton></div></div>;
}
