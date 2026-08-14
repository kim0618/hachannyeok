import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createLink, sendMessage } = vi.hoisted(() => ({ createLink: vi.fn(), sendMessage: vi.fn() }));
vi.mock('@apps-in-toss/web-framework', () => ({ Share: { createLink, sendMessage } }));

import { createAppsInTossShare } from './appsInTossShare';

describe('createAppsInTossShare', () => {
  beforeEach(() => { createLink.mockReset(); sendMessage.mockReset(); sendMessage.mockResolvedValue(undefined); });

  it('deep link 미주입 시 message-only로 공식 share sheet를 연다', async () => {
    await createAppsInTossShare().open('결과');
    expect(createLink).not.toHaveBeenCalled();
    expect(sendMessage).toHaveBeenCalledWith({ message: '결과' });
  });

  it('주입된 test/prod deep link로 Toss link를 만들고 메시지에 포함한다', async () => {
    createLink.mockResolvedValue('https://toss.im/share/test');
    await createAppsInTossShare({ deepLink: 'intoss-private://deployment' }).open('결과');
    expect(createLink).toHaveBeenCalledWith({ path: 'intoss-private://deployment' });
    expect(sendMessage).toHaveBeenCalledWith({ message: '결과\nhttps://toss.im/share/test' });
  });

  it('link 생성 실패를 silent message fallback하지 않는다', async () => {
    createLink.mockRejectedValue(new Error('bridge rejected'));
    await expect(createAppsInTossShare({ deepLink: 'intoss://hachannyeok' }).open('결과')).rejects.toThrow('bridge rejected');
    expect(sendMessage).not.toHaveBeenCalled();
  });
});
