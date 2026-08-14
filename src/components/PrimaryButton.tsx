import type { ButtonHTMLAttributes } from 'react';

export function PrimaryButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`primary-button instrument-cta ${className}`.trim()} type="button" {...props} />;
}
