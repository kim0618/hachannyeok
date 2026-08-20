import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../../src/App';
import type { DailyRecord } from '../../src/domain/storage/types';
import { baselineFixture } from '../../src/test/day1Fixture';

const day2: DailyRecord = { recordId:'day2-qa',sessionId:'day2-qa',analysisDay:2,assessmentType:'day2_time_distraction',startedAt:'2026-08-13T01:00:00Z',completedAt:'2026-08-13T01:01:00Z',localDateKey:'2026-08-13',rawResult:{assessmentType:'day2_time_distraction',trials:['plain','distracted','plain','distracted'].map((condition,index)=>({kind:'timeCondition' as const,condition:condition as 'plain'|'distracted',targetDurationMs:3000 as const,observedDurationMs:3000+index*60,trialId:`d2-${index}`,startedAtMs:index,completedAtMs:index+1,valid:true as const,invalidReason:null}))}};
createRoot(document.querySelector<HTMLDivElement>('#app')!).render(<App bypassInitialLoad initialPersistedData={{schemaVersion:1,baseline:baselineFixture,dailyRecords:[day2],metadata:{}}} dateNow={()=>new Date('2026-08-14T12:00:00+09:00')} createSessionId={()=> 'day3-23-qa'}/>);
