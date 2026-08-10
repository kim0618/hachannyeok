import { PrimaryButton } from '../components/PrimaryButton';

interface AssessmentIntroScreenProps {
  onBack: () => void;
  onStart: () => void;
}

const assessments = [
  ['3초 맞히기', '3초라고 느껴지는 순간을 확인합니다.'],
  ['중심 찾기', '도형의 한가운데를 짚어봅니다.'],
  ['정확히 반 나누기', '보이는 영역을 반으로 나눕니다.'],
  ['움직임 멈추기', '움직이는 대상을 목표 지점에 멈춥니다.'],
  ['빠르게 찾기', '여러 모양 중 목표를 찾아냅니다.'],
];

export function AssessmentIntroScreen({ onBack, onStart }: AssessmentIntroScreenProps) {
  return (
    <div className="screen intro-screen">
      <button className="back-button" type="button" onClick={onBack} aria-label="홈으로 돌아가기">
        <span aria-hidden="true">←</span> 뒤로
      </button>

      <header className="screen-heading">
        <p className="eyebrow">총 5개 · 약 90초</p>
        <h1>측정 전에 잠깐</h1>
        <p>정답을 오래 고민할 필요는 없습니다. 평소처럼 자연스럽게 해주세요.</p>
      </header>

      <section className="instruction-card" aria-labelledby="assessment-list-title">
        <h2 id="assessment-list-title" className="sr-only">5개 측정 안내</h2>
        <ol className="assessment-list">
          {assessments.map(([name, description], index) => (
            <li key={name}>
              <span className="assessment-number" aria-hidden="true">{index + 1}</span>
              <div>
                <strong>{name}</strong>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <aside className="notice" aria-label="측정 중 주의사항">
        <span aria-hidden="true">!</span>
        <p>앱을 나가거나 화면을 전환하면 현재 시도가 무효가 될 수 있습니다.</p>
      </aside>

      <p className="boundary-copy">재미를 위한 행동 측정 결과이며, 의학·심리 진단이 아닙니다.</p>

      <div className="bottom-action intro-action">
        <PrimaryButton onClick={onStart}>측정 시작</PrimaryButton>
        <button className="secondary-button" type="button" onClick={onBack}>뒤로</button>
      </div>
    </div>
  );
}
