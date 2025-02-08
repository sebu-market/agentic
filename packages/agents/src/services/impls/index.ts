import { ALLMFactory, APromptManager, AScreeningSummarizer, APitchSummarizer } from '../interfaces';
import { ContextFormatter } from './ContextFormatter';
import { LLMFactory } from './LLMFactory';
import { PitchSummarizer } from './PitchSummarizer';
import { ScreeningSummarizer } from './ScreeningSummarizer';
import { SSMPromptManager } from './SSMPromptManager';



export * from './LLMFactory';
export * from './ContextFormatter';
export * from './SSMPromptManager';
export * from './ScreeningSummarizer';
export * from './PitchSummarizer';

export const allServices = [
    ContextFormatter,
    {
        provide: ALLMFactory,
        useClass: LLMFactory
    },
    {
        provide: APromptManager,
        useClass: SSMPromptManager
    },
    {
        provide: AScreeningSummarizer,
        useClass: ScreeningSummarizer
    },
    {
        provide: APitchSummarizer,
        useClass: PitchSummarizer
    }
]