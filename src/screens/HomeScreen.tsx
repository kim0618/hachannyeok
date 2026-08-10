import { AssessmentPreviewItem } from '../components/AssessmentPreviewItem';
import { InfoPill } from '../components/InfoPill';
import { PrimaryButton } from '../components/PrimaryButton';

interface HomeScreenProps {
  onStart: () => void;
}

const abilities = [
  { icon: '◷', label: '시간 감각' },
  { icon: '⌖', label: '중심 감각' },
  { icon: '◒', label: '균형 분배' },
  { icon: '⌁', label: '손가락 통제' },
  { icon: '◎', label: '시각 집중' },
];

export function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <div className="screen home-screen">
      <header className="brand-header">
        <span className="brand-mark" aria-hidden="true">ㅎ</span>
        <span className="brand-name">하찮력 측정소</span>
      </header>

      <section className="hero" aria-labelledby="home-title">
        <p className="eyebrow">별 쓸모는 없지만, 일단 재봅니다</p>
        <h1 id="home-title">하찮력</h1>
        <p className="hero-copy">쓸데없지만 이상하게 궁금한 능력을 측정합니다.</p>
        <p className="hero-description">
          약 90초 동안 몇 가지 간단한 행동을 측정해<br className="wide-only" />
          당신의 하찮은 능력 사용설명서를 만듭니다.
        </p>
      </section>

      <section className="ability-card" aria-labelledby="ability-title">
        <div className="card-heading">
          <h2 id="ability-title">측정 항목</h2>
          <span>총 5개</span>
        </div>
        <ul className="ability-grid">
          {abilities.map((ability) => <AssessmentPreviewItem key={ability.label} {...ability} />)}
        </ul>
      </section>

      <div className="home-meta" aria-label="검사 정보">
        <InfoPill>약 90초</InfoPill>
        <InfoPill>로그인 없이 진행</InfoPill>
        <InfoPill>결과는 기기에 저장</InfoPill>
      </div>

      <p className="boundary-copy">재미를 위한 행동 측정이며, 의학·심리 진단이 아닙니다.</p>

      <div className="bottom-action">
        <PrimaryButton onClick={onStart}>하찮력 측정 시작</PrimaryButton>
      </div>
    </div>
  );
}
