interface AssessmentPreviewItemProps {
  icon: string;
  label: string;
}

export function AssessmentPreviewItem({ icon, label }: AssessmentPreviewItemProps) {
  return (
    <li className="preview-item">
      <span className="preview-icon" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </li>
  );
}
