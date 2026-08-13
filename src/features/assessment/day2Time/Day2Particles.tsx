export function Day2Particles() {
  return <div className="day2-particles" aria-hidden="true" data-testid="day2-particles">
    {[1, 2, 3, 4].map((particle) => <span className={`day2-particle particle-${particle}`} key={particle} />)}
  </div>;
}
