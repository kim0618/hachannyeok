import type { ButtonHTMLAttributes } from 'react';

// .primary-button::before/::after의 장식 글리프(⊕, →)가 브라우저 accessible name에 포함되므로
// children이 문자열이면 보이는 텍스트를 그대로 aria-label로 고정한다.
export function PrimaryButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const label = props['aria-label'] ?? (typeof props.children === 'string' ? props.children : undefined);
  return <button className={`primary-button instrument-cta ${className}`.trim()} type="button" {...props} aria-label={label} />;
}
