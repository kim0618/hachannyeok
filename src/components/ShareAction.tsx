import { useRef, useState } from 'react';
import type { SharePort } from '../infrastructure/share/SharePort';
import { PrimaryButton } from './PrimaryButton';

export function ShareAction({ message, sharePort, statusId }: { message: string; sharePort: SharePort; statusId: string }) {
  const [state, setState] = useState<'idle' | 'sharing' | 'error'>('idle');
  const sharingRef = useRef(false);

  const openShare = async () => {
    if (sharingRef.current) return;
    sharingRef.current = true;
    setState('sharing');
    try {
      await sharePort.open(message);
      setState('idle');
    } catch {
      setState('error');
    } finally {
      sharingRef.current = false;
    }
  };

  return <>
    <PrimaryButton disabled={state === 'sharing'} aria-describedby={state === 'error' ? statusId : undefined} onClick={() => { void openShare(); }}>
      {state === 'sharing' ? '공유 화면 여는 중' : '결과 공유하기'}
    </PrimaryButton>
    {state === 'error' && <p id={statusId} role="alert">공유 화면을 열지 못했어요. 잠시 후 다시 시도해 주세요.</p>}
  </>;
}
