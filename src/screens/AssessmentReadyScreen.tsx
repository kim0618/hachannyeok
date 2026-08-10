import { PrimaryButton } from '../components/PrimaryButton';

interface AssessmentReadyScreenProps { onStart: () => void }

export function AssessmentReadyScreen({ onStart }: AssessmentReadyScreenProps) {
  return (
    <div className="screen ready-screen">
      <header className="progress-header">
        <span>첫 번째 측정</span>
        <span>1 / 5</span>
      </header>

      <section className="ready-content" aria-labelledby="ready-title">
        <div className="measurement-symbol" aria-hidden="true">
          <span>3</span>
          <small>초</small>
        </div>
        <p className="eyebrow">시간 감각</p>
        <h1 id="ready-title">3초라고 느껴질 때<br />눌러주세요.</h1>
        <p>다음 화면에서 시작하면 시간 표시 없이 측정합니다.</p>
      </section>

      <div className="bottom-action">
        <PrimaryButton aria-label="첫 번째 시간 감각 측정 시작 준비" onClick={onStart}>시작하기</PrimaryButton>
      </div>
    </div>
  );
}
