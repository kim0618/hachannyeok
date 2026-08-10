import { PrimaryButton } from '../components/PrimaryButton';

export function AssessmentReadyScreen() {
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
        <p>버튼을 누르면 안내만 마치고 준비 상태로 이동합니다. 실제 측정은 아직 시작되지 않습니다.</p>
      </section>

      <div className="bottom-action">
        <PrimaryButton aria-label="첫 번째 시간 감각 측정 시작 준비">시작하기</PrimaryButton>
      </div>
    </div>
  );
}
