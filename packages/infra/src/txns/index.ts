import { MintRelatedEventHandler } from './MintRelatedEventHandler';
import { NextPitchHandler } from './NextPitchHandler';
import { PaymentHandler } from './PaymentHandler';
import { PitchRelatedEventHandler } from './PitchRelatedEventHandler';
import { RoundRelatedEventHandler } from './RoundRelatedEventHandler';
import { TxnRouterService } from './TxnRouterService';

export * from './NextPitchHandler';
export * from './PaymentHandler';
export * from './PitchRelatedEventHandler';
export * from './TxnRouterService';

export const txnHandlers = [
    MintRelatedEventHandler,
    NextPitchHandler,
    PaymentHandler,
    PitchRelatedEventHandler,
    RoundRelatedEventHandler,
    TxnRouterService
]