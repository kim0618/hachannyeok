import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App.tsx';

describe('최초 사용자 진입 흐름', () => {
  it('최초 홈에 브랜드와 Primary CTA를 렌더한다', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: '하찮력' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '하찮력 측정 시작' })).toBeInTheDocument();
  });

  it('홈 CTA를 누르면 5개 측정 안내와 시작 CTA를 보여준다', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '하찮력 측정 시작' }));

    expect(screen.getByRole('heading', { level: 1, name: '측정 전에 잠깐' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByRole('button', { name: '측정 시작' })).toBeInTheDocument();
  });

  it('안내 화면에서 뒤로 누르면 홈으로 돌아간다', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '하찮력 측정 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '홈으로 돌아가기' }));

    expect(screen.getByRole('heading', { level: 1, name: '하찮력' })).toBeInTheDocument();
  });

  it('측정 시작을 누르면 첫 시간 감각 준비 화면으로 이동한다', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '하찮력 측정 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));

    expect(screen.getByText('시간 감각')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /3초라고 느껴질 때/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '첫 번째 시간 감각 측정 시작 준비' })).toBeInTheDocument();
  });

  it('준비 화면 CTA가 실제 시간 감각 READY 화면으로 연결된다', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '하찮력 측정 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '첫 번째 시간 감각 측정 시작 준비' }));

    expect(screen.getByRole('heading', { name: /시작하면 시간이/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '시작하기' })).toBeInTheDocument();
  });

  it('Home → Intro → Time 완료 후 Center Ready로 연결된다', () => {
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => { now += 3000; return now; });
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '하찮력 측정 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '측정 시작' }));
    fireEvent.click(screen.getByRole('button', { name: '첫 번째 시간 감각 측정 시작 준비' }));
    for (let trial = 0; trial < 3; trial += 1) {
      fireEvent.click(screen.getByRole('button', { name: trial === 0 ? '시작하기' : '다음 측정' }));
      fireEvent.click(screen.getByRole('button', { name: '지금!' }));
    }
    fireEvent.click(screen.getByRole('button', { name: '다음 측정' }));
    expect(screen.getByRole('heading', { name: '중심 감각' })).toBeInTheDocument();
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
  });
});
