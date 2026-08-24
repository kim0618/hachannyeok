import type { PersistedAppData } from '../storage/types';

export const ABILITIES = ['time', 'center', 'balance', 'control', 'focus'] as const;
export type Ability = (typeof ABILITIES)[number];
export type AbilityScores = Record<Ability, number>;
export type CertificationTier = 'special' | 'grade1' | 'grade2' | 'grade3' | 'observer';
export type EvidenceResult<T> = { ok: true; value: T } | { ok: false; reason: 'insufficientEvidence' | 'calculationFailure' };
export interface NormalizedScore { score: number; quality: number; accuracyQuality: number; consistencyQuality: number }
export interface StabilityResult { stabilityAvailable: boolean; stability?: number; evidenceCount: number }
export type StabilityByAbility = Record<Ability, StabilityResult>;
export type TendencyKey = 'distractionSensitivity' | 'visualBias' | 'multiPartitionBias' | 'surpriseSensitivity' | 'spatialMemorySupport';
export interface Tendency { key: TendencyKey; eligible: boolean; magnitude: number; direction: string; contentKey: string; supportingEvidence: readonly string[] }
export interface Day7Confidence { ability: Ability; evidenceCoverage: number; conditionCoverage: number; stabilityAvailable: boolean; stability?: number }
export interface ProfileResult { profileFamilyKey: string; profileVariantKey: string; supportingEvidenceKeys: readonly string[] }
export type FinalMetric = { status: 'selected'; ability: Ability; magnitude: number } | { status: 'insufficientEvidence' | 'noClearConditionSensitivity' | 'noClearPositiveUpdate' };
export type CrossInsightKey = 'stableStrength' | 'conditionSensitiveStrength' | 'consistentWeakness' | 'positiveUpdate' | 'crossContextResilience';
export interface CrossInsight { key: CrossInsightKey; ability: Ability; magnitude: number; contentKey: string; supportingEvidenceKeys: readonly string[] }
export interface DerivedAnalysis { calibrationVersion: number; overallScoreVersion: 1; overallScore: number; scores: AbilityScores; baselineScores: AbilityScores; preFinalScores: AbilityScores; tendencies: Tendency[]; dominantTendency: Tendency | null; stability: StabilityByAbility; profile: ProfileResult; certifications: Record<Ability, CertificationTier>; finalMetrics: { mostStable: FinalMetric; mostConditionSensitive: FinalMetric; mostPositivelyUpdated: FinalMetric }; crossInsights: CrossInsight[]; selectedFinalAbility: Ability | null }
export type DeriveAnalysisResult = EvidenceResult<DerivedAnalysis>;
export type ScoringEngineInput = PersistedAppData;
export interface ScoringEngineResult { calibrationVersion: number; scores: AbilityScores }
export interface ScoringEngine { score(input: ScoringEngineInput): ScoringEngineResult }
