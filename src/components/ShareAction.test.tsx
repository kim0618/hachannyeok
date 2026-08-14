import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ShareAction } from './ShareAction';

describe('ShareAction', () => {
  it('sharing 중 disabled이며 빠른 연속 클릭에도 sheet를 한 번만 요청한다', async () => {
    let resolveShare: () => void = () => undefined;
    const open = vi.fn(() => new Promise<void>((resolve) => { resolveShare = resolve; }));
    render(<ShareAction message="결과" sharePort={{ open }} statusId="share-status"/>);
    const button = screen.getByRole('button', { name: '결과 공유하기' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(open).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '공유 화면 여는 중' })).toBeDisabled();
    resolveShare();
    await waitFor(() => expect(screen.getByRole('button', { name: '결과 공유하기' })).toBeEnabled());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('rejection 후 결과를 유지하고 오류를 표시하며 재시도한다', async () => {
    const open = vi.fn().mockRejectedValueOnce(new Error('cancel')).mockResolvedValueOnce(undefined);
    render(<div><h1>최종 분석 완료</h1><ShareAction message="결과" sharePort={{ open }} statusId="share-status"/></div>);
    fireEvent.click(screen.getByRole('button', { name: '결과 공유하기' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('공유 화면을 열지 못했어요. 잠시 후 다시 시도해 주세요.');
    expect(screen.getByRole('heading', { name: '최종 분석 완료' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '결과 공유하기' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(open).toHaveBeenCalledTimes(2);
  });
});
