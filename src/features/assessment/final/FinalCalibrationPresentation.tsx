export function FinalCalibrationSeal({ compact = false }: { compact?: boolean }) {
  return <span className={`final-calibration-seal${compact ? ' is-compact' : ''}`} aria-hidden="true">
    <small>FINAL</small><strong>07</strong><em>CALIBRATION</em>
  </span>;
}
