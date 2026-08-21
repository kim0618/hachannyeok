interface HomeScreenProps {
  onStart: () => void;
}

export function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <div className="screen home-screen home-reference-shell">
      <section className="seven-day-visible-journey" aria-label="7일 분석 과정">
        <p>7일 동안 조건을 바꿔 최종 결과를 완성합니다.</p>
        <div>
          <span><b>DAY 1</b>기준 측정</span>
          <i aria-hidden="true">→</i>
          <span><b>DAY 2–6</b>조건 변화</span>
          <i aria-hidden="true">→</i>
          <span><b>DAY 7</b>최종 보정</span>
        </div>
      </section>
      <div className="home-reference-poster">
        <img src="/assets/home-reference.png" alt="" aria-hidden="true" draggable="false" />
        <div className="home-interaction-layer">
          <button
            className="primary-button instrument-cta home-reference-cta"
            type="button"
            aria-label="쓸능검 측정 시작"
            onClick={onStart}
          />
        </div>
      </div>

      <div className="sr-only home-accessible-summary">
        <h1>쓸데없는 능력을 필요 이상으로 정밀하게 측정합니다</h1>
        <h2>쓸능검</h2>
        <p>쓸데없는 능력 정밀검사</p>
        <ul>
          <li>약 90초</li>
          <li>총 5개 검사</li>
          <li>기기에만 저장</li>
        </ul>
        <p>결과는 취업, 연애, 재산 형성에 영향을 주지 않습니다.</p>
        <p>재미를 위한 행동 측정이며, 의학·심리 진단이 아닙니다.</p>
      </div>
    </div>
  );
}
