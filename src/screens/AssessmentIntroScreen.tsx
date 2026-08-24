interface AssessmentIntroScreenProps {
  onBack: () => void;
  onStart: () => void;
}

export function AssessmentIntroScreen({ onBack, onStart }: AssessmentIntroScreenProps) {
  return (
    <div className="screen intro-screen intro-reference-shell">
      <section className="seven-day-visible-journey" aria-label="7일 분석 과정">
        <p>오늘 기준점을 만들고, 7일 동안 조건별 반응을 확인합니다.</p>
        <div>
          <span><b>DAY 1</b>기준점</span>
          <i aria-hidden="true">→</i>
          <span><b>DAY 2–6</b>조건 변화</span>
          <i aria-hidden="true">→</i>
          <span><b>DAY 7</b>최종 보정</span>
        </div>
      </section>
      <div className="intro-reference-poster">
        <img src="/assets/intro-reference.png" alt="" aria-hidden="true" draggable="false" />
        <div className="intro-interaction-layer">
          <button className="intro-reference-start" type="button" aria-label="측정 시작" onClick={onStart} />
          <button className="intro-reference-back" type="button" aria-label="홈으로 돌아가기" onClick={onBack} />
        </div>
      </div>

      <div className="sr-only intro-accessible-summary">
        <h1>측정 전에 잠깐</h1>
        <h2>쓸능검</h2>
        <p>쓸데없는 능력 정밀검사</p>
        <p>총 5개 · 약 90초</p>
        <p>정답을 오래 고민할 필요는 없습니다. 평소처럼 자연스럽게 해주세요.</p>
        <ol>
          <li>3초 맞히기</li>
          <li>중심 찾기</li>
          <li>정확히 반 나누기</li>
          <li>움직임 멈추기</li>
          <li>빠르게 찾기</li>
        </ol>
        <p>앱을 나가거나 화면을 전환하면 현재 시도가 무효가 될 수 있습니다.</p>
        <p>재미를 위한 행동 측정 결과이며, 의학·심리 진단이 아닙니다.</p>
      </div>
    </div>
  );
}
