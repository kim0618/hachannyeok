import type { DailyAssessmentType, DailyRawResult, FinalAssessmentType, FinalRawResult, Day1RawResult } from '../assessment/results';
import type { LocalDateKey } from '../progression/types';
import type { Ability } from '../scoring/types';
import type { ActiveBaselineSession } from '../session/types';

export type RecordId = string;
export type SessionId = string;
export type ISODateTime = string;
export interface BaselineRecord { recordId: RecordId; sessionId: SessionId; startedAt: ISODateTime; completedAt: ISODateTime; startedLocalDateKey: LocalDateKey; completedLocalDateKey: LocalDateKey; assessmentRawResults: Day1RawResult[] }
export interface DailyRecord { recordId: RecordId; sessionId: SessionId; analysisDay: 2 | 3 | 4 | 5 | 6; assessmentType: DailyAssessmentType; startedAt: ISODateTime; completedAt: ISODateTime; localDateKey: LocalDateKey; rawResult: DailyRawResult }
export interface FinalRecord { recordId: RecordId; sessionId: SessionId; selectedAbility: Ability; assessmentType: FinalAssessmentType; startedAt: ISODateTime; completedAt: ISODateTime; localDateKey: LocalDateKey; rawResult: FinalRawResult }
export interface PersistedAppData { schemaVersion: 1; baseline?: BaselineRecord; dailyRecords: DailyRecord[]; finalRecord?: FinalRecord; activeBaselineSession?: ActiveBaselineSession; metadata: { firstStartedAt?: ISODateTime; lastSuccessfulWriteAt?: ISODateTime } }
export type PersistedRecord = BaselineRecord | DailyRecord | FinalRecord;

