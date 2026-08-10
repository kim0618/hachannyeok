interface InfoPillProps {
  children: string;
}

export function InfoPill({ children }: InfoPillProps) {
  return <span className="info-pill">{children}</span>;
}
